const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9224',
  '--disable-gpu',
  '--window-size=1440,1080',
  'http://localhost:3000'
]);

const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffd0a939-b75a-47e9-a6d1-7e8851c83a23';

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9224/json');
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
    await send('DOM.enable');
    await send('CSS.enable');

    // Wait for fonts & images
    await new Promise(r => setTimeout(r, 1500));

    // Evaluate avatar metrics
    const evalResult = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const wrap = document.querySelector('.proof-testimonials-slider-wrap');
        const cards = document.querySelectorAll('.proof-review-card');
        const avatars = document.querySelectorAll('.proof-author-avatar-wrap');
        const imgs = document.querySelectorAll('.proof-author-avatar');

        if (wrap) {
          wrap.scrollIntoView({ block: 'center' });
        }

        const avatarStats = Array.from(avatars).map((av, idx) => {
          const comp = window.getComputedStyle(av);
          const compBefore = window.getComputedStyle(av, '::before');
          const img = imgs[idx];
          const imgComp = img ? window.getComputedStyle(img) : null;
          return {
            index: idx,
            wrapWidth: comp.width,
            wrapHeight: comp.height,
            wrapBorderRadius: comp.borderRadius,
            wrapPadding: comp.padding,
            wrapOverflow: comp.overflow,
            beforeAnimationName: compBefore.animationName,
            beforeAnimationDuration: compBefore.animationDuration,
            beforeAnimationDelay: compBefore.animationDelay,
            imgWidth: imgComp ? imgComp.width : null,
            imgHeight: imgComp ? imgComp.height : null,
            imgBorderRadius: imgComp ? imgComp.borderRadius : null,
            imgSrc: img ? img.src : null,
            imgComplete: img ? img.complete : false
          };
        });

        // Overflow check
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const hasOverflow = scrollWidth > innerWidth;

        return {
          totalCards: cards.length,
          totalAvatars: avatars.length,
          avatarStats: avatarStats.slice(0, 4),
          hasOverflow,
          scrollWidth,
          innerWidth
        };
      })()`
    });

    console.log('AVATAR EVALUATION METRICS:');
    console.log(JSON.stringify(evalResult?.result?.value, null, 2));

    await new Promise(r => setTimeout(r, 600));

    // Capture desktop screenshot of testimonials
    const desktopScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    fs.writeFileSync(path.join(outDir, 'snap_trainee_feedback_desktop.png'), Buffer.from(desktopScreenshot.result.data, 'base64'));
    console.log('Saved snap_trainee_feedback_desktop.png');

    // Switch to mobile viewport (375x812)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 800));

    // Scroll to testimonials on mobile
    await send('Runtime.evaluate', {
      expression: `(() => {
        const wrap = document.querySelector('.proof-testimonials-slider-wrap');
        if (wrap) wrap.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    fs.writeFileSync(path.join(outDir, 'snap_trainee_feedback_mobile.png'), Buffer.from(mobileScreenshot.result.data, 'base64'));
    console.log('Saved snap_trainee_feedback_mobile.png');

    // Close
    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Error during test:', err);
    chrome.kill();
  }
}

run();
