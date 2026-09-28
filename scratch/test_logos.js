const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9241',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9241/json');
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

  const files = ['miracle-it-logo-user.jpg', 'miracle-it-logo.png', 'miracle-it-logo-square.png', 'miracle-it-logo-dark.png'];
  const b64Map = {};
  files.forEach(f => {
    b64Map[f] = fs.readFileSync(path.join(__dirname, '../assets/images', f)).toString('base64');
  });

  const script = `(async () => {
    const b64Map = ${JSON.stringify(b64Map)};
    const results = {};
    for (const [name, b64] of Object.entries(b64Map)) {
      const img = new Image();
      img.src = 'data:' + (name.endsWith('.jpg') ? 'image/jpeg' : 'image/png') + ';base64,' + b64;
      await new Promise(r => img.onload = r);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let darkGreyCount = 0;
      let whiteCount = 0;
      let orangeCount = 0;
      let blueCount = 0;

      for (let i = 0; i < d.length; i += 16) {
        const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
        if (a < 50) continue;
        if (r > 180 && g > 60 && g < 160 && b < 80) orangeCount++;
        else if (b > 140 && r < 100) blueCount++;
        else if (r > 200 && g > 200 && b > 200) whiteCount++;
        else if (r > 30 && r < 140 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) darkGreyCount++;
      }

      results[name] = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        darkGreyCount,
        whiteCount,
        orangeCount,
        blueCount
      };
    }
    return results;
  })()`;

  const evalRes = await send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: script });
  console.log(JSON.stringify(evalRes.result.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}
run();
