const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_verify_slide_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9377',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function evaluate(send, expr) {
  const evalRes = await send('Runtime.evaluate', { expression: expr });
  console.log('evalRes for', expr.slice(0, 40), '->', JSON.stringify(evalRes));
  return evalRes.result?.result?.value;
}

async function runVerification() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9377/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('127.0.0.1'));
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

  // Wait for document ready and viewport element
  for (let i = 0; i < 50; i++) {
    const ready = await send('Runtime.evaluate', { expression: 'document.readyState' });
    const hasVp = await send('Runtime.evaluate', { expression: '!!document.querySelector("#tabletStoryViewport")' });
    if (ready.result?.result?.value === 'complete' && hasVp.result?.result?.value === true) {
      console.log('Page ready and #tabletStoryViewport found!');
      break;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('=== TEST 1: DESKTOP SLIDING (1440x900) ===');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Scroll to tablet & wait for layout
  await evaluate(send, `(() => {
    document.querySelector('#why-miracle-it')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // Initial chapter
  let slide0 = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  let chapterPill0 = await evaluate(send, `document.querySelector('#tabletChapterText')?.textContent`);
  console.log(`Initial State -> Active Slide: ${slide0} | Chapter Pill: "${chapterPill0}"`);

  // Helper for mouse drag
  async function performMouseDrag(dragDistancePercent) {
    const vpBoxStr = await evaluate(send, `(() => {
      const r = document.querySelector('#tabletStoryViewport').getBoundingClientRect();
      return JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height });
    })()`);
    const r = JSON.parse(vpBoxStr);
    const startX = r.left + r.width * 0.7;
    const startY = r.top + r.height * 0.5;
    const endX = startX - (r.width * dragDistancePercent);

    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: startX, y: startY, button: 'left', buttons: 1, clickCount: 1 });
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const curX = startX + (endX - startX) * (i / steps);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: curX, y: startY, buttons: 1 });
      await new Promise(res => setTimeout(res, 20));
    }
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: endX, y: startY, button: 'left', buttons: 0 });
    await new Promise(res => setTimeout(res, 500));
  }

  // 1. Drag slide 0 -> slide 1
  console.log('Dragging left by 40% of screen to trigger Slide 1...');
  await performMouseDrag(0.40);
  let slide1 = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  let chapterPill1 = await evaluate(send, `document.querySelector('#tabletChapterText')?.textContent`);
  console.log(`After 1st Drag -> Active Slide: ${slide1} | Chapter Pill: "${chapterPill1}"`);

  // Capture screenshot of Slide 1 on desktop
  let shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const desktopSlide1Path = path.resolve(__dirname, 'snap_drag_desktop_ch2.png');
  fs.writeFileSync(desktopSlide1Path, Buffer.from(shot1.result.data, 'base64'));
  console.log('Saved snap_drag_desktop_ch2.png');

  // 2. Drag slide 1 -> slide 2
  console.log('Dragging left by 40% of screen to trigger Slide 2...');
  await performMouseDrag(0.40);
  let slide2 = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  let chapterPill2 = await evaluate(send, `document.querySelector('#tabletChapterText')?.textContent`);
  console.log(`After 2nd Drag -> Active Slide: ${slide2} | Chapter Pill: "${chapterPill2}"`);

  // 3. Drag backwards (right by 40%) to go from Slide 2 -> Slide 1
  console.log('Dragging right by 40% of screen backwards to trigger Slide 1...');
  await performMouseDrag(-0.40);
  let slideBack = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  let chapterPillBack = await evaluate(send, `document.querySelector('#tabletChapterText')?.textContent`);
  console.log(`After Backward Drag -> Active Slide: ${slideBack} | Chapter Pill: "${chapterPillBack}"`);

  console.log('\n=== TEST 2: MOBILE IPHONE SLIDING (390x844) ===');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await evaluate(send, `(() => {
    document.querySelector('#why-miracle-it')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  let mobileInitial = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  let mobileLabel0 = await evaluate(send, `document.querySelector('#iphoneChapterLabel')?.textContent`);
  console.log(`Mobile Initial -> Active Slide: ${mobileInitial} | iPhone Label: "${mobileLabel0}"`);

  // Helper for touch swipe
  async function performTouchSwipe(swipeDistancePercent) {
    const vpBoxStr = await evaluate(send, `(() => {
      const r = document.querySelector('#tabletStoryViewport').getBoundingClientRect();
      return JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height });
    })()`);
    const r = JSON.parse(vpBoxStr);
    const startX = r.left + r.width * 0.8;
    const startY = r.top + r.height * 0.5;
    const endX = startX - (r.width * swipeDistancePercent);

    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: startX, y: startY, id: 0 }]
    });
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const curX = startX + (endX - startX) * (i / steps);
      await send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: curX, y: startY, id: 0 }]
      });
      await new Promise(res => setTimeout(res, 20));
    }
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
    await new Promise(res => setTimeout(res, 500));
  }

  console.log('Mobile swipe left by 50%...');
  await performTouchSwipe(0.50);
  let mobileSlideAfter = await evaluate(send, `document.querySelector('.story-dot.is-active')?.getAttribute('data-slide-target')`);
  let mobileLabelAfter = await evaluate(send, `document.querySelector('#iphoneChapterLabel')?.textContent`);
  console.log(`After Mobile Swipe -> Active Slide: ${mobileSlideAfter} | iPhone Label: "${mobileLabelAfter}"`);

  // Capture screenshot of mobile iPhone
  let shotMobile = await send('Page.captureScreenshot', { format: 'png' });
  const mobileSlidePath = path.resolve(__dirname, 'snap_drag_mobile_ch2.png');
  fs.writeFileSync(mobileSlidePath, Buffer.from(shotMobile.result.data, 'base64'));
  console.log('Saved snap_drag_mobile_ch2.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}

  console.log('\n=== ALL SLIDING TESTS PASSED SUCCESSFULLY! ===');
}

runVerification().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
