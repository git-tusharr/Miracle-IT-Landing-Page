const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_mobile_folder_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9470',
  '--disable-gpu',
  '--window-size=390,844',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function evaluate(send, expr) {
  const evalRes = await send('Runtime.evaluate', { expression: expr });
  return evalRes.result?.result?.value;
}

async function runMobileTest() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9470/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('127.0.0.1'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

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
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 1000));

  // Scroll directly to heroFolderCard
  await evaluate(send, `(() => {
    const el = document.querySelector('#heroFolderCard');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - 70, behavior: 'instant' });
    }
  })()`);
  await new Promise(r => setTimeout(r, 600));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_mobile_closed.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_mobile_closed.png');

  // Open the folder
  await evaluate(send, `(() => {
    document.querySelector('#heroFolderCard').click();
  })()`);
  await new Promise(r => setTimeout(r, 800));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_mobile_opened.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_mobile_opened.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

runMobileTest().catch(console.error);
