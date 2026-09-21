const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9227',
  '--disable-gpu',
  '--window-size=375,812',
  'http://localhost:3000'
]);

const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffd0a939-b75a-47e9-a6d1-7e8851c83a23';

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9227/json');
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });

    await new Promise(r => setTimeout(r, 1200));

    // Scroll directly using proof-testimonials-slider-wrap
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('.proof-testimonials-slider-wrap');
        if (el) {
          const rect = el.getBoundingClientRect();
          window.scrollTo(0, window.pageYOffset + rect.top - 70);
        }
      })()`
    });

    await new Promise(r => setTimeout(r, 1200));

    const ss = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    fs.writeFileSync(path.join(outDir, 'snap_trainee_mobile_final.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_trainee_mobile_final.png');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

run();
