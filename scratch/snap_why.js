const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9259',
  '--disable-gpu',
  '--window-size=1440,1080',
  'http://localhost:3000'
]);

async function check() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9259/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => { const d = JSON.parse(e.data); if (d.id && callbacks.has(d.id)) { callbacks.get(d.id)(d); callbacks.delete(d.id); } };
  const send = (m, p = {}) => new Promise(r => { const i = id++; callbacks.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');

  await send('Runtime.evaluate', {
    expression: `(() => {
      const why = document.getElementById('why-miracle-it');
      if (why) why.scrollIntoView({ block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/snap_desktop_why_section.png', Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/snap_desktop_why_section.png');
  ws.close();
  chrome.kill();
}
check();
