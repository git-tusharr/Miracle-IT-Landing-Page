const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9261',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_test_stroke'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9261/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };
  const send = (method, params = {}) => {
    const curId = id++;
    return new Promise(resolve => {
      callbacks.set(curId, resolve);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');

  const logoB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo.png')).toString('base64');
  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const addWhiteKeyline = async (b64, isSquare) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await new Promise(r => img.onload = r);

        const can = document.createElement('canvas');
        can.width = img.naturalWidth;
        can.height = img.naturalHeight;
        const ctx = can.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, can.width, can.height);
        const d = imgData.data;
        const w = can.width;
        const h = can.height;

        // Mask where dark grey text is located
        // In horizontal logo: y >= 250
        // In square logo: y >= 680
        const yThreshold = isSquare ? 680 : 250;
        const greyMask = new Uint8Array(w * h);

        for (let y = yThreshold; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const a = d[idx + 3];
            if (a > 40) {
              const r = d[idx], g = d[idx+1], b = d[idx+2];
              // Dark grey text has r, g, b around 40-100 with low color saturation
              const maxVal = Math.max(r, g, b);
              const minVal = Math.min(r, g, b);
              if (maxVal - minVal < 22 && maxVal < 140) {
                greyMask[y * w + x] = 1;
              }
            }
          }
        }

        // Create an underlay canvas with dilated white stroke
        const underCan = document.createElement('canvas');
        underCan.width = w;
        underCan.height = h;
        const underCtx = underCan.getContext('2d');
        const underData = underCtx.createImageData(w, h);
        const ud = underData.data;

        // Radius for stroke: 3 pixels
        const radius = 3;
        for (let y = yThreshold - 5; y < Math.min(h, h + radius); y++) {
          for (let x = 0; x < w; x++) {
            if (greyMask[y * w + x]) continue; // already text
            // Check distance to nearest grey pixel
            let minDistSq = 999;
            for (let dy = -radius; dy <= radius; dy++) {
              const ny = y + dy;
              if (ny < yThreshold || ny >= h) continue;
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                if (greyMask[ny * w + nx]) {
                  const dSq = dx * dx + dy * dy;
                  if (dSq < minDistSq) minDistSq = dSq;
                }
              }
            }
            if (minDistSq <= radius * radius) {
              const dist = Math.sqrt(minDistSq);
              // Smooth anti-aliased edge
              let alpha = 1;
              if (dist > radius - 1) {
                alpha = 1 - (dist - (radius - 1));
              }
              const uidx = (y * w + x) * 4;
              ud[uidx] = 255;
              ud[uidx + 1] = 255;
              ud[uidx + 2] = 255;
              ud[uidx + 3] = Math.round(alpha * 240);
            }
          }
        }
        underCtx.putImageData(underData, 0, 0);

        // Composite: underlay (crisp white outline) + original image on top
        const finalCan = document.createElement('canvas');
        finalCan.width = w;
        finalCan.height = h;
        const finalCtx = finalCan.getContext('2d');
        finalCtx.drawImage(underCan, 0, 0);
        finalCtx.drawImage(can, 0, 0);

        return finalCan.toDataURL('image/png');
      };

      return {
        horizontal: await addWhiteKeyline('${logoB64}', false),
        square: await addWhiteKeyline('${sqB64}', true)
      };
    })()`
  });

  const val = evalRes.result.result.value;
  fs.writeFileSync('scratch/logo_keyline.png', Buffer.from(val.horizontal.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync('scratch/logo_square_keyline.png', Buffer.from(val.square.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved keyline logos to scratch/');

  chrome.kill();
  process.exit(0);
}
run();
