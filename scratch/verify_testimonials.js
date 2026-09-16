const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9223',
  '--disable-gpu',
  '--window-size=1400,1200',
  'http://localhost:3000'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9223/json');
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

    // Wait 1.5s for fonts/images to render
    await new Promise(r => setTimeout(r, 1500));

    // Scroll to proof section & testimonials
    const checkResult = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const wrap = document.querySelector('.proof-testimonials-slider-wrap');
        const cards = document.querySelectorAll('.proof-review-card');
        const ethicalNotice = document.querySelector('.proof-verification-notice');
        const proofGrid = document.querySelector('.proof-grid');

        if (wrap) {
          wrap.scrollIntoView({ block: 'center' });
        }

        const cardDetails = Array.from(cards).map(c => {
          const stars = c.querySelectorAll('.proof-star-svg').length;
          const name = c.querySelector('.proof-author-name')?.innerText?.trim();
          const role = c.querySelector('.proof-author-role')?.innerText?.trim();
          const quote = c.querySelector('.proof-review-text')?.innerText?.trim();
          const img = c.querySelector('.proof-author-avatar');
          return {
            name,
            role,
            quote,
            starsCount: stars,
            imgSrc: img ? img.src : null,
            imgComplete: img ? img.complete : false,
            imgNaturalWidth: img ? img.naturalWidth : 0,
            rect: c.getBoundingClientRect()
          };
        });

        // Check relative positioning
        let positionCorrect = false;
        if (proofGrid && wrap && ethicalNotice) {
          const gridBottom = proofGrid.getBoundingClientRect().bottom;
          const wrapTop = wrap.getBoundingClientRect().top;
          const wrapBottom = wrap.getBoundingClientRect().bottom;
          const noticeTop = ethicalNotice.getBoundingClientRect().top;
          positionCorrect = (wrapTop >= gridBottom - 100) && (noticeTop >= wrapBottom - 100);
        }

        return {
          wrapExists: !!wrap,
          totalCards: cards.length,
          cardDetails,
          positionCorrect
        };
      })()`
    });

    console.log('DOM & CARD VERIFICATION:', JSON.stringify(checkResult?.result?.result?.value || checkResult?.result || checkResult, null, 2));

    await new Promise(r => setTimeout(r, 800));

    // Capture screenshot of testimonials slider
    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\c22db8df-be12-447f-9c1b-8ca1b3855256';
    fs.writeFileSync(path.join(outDir, 'testimonials_slider_view.png'), Buffer.from(screenshot.result.data, 'base64'));
    console.log('Screenshot saved to testimonials_slider_view.png');

    // Also scroll slightly to see ethical notice right below testimonials
    await send('Runtime.evaluate', {
      expression: `window.scrollBy(0, 300);`
    });
    await new Promise(r => setTimeout(r, 600));

    const screenshotNotice = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    fs.writeFileSync(path.join(outDir, 'testimonials_and_ethical_notice.png'), Buffer.from(screenshotNotice.result.data, 'base64'));
    console.log('Screenshot saved to testimonials_and_ethical_notice.png');

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Error during test:', err);
    chrome.kill();
  }
}

run();
