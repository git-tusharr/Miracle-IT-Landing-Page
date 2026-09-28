const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_sections_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9330',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function capture() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9330/json');
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
  await send('Page.enable');

  await new Promise(r => setTimeout(r, 1200));

  // Scroll to CTA
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#final-cta');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - 80);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'view_final_cta.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved view_final_cta.png');

  // Scroll to footer
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#siteFooter');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'view_footer.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved view_footer.png');

  chrome.kill();
  process.exit(0);
}

capture().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
