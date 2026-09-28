const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9248',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_tmp_dir4'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9248/json');
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
      can.height = 120;
      const ctx = can.getContext('2d');
      // Draw slice y=720 to 840
      ctx.drawImage(img, 0, 720, img.naturalWidth, 120, 0, 0, img.naturalWidth, 120);
      return can.toDataURL('image/png');
    })()`
  });

  const b64 = evalRes.result.result.value.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(path.resolve(__dirname, 'slice_square_bottom.png'), Buffer.from(b64, 'base64'));
  console.log('Saved slice_square_bottom.png');

  chrome.kill();
  process.exit(0);
}
run();
