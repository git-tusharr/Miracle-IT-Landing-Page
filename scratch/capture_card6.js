const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9230',
  '--disable-gpu',
  '--window-size=1400,1080',
  'http://localhost:3000'
]);

const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffd0a939-b75a-47e9-a6d1-7e8851c83a23';

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9230/json');
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
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to #courses and click tab 5 (Tech Transition)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const sec = document.querySelector('#courses');
        if (sec) sec.scrollIntoView({ block: 'start' });
        const tab = document.querySelector('#course-tab-5');
        if (tab) tab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    const ss6 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_bridge.png'), Buffer.from(ss6.result.data, 'base64'));
    console.log('Saved snap_courses_bridge.png');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

run();
