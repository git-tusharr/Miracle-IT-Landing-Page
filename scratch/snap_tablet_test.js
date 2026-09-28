const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_tablet_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9348',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function runTest() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9348/json');
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

  await new Promise(r => setTimeout(r, 1200));

  // Scroll directly to #why-miracle-it
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#why-miracle-it');
      if (window.lenis) {
        window.lenis.scrollTo(el, { immediate: true });
      } else if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Capture Slide 1 on 1440x900
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_tablet_slide1_desktop.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_tablet_slide1_desktop.png');

  // 2. Click Slide 2 (Capstones)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dot = document.querySelector('.story-dot[data-slide-target="1"]');
      if (dot) dot.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_tablet_slide2_capstones.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_tablet_slide2_capstones.png');

  // 3. Click Slide 4 (Comparison Matrix)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dot = document.querySelector('.story-dot[data-slide-target="3"]');
      if (dot) dot.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_tablet_slide4_matrix.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_tablet_slide4_matrix.png');

  // 4. Click Slide 5 (Pledge)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dot = document.querySelector('.story-dot[data-slide-target="4"]');
      if (dot) dot.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_tablet_slide5_pledge.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_tablet_slide5_pledge.png');

  // 5. Test Laptop Screen (1280x800) on Slide 1
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Runtime.evaluate', {
    expression: `(() => {
      const dot = document.querySelector('.story-dot[data-slide-target="0"]');
      if (dot) dot.click();
      const el = document.querySelector('#why-miracle-it');
      if (window.lenis) {
        window.lenis.scrollTo(el, { immediate: true });
      } else if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_tablet_laptop_1280x800.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_tablet_laptop_1280x800.png');

  // 6. Test Mobile Screen (390x844) on Slide 1
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#why-miracle-it');
      if (window.lenis) {
        window.lenis.scrollTo(el, { immediate: true });
      } else if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 800));
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_tablet_mobile_390x844.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_tablet_mobile_390x844.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  console.log('Done test run!');
  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
