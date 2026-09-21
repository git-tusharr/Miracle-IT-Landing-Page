const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9226',
  '--disable-gpu',
  '--window-size=1280,900',
  'http://localhost:3000'
]);

const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffd0a939-b75a-47e9-a6d1-7e8851c83a23';

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9226/json');
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

    await new Promise(r => setTimeout(r, 1000));

    // Scroll card into view
    await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelectorAll('.proof-review-card')[1]; // Mohit
        if (card) {
          card.scrollIntoView({ block: 'center', inline: 'center' });
        }
      })()`
    });

    await new Promise(r => setTimeout(r, 500));

    // Capture 3 frames separated by 800ms to see the beam orbit around the circle
    for (let i = 0; i < 3; i++) {
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });
      fs.writeFileSync(path.join(outDir, `snap_orbit_frame_${i + 1}.png`), Buffer.from(screenshot.result.data, 'base64'));
      console.log(`Saved snap_orbit_frame_${i + 1}.png`);
      await new Promise(r => setTimeout(r, 800));
    }

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

run();
