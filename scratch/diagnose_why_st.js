const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_st_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9365',
  '--disable-gpu',
  '--window-size=1440,1000',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function diag() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9365/json');
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

  await new Promise(r => setTimeout(r, 1500));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const st = window.whyTabletTimeline && window.whyTabletTimeline.scrollTrigger;
      const section = document.querySelector('#why-miracle-it');
      const rect = section ? section.getBoundingClientRect() : null;
      return {
        hasST: !!st,
        stStart: st ? st.start : null,
        stEnd: st ? st.end : null,
        rect: rect ? { top: rect.top, height: rect.height } : null,
        scrollY: window.scrollY
      };
    })()`,
    returnByValue: true
  });

  console.log('ScrollTrigger Diagnostics:', info.result.value);

  // If st exists, scroll directly to st.start + 10
  if (info.result.value && info.result.value.stStart) {
    const startY = info.result.value.stStart;
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, ${startY + 20})`
    });
    await new Promise(r => setTimeout(r, 800));
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, 'snap_why_at_start.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved snap_why_at_start.png');
  }

  chrome.kill();
  process.exit(0);
}

diag().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
