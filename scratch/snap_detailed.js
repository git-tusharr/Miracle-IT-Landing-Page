const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmpDir = path.resolve(__dirname, 'chrome_tmp_detailed_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9346',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function snap() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9346/json');
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
  await new Promise(r => setTimeout(r, 1000));

  // 1. Scroll to viewDilemmas inside problem section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#viewDilemmas');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_problem_cards.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_problem_cards.png');

  // 2. Scroll to why-miracle-it glass card
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#why-miracle-it .showcase-glass-card');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_glass_card.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_glass_card.png');

  chrome.kill();
  process.exit(0);
}
snap().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
