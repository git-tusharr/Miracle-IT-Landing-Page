const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_check_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9392',
  '--disable-gpu',
  '--window-size=1440,1100',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function inspect() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9392/json');
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
    const rSection = section ? section.getBoundingClientRect() : null;
    const rCard = stageCard ? stageCard.getBoundingClientRect() : null;
    return {
      sectionTop: rSection ? rSection.top : null,
      sectionHeight: rSection ? rSection.height : null,
      cardTop: rCard ? rCard.top : null,
      cardHeight: rCard ? rCard.height : null,
      scrollY: window.scrollY
    };
  })()`;

  const resp = await send('Runtime.evaluate', { expression, returnByValue: true });
  console.log('Evaluate Response:', JSON.stringify(resp, null, 2));

  chrome.kill();
  process.exit(0);
}

inspect().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
