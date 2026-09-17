const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  const send = (method, params = {}) => {
    const id = msgId++;
    return new Promise((resolve) => {
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');

  for (const w of [360, 390, 768]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 740,
      deviceScaleFactor: 1,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 1500));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const bar = document.querySelector('.mobile-sticky-bar');
        const container = document.querySelector('.mobile-sticky-container');
        const btns = Array.from(document.querySelectorAll('.mobile-sticky-btn')).map(b => {
          const r = b.getBoundingClientRect();
          return {
            text: (b.innerText || '').trim(),
            width: Math.round(r.width),
            left: Math.round(r.left),
            right: Math.round(r.right),
            winW: window.innerWidth
          };
        });
        return {
          winW: window.innerWidth,
          barVisible: bar ? window.getComputedStyle(bar).display !== 'none' : false,
          barWidth: bar ? Math.round(bar.getBoundingClientRect().width) : null,
          containerWidth: container ? Math.round(container.getBoundingClientRect().width) : null,
          btns
        };
      })()`,
      returnByValue: true
    });

    console.log(`\nWidth ${w}px:`, JSON.stringify(check, null, 2));
  }

  ws.close();
  chrome.kill();
}
run().catch(e => { console.error(e); chrome.kill(); });
