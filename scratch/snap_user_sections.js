const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_snap_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9340',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function snap() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9340/json');
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

  await new Promise(r => setTimeout(r, 1200));

  // 1. Problem section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#problem');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_current_problem.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_current_problem.png');

  // 2. Why section — scrolled so the stage card is centered
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#why-miracle-it');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, 260);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_stage_centered.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_stage_centered.png');

  // 3. Click Chapter 2 (Production Capstones)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tab2 = document.querySelector('.chapter-tab[data-slide-target="1"]');
      if (tab2) tab2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_why_slide_capstones.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_why_slide_capstones.png');

  // 4. Learning Experience section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#learning-experience');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_current_learning.png'), Buffer.from(shot.result.data, 'base64'));
  // 4b. Learning Experience carousel cards centered
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#learning-experience .experience-carousel-stage');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_learning_stage.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_learning_stage.png');

  chrome.kill();
  process.exit(0);
}

snap().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
