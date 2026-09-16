const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000',
  'http://localhost:3000'
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
  await new Promise(r => setTimeout(r, 2000));

  // Refresh ScrollTrigger to see what happens after full load
  await send('Runtime.evaluate', {
    expression: `window.ScrollTrigger && window.ScrollTrigger.refresh()`
  });
  await new Promise(r => setTimeout(r, 500));

  // Check ScrollTriggers after refresh
  const stInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      return window.ScrollTrigger.getAll().map(st => ({
        id: st.vars.id,
        trigger: st.trigger ? (st.trigger.id || st.trigger.className) : null,
        start: Math.round(st.start),
        end: Math.round(st.end),
        pin: !!st.pin
      }));
    })()`,
    returnByValue: true
  });
  console.log('ScrollTriggers after refresh:', JSON.stringify(stInfo.result.value, null, 2));

  // Let's scroll to #why-miracle-it
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#why-miracle-it').scrollIntoView()`
  });
  await new Promise(r => setTimeout(r, 1000));
  let ss = await send('Page.captureScreenshot');
  fs.writeFileSync('scratch/snap_why.png', Buffer.from(ss.result.data, 'base64'));

  // Scroll 1500px into why-miracle-it
  await send('Runtime.evaluate', {
    expression: `window.scrollBy(0, 1500)`
  });
  await new Promise(r => setTimeout(r, 1000));
  ss = await send('Page.captureScreenshot');
  fs.writeFileSync('scratch/snap_why_mid.png', Buffer.from(ss.result.data, 'base64'));

  // Scroll to #learning-experience
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#learning-experience').scrollIntoView()`
  });
  await new Promise(r => setTimeout(r, 1000));
  ss = await send('Page.captureScreenshot');
  fs.writeFileSync('scratch/snap_learn.png', Buffer.from(ss.result.data, 'base64'));

  // Scroll to #who-can-join
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#who-can-join').scrollIntoView()`
  });
  await new Promise(r => setTimeout(r, 1000));
  ss = await send('Page.captureScreenshot');
  fs.writeFileSync('scratch/snap_who.png', Buffer.from(ss.result.data, 'base64'));

  // Scroll 1200px into who-can-join
  await send('Runtime.evaluate', {
    expression: `window.scrollBy(0, 1200)`
  });
  await new Promise(r => setTimeout(r, 1000));
  ss = await send('Page.captureScreenshot');
  fs.writeFileSync('scratch/snap_who_mid.png', Buffer.from(ss.result.data, 'base64'));

  console.log('Screenshots saved!');
  ws.close();
  chrome.kill();
}
run().catch(e => { console.error(e); chrome.kill(); });
