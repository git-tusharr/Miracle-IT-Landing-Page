const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000'
]);

async function run() {
  try {
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

    const widths = [375, 768, 1280];

    for (const w of widths) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: 900,
        deviceScaleFactor: 1,
        mobile: w < 768
      });
      await send('Page.navigate', { url: 'http://localhost:3000/' });
      await new Promise(r => setTimeout(r, 2000));

      const overflowCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const overflowX = Math.max(docEl.scrollWidth, body.scrollWidth) > window.innerWidth;
          
          // Check overflowing elements
          const elements = Array.from(document.querySelectorAll('*'));
          const overflowingElements = [];
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth + 1.5) {
              overflowingElements.push({
                tag: el.tagName,
                id: el.id,
                className: el.className ? el.className.toString().slice(0, 50) : '',
                right: Math.round(rect.right),
                windowWidth: window.innerWidth
              });
            }
          });

          return {
            windowWidth: window.innerWidth,
            hasOverflowX: overflowX,
            overflowCount: overflowingElements.length,
            overflowingElements: overflowingElements.slice(0, 5)
          };
        })()`,
        returnByValue: true
      });

      console.log('Width ' + w + 'px Overflow Check:', overflowCheck.result?.result?.value);
    }

    // Capture screenshots of Final CTA on mobile and desktop
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 900,
      deviceScaleFactor: 1,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:3000/#final-cta' });
    await new Promise(r => setTimeout(r, 1200));

    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/snap_final_cta_mobile.png', Buffer.from(mobileShot.result.data, 'base64'));
    console.log('Saved scratch/snap_final_cta_mobile.png');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:3000/#final-cta' });
    await new Promise(r => setTimeout(r, 1200));

    const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/snap_final_cta_desktop.png', Buffer.from(desktopShot.result.data, 'base64'));
    console.log('Saved scratch/snap_final_cta_desktop.png');

    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

run();
