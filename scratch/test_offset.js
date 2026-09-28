const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_offset_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9352',
  '--disable-gpu',
  '--window-size=1440,960',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9352/json');
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

  await new Promise(r => setTimeout(r, 1500));

  // Find why-miracle-it offsetTop by traversing offsetParents or getBoundingClientRect
  const evalOffset = await send('Runtime.evaluate', {
    expression: `(() => {
      let el = document.querySelector('#why-miracle-it');
      let top = 0;
      while (el) {
        top += el.offsetTop || 0;
        el = el.offsetParent;
      }
      return top;
    })()`
  });

  const targetTop = evalOffset.result.value || 0;
  console.log('Real offsetTop of #why-miracle-it:', targetTop);

  // Scroll to targetTop + 80px (just after pinning activates)
  await send('Runtime.evaluate', {
    expression: `window.scrollTo({ top: ${targetTop + 100}, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 1000));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_active_pin.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_active_pin.png');

  // Trigger click on Chapter 2 tab:
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tab2 = document.querySelectorAll('.chapter-tab')[1];
      if (tab2) tab2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_tab2.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_tab2.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  chrome.kill();
  process.exit(1);
});
