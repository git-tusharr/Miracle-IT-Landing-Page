const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9227',
  '--disable-gpu',
  '--window-size=1280,900',
  'http://localhost:3000'
]);

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
    await send('Runtime.enable');
    await send('Page.enable');

    await new Promise(r => setTimeout(r, 1000));

    // Scroll directly to campus-stats-bar
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.campus-stats-bar').scrollIntoView({ block: 'center' });`
    });

    // Wait ~400ms into the animation to capture the live counting state
    await new Promise(r => setTimeout(r, 450));

    const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\c22db8df-be12-447f-9c1b-8ca1b3855256';

    const snapCounting = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'campus_stats_live_counting.png'), Buffer.from(snapCounting.result.data, 'base64'));
    console.log('Saved campus_stats_live_counting.png');

    // Wait for animation to finish completely
    await new Promise(r => setTimeout(r, 1400));

    const snapFinished = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'campus_stats_final_finished.png'), Buffer.from(snapFinished.result.data, 'base64'));
    console.log('Saved campus_stats_final_finished.png');

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error(err);
    chrome.kill();
  }
}

run();
