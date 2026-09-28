const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9263',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_test_fine'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9263/json');
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
      const createFineContourLogo = async (b64, isSquare) => {
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

        const yThreshold = isSquare ? 700 : 260;
        const greyMask = new Float32Array(w * h);

        // Map dark grey text with strength
        for (let y = yThreshold; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const a = d[idx + 3];
            if (a > 30) {
              const r = d[idx], g = d[idx+1], b = d[idx+2];
              const maxVal = Math.max(r, g, b);
              const minVal = Math.min(r, g, b);
              if (maxVal - minVal < 25 && maxVal < 150) {
                // Weight by alpha and lightness
                greyMask[y * w + x] = a / 255;
              }
            }
          }
        }

        // Create fine 2px contour underlay
        const underCan = document.createElement('canvas');
        underCan.width = w;
        underCan.height = h;
        const underCtx = underCan.getContext('2d');
        const underData = underCtx.createImageData(w, h);
        const ud = underData.data;

        const radius = 2.2;
        const rCeil = Math.ceil(radius);

        for (let y = yThreshold - 4; y < Math.min(h, h + rCeil); y++) {
          for (let x = 0; x < w; x++) {
            if (greyMask[y * w + x] > 0.8) continue; // inside letter

            let maxInfluence = 0;
            for (let dy = -rCeil; dy <= rCeil; dy++) {
              const ny = y + dy;
              if (ny < yThreshold || ny >= h) continue;
              for (let dx = -rCeil; dx <= rCeil; dx++) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                const mVal = greyMask[ny * w + nx];
                if (mVal > 0) {
                  const dist = Math.hypot(dx, dy);
                  if (dist <= radius) {
                    const falloff = (1 - dist / radius) * mVal;
                    if (falloff > maxInfluence) maxInfluence = falloff;
                  }
                }
              }
            }

            if (maxInfluence > 0.05) {
              const uidx = (y * w + x) * 4;
              // Clean silver-white luminous halo
              ud[uidx] = 255;
              ud[uidx + 1] = 255;
              ud[uidx + 2] = 255;
              ud[uidx + 3] = Math.round(Math.min(1, maxInfluence * 1.5) * 230);
            }
          }
        }
        underCtx.putImageData(underData, 0, 0);

        // Composite underlay + crisp image
        const finalCan = document.createElement('canvas');
        finalCan.width = w;
        finalCan.height = h;
        const finalCtx = finalCan.getContext('2d');
        finalCtx.drawImage(underCan, 0, 0);
        finalCtx.drawImage(can, 0, 0);

        return {
          png: finalCan.toDataURL('image/png'),
          webp: finalCan.toDataURL('image/webp', 0.95)
        };
      };

      return {
        horizontal: await createFineContourLogo('${logoB64}', false),
        square: await createFineContourLogo('${sqB64}', true)
      };
    })()`
  });

  const val = evalRes.result.result.value;

  const saveB64 = (dataUrl, filePath) => {
    const raw = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(raw, 'base64'));
  };

  const imgDir = path.resolve(__dirname, '../assets/images');

  // Save to assets
  saveB64(val.horizontal.png, path.join(imgDir, 'miracle-it-logo.png'));
  saveB64(val.horizontal.png, path.join(imgDir, 'miracle-it-logo-navbar.png'));
  saveB64(val.horizontal.png, path.join(imgDir, 'miracle-it-logo-transparent.png'));
  saveB64(val.horizontal.webp, path.join(imgDir, 'miracle-it-logo.webp'));
  saveB64(val.horizontal.webp, path.join(imgDir, 'miracle-it-logo-navbar.webp'));
  saveB64(val.horizontal.webp, path.join(imgDir, 'miracle-it-logo-transparent.webp'));

  saveB64(val.square.png, path.join(imgDir, 'miracle-it-logo-square.png'));
  saveB64(val.square.webp, path.join(imgDir, 'miracle-it-logo-square.webp'));

  console.log('Saved high-definition fine contour logos to assets/images/');

  chrome.kill();
  process.exit(0);
}
run();
