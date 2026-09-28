const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_iphone_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9352',
  '--disable-gpu',
  '--window-size=390,844',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function runTest() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9352/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('127.0.0.1'));
  if (!pageTab) {
    console.error('Could not find active page tab');
    chrome.kill();
    return;
  }
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

  await new Promise(r => setTimeout(r, 800));

  // Scroll so the entire iPhone device is centered in mobile view
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#whyTabletDevice');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_iphone_centered.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_iphone_centered.png');

  // Click Next on iPhone to test Chapter 2 on iPhone
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('#btnHudNext');
      if (btn) btn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_iphone_ch2.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_iphone_ch2.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
