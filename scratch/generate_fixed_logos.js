const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9249',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_tmp_dir5'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9249/json');
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

  const userB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg')).toString('base64');
  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      // 1. Process Horizontal Logo from miracle-it-logo-user.jpg
      const imgU = new Image();
      imgU.src = 'data:image/jpeg;base64,${userB64}';
      await new Promise(r => imgU.onload = r);

      const canU = document.createElement('canvas');
      canU.width = imgU.naturalWidth;
      canU.height = imgU.naturalHeight;
      const ctxU = canU.getContext('2d', { willReadFrequently: true });
      ctxU.drawImage(imgU, 0, 0);

      const imgDataU = ctxU.getImageData(0, 0, canU.width, canU.height);
      const dataU = imgDataU.data;

      let minX = canU.width, maxX = 0, minY = canU.height, maxY = 0;

      for (let i = 0; i < dataU.length; i += 4) {
        const r = dataU[i];
        const g = dataU[i + 1];
        const b = dataU[i + 2];
        const maxVal = Math.max(r, g, b);

        if (maxVal <= 18) {
          // Pure black background
          dataU[i + 3] = 0;
        } else if (maxVal < 60) {
          // Anti-aliased transition edge
          const t = (maxVal - 18) / (60 - 18);
          const alpha = Math.round(t * t * 255);
          dataU[i + 3] = alpha;

          // Decontaminate edge from black background
          const boost = Math.min(1.0 / Math.max(t, 0.25), 2.2);
          dataU[i] = Math.min(255, Math.round(r * boost));
          dataU[i + 1] = Math.min(255, Math.round(g * boost));
          dataU[i + 2] = Math.min(255, Math.round(b * boost));
        } else {
          dataU[i + 3] = 255;
          // Notice: Check if pixel is the dark grey text ("CAREER ACADEMY")
          const isGrey = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
          if (isGrey && maxVal < 180) {
            // Restore authentic crisp dark charcoal grey (#374151 / rgb(55, 65, 81))
            // Preserving original text color faithfully as requested by mentor
            const targetGreyR = 60;
            const targetGreyG = 64;
            const targetGreyB = 72;
            // Modulate with original brightness to preserve crisp font edge anti-aliasing
            const factor = Math.min(1.2, maxVal / 65);
            dataU[i] = Math.round(targetGreyR * factor);
            dataU[i + 1] = Math.round(targetGreyG * factor);
            dataU[i + 2] = Math.round(targetGreyB * factor);
          }
        }

        if (dataU[i + 3] > 20) {
          const px = (i / 4) % canU.width;
          const py = Math.floor((i / 4) / canU.width);
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }

      ctxU.putImageData(imgDataU, 0, 0);

      // Tight crop with 8px padding
      const pad = 8;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(canU.width - cropX, (maxX - minX) + pad * 2);
      const cropH = Math.min(canU.height - cropY, (maxY - minY) + pad * 2);

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      const cropCtx = cropCanvas.getContext('2d');
      cropCtx.drawImage(canU, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // 2. Process Square Logo
      const imgS = new Image();
      imgS.src = 'data:image/png;base64,${sqB64}';
      await new Promise(r => imgS.onload = r);

      const canS = document.createElement('canvas');
      canS.width = imgS.naturalWidth;
      canS.height = imgS.naturalHeight;
      const ctxS = canS.getContext('2d', { willReadFrequently: true });
      ctxS.drawImage(imgS, 0, 0);

      const imgDataS = ctxS.getImageData(0, 0, canS.width, canS.height);
      const dataS = imgDataS.data;

      // In square logo, the bottom text "CAREER ACADEMY" is at y >= 720
      for (let y = 720; y < canS.height; y++) {
        for (let x = 0; x < canS.width; x++) {
          const idx = (y * canS.width + x) * 4;
          const a = dataS[idx + 3];
          if (a > 30) {
            const r = dataS[idx];
            const g = dataS[idx + 1];
            const b = dataS[idx + 2];
            // If white/bright grey
            if (r > 160 && g > 160 && b > 160) {
              const luminance = (r + g + b) / (3 * 255);
              const targetR = Math.round(60 * luminance);
              const targetG = Math.round(64 * luminance);
              const targetB = Math.round(72 * luminance);
              dataS[idx] = targetR;
              dataS[idx + 1] = targetG;
              dataS[idx + 2] = targetB;
            }
          }
        }
      }

      ctxS.putImageData(imgDataS, 0, 0);

      return {
        horizontalPng: cropCanvas.toDataURL('image/png'),
        squarePng: canS.toDataURL('image/png'),
        horizontalWebp: cropCanvas.toDataURL('image/webp', 0.95),
        squareWebp: canS.toDataURL('image/webp', 0.95),
        wH: cropW,
        hH: cropH,
        wS: canS.width,
        hS: canS.height
      };
    })()`
  });

  const val = evalRes.result.result.value;
  console.log('Processed logos:', {
    horizontal: { width: val.wH, height: val.hH },
    square: { width: val.wS, height: val.hS }
  });

  const saveB64 = (dataUrl, filePath) => {
    const raw = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(raw, 'base64'));
    console.log('Saved:', filePath);
  };

  const imgDir = path.resolve(__dirname, '../assets/images');
  saveB64(val.horizontalPng, path.join(imgDir, 'miracle-it-logo.png'));
  saveB64(val.horizontalPng, path.join(imgDir, 'miracle-it-logo-navbar.png'));
  saveB64(val.horizontalPng, path.join(imgDir, 'miracle-it-logo-transparent.png'));
  saveB64(val.horizontalWebp, path.join(imgDir, 'miracle-it-logo.webp'));
  saveB64(val.horizontalWebp, path.join(imgDir, 'miracle-it-logo-navbar.webp'));
  saveB64(val.horizontalWebp, path.join(imgDir, 'miracle-it-logo-transparent.webp'));

  saveB64(val.squarePng, path.join(imgDir, 'miracle-it-logo-square.png'));
  saveB64(val.squareWebp, path.join(imgDir, 'miracle-it-logo-square.webp'));

  chrome.kill();
  process.exit(0);
}
run();
