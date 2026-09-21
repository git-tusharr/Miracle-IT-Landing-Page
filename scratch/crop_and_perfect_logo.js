const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9232',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 1800));
    const res = await fetch('http://127.0.0.1:9232/json');
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

    const srcPath = path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg');
    const b64 = fs.readFileSync(srcPath).toString('base64');

    const script = `
      (async () => {
        const img = new Image();
        img.src = 'data:image/jpeg;base64,${b64}';
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Clean black background removal:
        // Background in source JPG is pure/near black (RGB 0..15).
        // Let's identify the content and compute bounding box:
        let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxVal = Math.max(r, g, b);

          if (maxVal <= 18) {
            // pure background
            data[i + 3] = 0;
          } else if (maxVal < 60) {
            // smooth anti-aliased edge
            const t = (maxVal - 18) / (60 - 18);
            const alpha = Math.round(t * t * 255);
            data[i + 3] = alpha;

            // De-darken edges so there's no black outline
            const boost = Math.min(1.0 / Math.max(t, 0.25), 2.2);
            data[i] = Math.min(255, Math.round(r * boost));
            data[i + 1] = Math.min(255, Math.round(g * boost));
            data[i + 2] = Math.min(255, Math.round(b * boost));
          } else {
            data[i + 3] = 255;
            // Check if pixel is grey/monochrome (text "Career Academy" and "Central India's No.1 IT Training Academy")
            const isGrey = Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && Math.abs(r - b) < 18;
            if (isGrey && maxVal < 180) {
              // Map dark grey [50..120] to crisp clean silver-white [190..245]
              const tGrey = (maxVal - 40) / (120 - 40);
              const clampedT = Math.max(0, Math.min(1, tGrey));
              const brightVal = Math.round(185 + clampedT * 60);
              data[i] = brightVal;
              data[i + 1] = Math.min(255, brightVal + 5);
              data[i + 2] = Math.min(255, brightVal + 10);
            }
          }

          // Track bounding box of visible content
          if (data[i + 3] > 20) {
            const px = (i / 4) % canvas.width;
            const py = Math.floor((i / 4) / canvas.width);
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Crop tightly with 8px padding
        const pad = 8;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(canvas.width - cropX, (maxX - minX) + pad * 2);
        const cropH = Math.min(canvas.height - cropY, (maxY - minY) + pad * 2);

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        return {
          origW: canvas.width,
          origH: canvas.height,
          cropW,
          cropH,
          bbox: { minX, maxX, minY, maxY },
          dataUrl: cropCanvas.toDataURL('image/png')
        };
      })()
    `;

    const evalRes = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: script
    });

    const info = evalRes.result.result.value;
    console.log('Processed logo:', {
      origW: info.origW,
      origH: info.origH,
      cropW: info.cropW,
      cropH: info.cropH,
      bbox: info.bbox
    });

    const pngBase64 = info.dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(pngBase64, 'base64');

    // Save as miracle-it-logo-navbar.png and backup previous
    const targetPath1 = path.resolve(__dirname, '../assets/images/miracle-it-logo-navbar.png');
    const targetPath2 = path.resolve(__dirname, '../assets/images/miracle-it-logo.png');

    fs.writeFileSync(targetPath1, buffer);
    fs.writeFileSync(targetPath2, buffer);
    console.log('Saved to:', targetPath1, 'and', targetPath2);

  } catch (err) {
    console.error('Processing error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
