const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_diag_events_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9358',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9358/json');
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

  // Scroll to tablet
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.eventLog = [];
      const vp = document.querySelector('#tabletStoryViewport');
      const add = (name, e) => {
        window.eventLog.push({ name, x: e.clientX, y: e.clientY, buttons: e.buttons, target: e.target?.tagName + '.' + e.target?.className });
      };
      vp.addEventListener('pointerdown', e => add('pointerdown', e));
      window.addEventListener('pointermove', e => add('pointermove', e));
      window.addEventListener('pointerup', e => add('pointerup', e));

      vp.addEventListener('mousedown', e => add('mousedown', e));
      window.addEventListener('mousemove', e => add('mousemove', e));
      window.addEventListener('mouseup', e => add('mouseup', e));

      document.querySelector('#whyTabletDevice')?.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });

  await new Promise(r => setTimeout(r, 500));

  const vpBox = await send('Runtime.evaluate', {
    expression: `(() => {
      const r = document.querySelector('#tabletStoryViewport').getBoundingClientRect();
      const elAtCenter = document.elementFromPoint(r.left + r.width * 0.7, r.top + r.height * 0.5);
      return JSON.stringify({
        r: { left: r.left, top: r.top, width: r.width, height: r.height },
        targetEl: elAtCenter ? elAtCenter.tagName + '.' + elAtCenter.className : null
      });
    })()`
  });
  console.log('Raw vpBox:', JSON.stringify(vpBox));
  const vpVal = vpBox.result?.result?.value || vpBox.result?.value;
  console.log('Target under point:', vpVal);

  const { r, targetEl } = JSON.parse(vpVal);
  const startX = r.left + r.width * 0.7;
  const startY = r.top + r.height * 0.5;
  const endX = r.left + r.width * 0.2;

  // Dispatch mouse drag
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: startX, y: startY, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 5; i++) {
    const curX = startX + (endX - startX) * (i / 5);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: curX, y: startY, buttons: 1 });
    await new Promise(res => setTimeout(res, 20));
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: endX, y: startY, button: 'left', buttons: 0 });

  await new Promise(r => setTimeout(r, 600));

  const logRes = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      logCount: window.eventLog.length,
      sampleEvents: window.eventLog.slice(0, 10),
      activeSlide: document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')
    })`
  });
  console.log('Event log summary:', logRes.result?.result?.value || logRes.result?.value);

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

run().catch(console.error);
