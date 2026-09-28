const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_why_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9348',
  '--disable-gpu',
  '--window-size=1440,1050',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function snap() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9348/json');
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

  // Get position of #why-miracle-it
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#why-miracle-it');
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return window.pageYOffset + rect.top;
    })()`
  });
  const whyTop = evalRes.result.value || 0;
  console.log('whyTop:', whyTop);

  // Scroll to whyTop + 100px so pinned state is active
  await send('Runtime.evaluate', {
    expression: `window.scrollTo({ top: ${whyTop + 150}, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 800));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_slide1.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_slide1.png');

  // Scroll further to slide 2
  await send('Runtime.evaluate', {
    expression: `window.scrollTo({ top: ${whyTop + 900}, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_slide2.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_slide2.png');

  chrome.kill();
  process.exit(0);
}

snap().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
