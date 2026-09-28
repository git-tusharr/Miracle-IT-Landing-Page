const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = path.join(__dirname, 'chrome_clean_seams_tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9292',
  '--disable-gpu',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,900',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9292/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const cur = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) {
        ws.removeEventListener('message', handler);
        resolve(d);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1200));

  // 1. Boundary: Placed Students -> Problem (centered in viewport)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.seam-bright-to-dark') || document.getElementById('problem');
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - (window.innerHeight / 2) + 50);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'clean_seam_top.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Captured clean_seam_top.png');

  // 2. Boundary: Location -> FAQ (centered in viewport)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.seam-dark-to-bright') || document.getElementById('faq');
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - (window.innerHeight / 2) + 50);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'clean_seam_bottom.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Captured clean_seam_bottom.png');

  // 3. Mobile Viewport (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 800));

  // Mobile Top Seam
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.seam-bright-to-dark') || document.getElementById('problem');
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - (window.innerHeight / 2) + 40);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'clean_seam_mobile_top.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Captured clean_seam_mobile_top.png');

  // Mobile Bottom Seam
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.seam-dark-to-bright') || document.getElementById('faq');
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - (window.innerHeight / 2) + 40);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'clean_seam_mobile_bottom.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Captured clean_seam_mobile_bottom.png');

  ws.close();
  chrome.kill();
  console.log('ALL SEAMS CAPTURED');
}

run().catch(err => {
  console.error(err);
  chrome.kill();
});
