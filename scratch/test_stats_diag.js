const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9226',
  '--disable-gpu',
  '--window-size=1280,1000',
  'http://localhost:3000'
]);

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
    await send('Runtime.enable');
    await send('Page.enable');

    await new Promise(r => setTimeout(r, 1000));

    const diag = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const stats = document.querySelector('.campus-stats-bar');
        const items = Array.from(document.querySelectorAll('.campus-stat .stat-number'));
        return {
          statsExists: !!stats,
          statsRect: stats ? stats.getBoundingClientRect() : null,
          itemsCount: items.length,
          texts: items.map(i => i.innerText.trim())
        };
      })()`
    });

    console.log('DIAGNOSTIC 1 (Initial Load at top):', JSON.stringify(diag.result.result.value, null, 2));

    // Now scroll stats into view
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.campus-stats-bar').scrollIntoView({ block: 'center' });`
    });

    await new Promise(r => setTimeout(r, 200));

    const diag2 = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const stats = document.querySelector('.campus-stats-bar');
        const items = Array.from(document.querySelectorAll('.campus-stat .stat-number'));
        return {
          statsRect: stats ? stats.getBoundingClientRect() : null,
          texts: items.map(i => i.innerText.trim()),
          classes: items.map(i => i.className)
        };
      })()`
    });
    console.log('DIAGNOSTIC 2 (Immediately after scrollIntoView):', JSON.stringify(diag2.result.result.value, null, 2));

    await new Promise(r => setTimeout(r, 700));

    const diag3 = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const items = Array.from(document.querySelectorAll('.campus-stat .stat-number'));
        return {
          texts: items.map(i => i.innerText.trim()),
          classes: items.map(i => i.className)
        };
      })()`
    });
    console.log('DIAGNOSTIC 3 (700ms into animation):', JSON.stringify(diag3.result.result.value, null, 2));

    await new Promise(r => setTimeout(r, 1000));

    const diag4 = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const items = Array.from(document.querySelectorAll('.campus-stat .stat-number'));
        return {
          texts: items.map(i => i.innerText.trim()),
          classes: items.map(i => i.className)
        };
      })()`
    });
    console.log('DIAGNOSTIC 4 (After animation completion):', JSON.stringify(diag4.result.result.value, null, 2));

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error(err);
    chrome.kill();
  }
}

run();
