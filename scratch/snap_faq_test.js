const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_faq_verify_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9425',
  '--disable-gpu',
  '--window-size=1440,960',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2600));
  const res = await fetch('http://127.0.0.1:9425/json');
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

  await new Promise(r => setTimeout(r, 1500));

  // 1. Desktop View (1440px) - Question 1 open by default
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#faq');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -60);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_faq_desktop_initial.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_faq_desktop_initial.png');

  // 2. Click Question 2: Q1 closes, Q2 opens
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn2 = document.querySelector('#faq-btn-2');
      if (btn2) btn2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_faq_desktop_q2.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_faq_desktop_q2.png');

  // 3. Tablet View (840px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 840,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 600));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#faq');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -60);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_faq_tablet.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_faq_tablet.png');

  // 4. Mobile View (390px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 600));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#faq');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -60);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_faq_mobile_390.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_faq_mobile_390.png');

  // 4b. Mobile scrolled to accordion cards
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#faqAccordion');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_faq_mobile_cards.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_faq_mobile_cards.png');

  // 5. Small Phone (360px)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 740,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 600));
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#faq');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -60);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_faq_mobile_360.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_faq_mobile_360.png');

  chrome.kill();
  process.exit(0);
}

run().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
