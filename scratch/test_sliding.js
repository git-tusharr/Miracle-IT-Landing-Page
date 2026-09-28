const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_slide_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9356',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function evaluate(send, expr) {
  const evalRes = await send('Runtime.evaluate', {
    expression: expr,
    returnByValue: true
  });
  if (evalRes && evalRes.result && evalRes.result.result) {
    return evalRes.result.result.value;
  }
  return evalRes;
}

async function testSliding() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9356/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('127.0.0.1'));
  if (!pageTab) {
    console.error('Could not find active page tab');
    chrome.kill();
    return;
  }
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 1000));

  // Center why-miracle-it in desktop view
  await evaluate(send, `(() => {
    const el = document.querySelector('#whyTabletDevice');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // 1. Initial desktop slide 1
  let activeDotBefore = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  console.log('Active slide before drag:', activeDotBefore);

  // 2. Perform mouse drag from right to left on viewport
  const viewportBoxJson = await evaluate(send, `(() => {
    const r = document.querySelector('#tabletStoryViewport').getBoundingClientRect();
    return JSON.stringify({ x: r.left + r.width * 0.7, y: r.top + r.height * 0.5, targetX: r.left + r.width * 0.2 });
  })()`);
  const { x, y, targetX } = JSON.parse(viewportBoxJson);

  console.log(`Dragging from (${x}, ${y}) to (${targetX}, ${y})...`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
  // Move in steps
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const curX = x + ((targetX - x) * (i / steps));
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: curX, y, buttons: 1 });
    await new Promise(r => setTimeout(r, 25));
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: targetX, y, button: 'left', buttons: 0 });

  // Wait for snap transition
  await new Promise(r => setTimeout(r, 600));

  let activeDotAfter = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  console.log('Active slide after mouse drag:', activeDotAfter);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_drag_slide_desktop.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_drag_slide_desktop.png');

  // Also drag backwards to test left-to-right dragging
  const backBoxJson = await evaluate(send, `(() => {
    const r = document.querySelector('#tabletStoryViewport').getBoundingClientRect();
    return JSON.stringify({ x: r.left + r.width * 0.3, y: r.top + r.height * 0.5, targetX: r.left + r.width * 0.8 });
  })()`);
  const { x: bx, y: by, targetX: bTargetX } = JSON.parse(backBoxJson);
  console.log(`Dragging backwards from (${bx}, ${by}) to (${bTargetX}, ${by})...`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: bx, y: by, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 1; i <= steps; i++) {
    const curX = bx + ((bTargetX - bx) * (i / steps));
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: curX, y: by, buttons: 1 });
    await new Promise(r => setTimeout(r, 25));
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: bTargetX, y: by, button: 'left', buttons: 0 });
  await new Promise(r => setTimeout(r, 600));

  let activeDotBack = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  console.log('Active slide after backward drag:', activeDotBack);

  // 3. Test on mobile iPhone viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await evaluate(send, `(() => {
    const el = document.querySelector('#whyTabletDevice');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  let mobileBeforeDot = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  console.log('Mobile active slide before swipe:', mobileBeforeDot);

  // Perform touch drag on iPhone screen
  const mobileViewportBoxJson = await evaluate(send, `(() => {
    const r = document.querySelector('#tabletStoryViewport').getBoundingClientRect();
    return JSON.stringify({ x: r.left + r.width * 0.8, y: r.top + r.height * 0.5, targetX: r.left + r.width * 0.15 });
  })()`);
  const { x: mx, y: my, targetX: mTargetX } = JSON.parse(mobileViewportBoxJson);

  console.log(`Mobile touch drag from (${mx}, ${my}) to (${mTargetX}, ${my})...`);
  await send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: mx, y: my, id: 0 }]
  });
  for (let i = 1; i <= 8; i++) {
    const curX = mx + ((mTargetX - mx) * (i / 8));
    await send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: curX, y: my, id: 0 }]
    });
    await new Promise(r => setTimeout(r, 25));
  }
  await send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: []
  });

  await new Promise(r => setTimeout(r, 600));

  let mobileActiveDot = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  console.log('Active slide after mobile swipe:', mobileActiveDot);

  let mobileChapterText = await evaluate(send, `document.querySelector('#iphoneChapterLabel')?.textContent`);
  console.log('iPhone chapter label after swipe:', mobileChapterText);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_drag_slide_mobile.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_drag_slide_mobile.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  console.log('Sliding feature test finished successfully!');
  process.exit(0);
}

testSliding().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
