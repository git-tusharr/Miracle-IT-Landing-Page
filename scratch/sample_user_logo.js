const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9250',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9250/json');
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

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      try {
        const img = new Image();
        img.src = 'data:image/jpeg;base64,${userB64}';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const can = document.createElement('canvas');
        can.width = img.naturalWidth;
        can.height = img.naturalHeight;
        const ctx = can.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, can.width, can.height).data;

        const greyPixels = [];
        for (let y = Math.floor(can.height * 0.62); y < Math.floor(can.height * 0.82); y++) {
          for (let x = Math.floor(can.width * 0.35); x < Math.floor(can.width * 0.95); x++) {
            const idx = (y * can.width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            const maxVal = Math.max(r, g, b);
            const minVal = Math.min(r, g, b);
            if (maxVal - minVal < 20 && maxVal > 35 && maxVal < 180) {
              greyPixels.push({ r, g, b, y, x });
            }
          }
        }

        const rAvg = Math.round(greyPixels.reduce((s, p) => s + p.r, 0) / (greyPixels.length || 1));
        const gAvg = Math.round(greyPixels.reduce((s, p) => s + p.g, 0) / (greyPixels.length || 1));
        const bAvg = Math.round(greyPixels.reduce((s, p) => s + p.b, 0) / (greyPixels.length || 1));

        return {
          dimensions: { w: can.width, h: can.height },
          greyPixelCount: greyPixels.length,
          avgGrey: { r: rAvg, g: gAvg, b: bAvg, hex: '#' + [rAvg, gAvg, bAvg].map(x => x.toString(16).padStart(2,'0')).join('') },
          samples: greyPixels.slice(0, 10)
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`
  });

  console.log('User Logo Analysis:', evalRes.result ? evalRes.result.value : evalRes);
  ws.close();
  chrome.kill();
}

run().catch(e => { console.error(e); chrome.kill(); });
