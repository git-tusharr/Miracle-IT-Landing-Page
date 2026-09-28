const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9247',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_tmp_dir3'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9247/json');
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

  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const img = new Image();
      img.src = 'data:image/png;base64,${sqB64}';
      await new Promise(r => img.onload = r);
      const can = document.createElement('canvas');
      can.width = img.naturalWidth;
      can.height = img.naturalHeight;
      const ctx = can.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, can.width, can.height).data;

      // Group rows into features
      // Square logo width & height:
      const bands = [];
      for (let y = 0; y < can.height; y += 5) {
        let whitePixels = 0, colorPixels = 0;
        for (let x = 0; x < can.width; x += 5) {
          const idx = (y * can.width + x) * 4;
          const a = data[idx+3];
          if (a > 60) {
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            if (r > 200 && g > 200 && b > 200) whitePixels++;
            else colorPixels++;
          }
        }
        if (whitePixels > 0 || colorPixels > 0) {
          bands.push({ y, whitePixels, colorPixels });
        }
      }
      return { w: can.width, h: can.height, bands };
    })()`
  });

  const val = evalRes.result.result.value;
  console.log('Square dims:', val.w, val.h);
  console.log('Square bands summary:');
  val.bands.filter(b => b.whitePixels > 5).forEach(b => {
    console.log(`y=${b.y}: white=${b.whitePixels}, color=${b.colorPixels}`);
  });

  chrome.kill();
  process.exit(0);
}
run();
