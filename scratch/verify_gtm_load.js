const { spawn } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = path.join(__dirname, 'chrome_gtm_tmp');

const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9298',
  '--disable-gpu',
  `--user-data-dir=${tmpDir}`,
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9298/json');
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

  const evalResult = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      return {
        hasDataLayer: Array.isArray(window.dataLayer),
        dataLayerLength: window.dataLayer ? window.dataLayer.length : 0,
        dataLayerEvents: window.dataLayer ? window.dataLayer.map(x => x.event) : [],
        gtmNoscriptPresent: !!document.querySelector('noscript iframe[src*="googletagmanager.com/ns.html"]')
      };
    })()`
  });

  console.log('GTM Browser Evaluation:', JSON.stringify(evalResult));

  ws.close();
  chrome.kill();
}

run().catch(err => {
  console.error(err);
  chrome.kill();
});
