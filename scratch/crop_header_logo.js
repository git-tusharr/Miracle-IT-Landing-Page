const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_crop_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9325',
  '--disable-gpu',
  '--user-data-dir=' + tmpDir,
  'about:blank'
]);

async function crop() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9325/json');
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

  const b64 = fs.readFileSync(path.resolve(__dirname, 'final_header_live.png')).toString('base64');
  const r = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const img = new Image();
      img.src = 'data:image/png;base64,${b64}';
      await new Promise(res => img.onload = res);
      const can = document.createElement('canvas');
      can.width = 450;
      can.height = 140;
      const ctx = can.getContext('2d');
      // Logo in final_header_live is around x: 50, y: 15, w: 200, h: 60
      ctx.drawImage(img, 40, 10, 220, 70, 0, 0, 450, 140);
      return can.toDataURL('image/png');
    })()`
  });
  fs.writeFileSync(path.resolve(__dirname, 'header_logo_zoom.png'), Buffer.from(r.result.result.value.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('Saved scratch/header_logo_zoom.png');
  chrome.kill();
  process.exit(0);
}
crop().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
