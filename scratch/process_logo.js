const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9229',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9229/json');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };
    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve) => {
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    const imagePath = path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg');
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');
    const dataUri = `data:image/jpeg;base64,${imageBase64}`;

    // Pass dataUri to browser, load onto canvas, inspect and remove background
    const evalResult = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        const img = new Image();
        img.src = "${dataUri}";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample background from corners
        const corners = [
          [0, 0],
          [canvas.width - 1, 0],
          [0, canvas.height - 1],
          [canvas.width - 1, canvas.height - 1]
        ];
        const cornerSamples = corners.map(([x, y]) => {
          const idx = (y * canvas.width + x) * 4;
          return [data[idx], data[idx+1], data[idx+2]];
        });

        // Background removal algorithm:
        // Pure black background has r,g,b close to 0.
        // For black background removal:
        // We want smooth transition for anti-aliased edge pixels without creating a dark fringe or halo.
        // Max brightness = Math.max(r, g, b).
        // If max brightness < threshold_low (e.g. 15), alpha = 0.
        // If between threshold_low and threshold_high (e.g. 50), calculate partial alpha.
        // Also boost color vibrancy of edge pixels to decontaminate black fringe.

        let totalPixels = canvas.width * canvas.height;
        let transparentCount = 0;

        // We can do an edge-aware decontamination
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Perceived luminance or max channel
          const maxVal = Math.max(r, g, b);

          if (maxVal <= 18) {
            // Definite background
            data[i + 3] = 0;
            transparentCount++;
          } else if (maxVal < 65) {
            // Transition zone (anti-aliasing)
            // Scale alpha linearly or with smoothstep from 0 to 255
            const t = (maxVal - 18) / (65 - 18);
            const alpha = Math.round(t * t * 255); // smooth curve
            data[i + 3] = alpha;

            // Decontaminate: un-multiply the black background
            if (t > 0) {
              const factor = Math.min(1 / Math.max(t, 0.2), 2.5);
              data[i] = Math.min(255, Math.round(r * factor));
              data[i + 1] = Math.min(255, Math.round(g * factor));
              data[i + 2] = Math.min(255, Math.round(b * factor));
            }
          } else {
            // Full foreground
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        return {
          width: canvas.width,
          height: canvas.height,
          transparentCount,
          totalPixels,
          cornerSamples,
          pngDataUrl: canvas.toDataURL('image/png')
        };
      })()`
    });

    const resVal = evalResult.result.result ? evalResult.result.result.value : null;
    if (!resVal) {
      console.error('Eval error:', evalResult);
      return;
    }
    console.log('Result:', {
      width: resVal.width,
      height: resVal.height,
      transparentCount: resVal.transparentCount,
      totalPixels: resVal.totalPixels,
      cornerSamples: resVal.cornerSamples
    });

    const pngBase64 = resVal.pngDataUrl.replace(/^data:image\/png;base64,/, '');
    const outPath = path.resolve(__dirname, '../assets/images/miracle-it-logo-transparent.png');
    fs.writeFileSync(outPath, Buffer.from(pngBase64, 'base64'));
    console.log('Saved transparent logo to:', outPath);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
