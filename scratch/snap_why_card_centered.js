const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_snap_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9360',
  '--disable-gpu',
  '--window-size=1440,1100',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function snap() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9360/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
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

  await new Promise(r => setTimeout(r, 1200));

  // 1. Scroll to why-miracle-it and then scroll down 320px to center the showcase card
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#why-miracle-it');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollBy(0, 320);
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_centered.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_centered.png');

  // 2. Click Chapter 2 (Production Capstones)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tab2 = document.querySelector('.chapter-tab[data-slide-target="1"]');
      if (tab2) tab2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_chapter2.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_chapter2.png');

  chrome.kill();
  process.exit(0);
}

snap().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
