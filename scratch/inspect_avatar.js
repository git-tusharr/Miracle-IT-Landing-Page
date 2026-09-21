const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9225',
  '--disable-gpu',
  '--window-size=1440,1080',
  'http://localhost:3000'
]);

const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffd0a939-b75a-47e9-a6d1-7e8851c83a23';

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9225/json');
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

    // Scroll directly to the first card
    const evalData = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const card = document.querySelector('.proof-review-card');
        const avWrap = document.querySelector('.proof-author-avatar-wrap');
        const img = document.querySelector('.proof-author-avatar');
        if (card) card.scrollIntoView({ block: 'center', inline: 'center' });

        const wrapComp = window.getComputedStyle(avWrap);
        const beforeComp = window.getComputedStyle(avWrap, '::before');
        const imgComp = window.getComputedStyle(img);

        const cr = card ? card.getBoundingClientRect() : { x: 0, y: 0, width: 0, height: 0 };
        const ar = avWrap ? avWrap.getBoundingClientRect() : { x: 0, y: 0, width: 0, height: 0 };
        const cardRect = { x: cr.x, y: cr.y, width: cr.width, height: cr.height };
        const avRect = { x: ar.x, y: ar.y, width: ar.width, height: ar.height };

        return {
          cardRect,
          avRect,
          wrapWidth: wrapComp.width,
          wrapHeight: wrapComp.height,
          wrapPadding: wrapComp.padding,
          wrapBorderRadius: wrapComp.borderRadius,
          wrapBoxShadow: wrapComp.boxShadow,
          wrapBackground: wrapComp.background,
          beforeContent: beforeComp.content,
          beforeAnimation: beforeComp.animation,
          beforeBackground: beforeComp.backgroundImage || beforeComp.background,
          beforeInset: beforeComp.inset || (beforeComp.top + ' ' + beforeComp.left),
          beforeZIndex: beforeComp.zIndex,
          imgWidth: imgComp.width,
          imgHeight: imgComp.height,
          imgBorderRadius: imgComp.borderRadius,
          imgZIndex: imgComp.zIndex
        };
      })()`
    });

    const rawVal = evalData.result?.result?.value || evalData.result?.value || evalData;
    console.log('EVAL DATA:', JSON.stringify(rawVal, null, 2));

    await new Promise(r => setTimeout(r, 500));

    // Capture clipped screenshot around card
    const rect = rawVal?.cardRect;
    if (rect) {
      const clipScreenshot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: Math.max(0, rect.x - 30),
          y: Math.max(0, rect.y - 30),
          width: rect.width + 60,
          height: rect.height + 60,
          scale: 2
        }
      });
      fs.writeFileSync(path.join(outDir, 'snap_card_avatar_magnified.png'), Buffer.from(clipScreenshot.result.data, 'base64'));
      console.log('Saved snap_card_avatar_magnified.png');
    }

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

run();
