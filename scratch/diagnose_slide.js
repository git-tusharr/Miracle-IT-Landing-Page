const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_diag_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9360',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function check() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9360/json');
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

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const section = document.querySelector('#why-miracle-it');
      const dots = Array.from(document.querySelectorAll('.story-dot'));
      const viewport = document.querySelector('#tabletStoryViewport');
      const track = document.querySelector('#tabletStoryTrack');
      return JSON.stringify({
        hasSection: !!section,
        dotsCount: dots.length,
        activeDotTarget: document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target'),
        hasViewport: !!viewport,
        viewportRect: viewport ? viewport.getBoundingClientRect() : null,
        hasTrack: !!track
      });
    })()`
  });

  console.log('Diag result:', JSON.stringify(evalRes));

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

check().catch(console.error);
