const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_inspect_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9389',
  '--disable-gpu',
  '--window-size=1440,1100',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function inspect() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9389/json');
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

  const expression = `(() => {
    const section = document.querySelector('#why-miracle-it');
    const stageCard = document.querySelector('.why-stage-card');
    const track = document.querySelector('#tabletStoryTrack');
    const slides = document.querySelectorAll('.tablet-slide');
    
    const getBox = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        top: Math.round(r.top),
        height: Math.round(r.height),
        width: Math.round(r.width),
        display: cs.display,
        opacity: cs.opacity,
        visibility: cs.visibility,
        overflow: cs.overflow,
        transform: cs.transform
      };
    };

    return {
      section: getBox(section),
      stageCard: getBox(stageCard),
      track: getBox(track),
      slide0: getBox(slides[0]),
      slidesCount: slides.length
    };
  })()`;

  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true
  });

  console.log('DOM Inspection Result:', JSON.stringify(result.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

inspect().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
