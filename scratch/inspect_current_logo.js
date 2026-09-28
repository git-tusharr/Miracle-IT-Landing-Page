const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9288',
  '--disable-gpu',
  'about:blank'
]);

async function inspect() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9288/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && callbacks.has(d.id)) { callbacks.get(d.id)(d); callbacks.delete(d.id); }
  };
  const send = (m, p = {}) => {
    const curId = id++;
    return new Promise(r => { callbacks.set(curId, r); ws.send(JSON.stringify({ id: curId, method: m, params: p })); });
  };
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');

  const logoB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo.png')).toString('base64');
  const r = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const img = new Image();
      img.src = 'data:image/png;base64,${logoB64}';
      await new Promise(res => img.onload = res);
      const can = document.createElement('canvas');
      can.width = img.naturalWidth;
      can.height = img.naturalHeight;
      const ctx = can.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, can.width, can.height).data;
      
      let nonZeroCount = 0;
      let whiteCount = 0;
      let greyCount = 0;
      for (let y = 260; y < can.height; y++) {
        for (let x = 0; x < can.width; x++) {
          const idx = (y * can.width + x) * 4;
          const a = data[idx+3];
          if (a > 50) {
            nonZeroCount++;
            const red = data[idx], grn = data[idx+1], blu = data[idx+2];
            if (red > 200 && grn > 200 && blu > 200) whiteCount++;
            else if (red < 100 && grn < 100 && blu < 100) greyCount++;
          }
        }
      }
      return { width: can.width, height: can.height, nonZeroCount, whiteCount, greyCount };
    })()`
  });
  console.log('Inspection:', r.result.result.value);
  chrome.kill();
  process.exit(0);
}
inspect().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
