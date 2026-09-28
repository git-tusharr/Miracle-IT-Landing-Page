const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = path.join(__dirname, 'chrome_hiring_tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9297',
  '--disable-gpu',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,900',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9297/json');
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

  // Scroll directly to hiring marquee
  await send('Runtime.evaluate', {
    expression: `(() => {
      const marquee = document.querySelector('.hiring-companies-slider-wrap');
      if (marquee) {
        marquee.scrollIntoView({ block: 'center' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 700));

  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'live_hiring_marquee_desktop.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Saved live_hiring_marquee_desktop.png');

  // Mobile Viewport (390x844)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 800));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const marquee = document.querySelector('.hiring-companies-slider-wrap');
      if (marquee) {
        marquee.scrollIntoView({ block: 'center' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'live_hiring_marquee_mobile.png'), Buffer.from(ss.result.data, 'base64'));
  console.log('Saved live_hiring_marquee_mobile.png');

  ws.close();
  chrome.kill();
}

run().catch(err => {
  console.error(err);
  chrome.kill();
});
