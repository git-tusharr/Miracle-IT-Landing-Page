const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9224',
  '--disable-gpu',
  '--window-size=390,844',
  'http://localhost:3000'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9224/json');
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
    await send('Page.enable');
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 1500));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('.proof-testimonials-slider-wrap');
        if (el) {
          const rect = el.getBoundingClientRect();
          window.scrollTo(0, window.pageYOffset + rect.top - 80);
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\c22db8df-be12-447f-9c1b-8ca1b3855256';
    fs.writeFileSync(path.join(outDir, 'testimonials_mobile_view.png'), Buffer.from(screenshot.result.data, 'base64'));
    console.log('Saved testimonials_mobile_view.png');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}
run();
