const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_webp_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9310',
  '--disable-gpu',
  '--user-data-dir=' + tmpDir,
  'about:blank'
]);

async function convertWebp() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9310/json');
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

  const silverB64 = fs.readFileSync(path.resolve(__dirname, 'sol_silver.png')).toString('base64');
  const sqB64 = fs.readFileSync(path.resolve(__dirname, 'sol_square_silver.png')).toString('base64');

  const r = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const toWebp = async (b64) => {
        const img = new Image();
        img.src = 'data:image/png;base64,' + b64;
        await new Promise(res => img.onload = res);
        const can = document.createElement('canvas');
        can.width = img.naturalWidth;
        can.height = img.naturalHeight;
        can.getContext('2d').drawImage(img, 0, 0);
        return can.toDataURL('image/webp', 0.95);
      };
      return {
        silverWebp: await toWebp('${silverB64}'),
        sqWebp: await toWebp('${sqB64}')
      };
    })()`
  });

  const val = r.result.result.value;
  const imgDir = path.resolve(__dirname, '../assets/images');

  const saveWebp = (dataUrl, name) => {
    const raw = dataUrl.replace(/^data:image\/webp;base64,/, '');
    fs.writeFileSync(path.join(imgDir, name), Buffer.from(raw, 'base64'));
  };

  saveWebp(val.silverWebp, 'miracle-it-logo.webp');
  saveWebp(val.silverWebp, 'miracle-it-logo-navbar.webp');
  saveWebp(val.silverWebp, 'miracle-it-logo-transparent.webp');
  saveWebp(val.sqWebp, 'miracle-it-logo-square.webp');

  console.log('Webp images converted and saved.');
  chrome.kill();
  process.exit(0);
}

convertWebp().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
