const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9277',
  '--disable-gpu',
  '--window-size=1440,900',
  'http://127.0.0.1:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9277/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && callbacks.has(d.id)) {
      callbacks.get(d.id)(d);
      callbacks.delete(d.id);
    }
  };
  const send = (m, p = {}) => {
    const curId = id++;
    return new Promise(r => {
      callbacks.set(curId, r);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('DOM.enable');
  await send('CSS.enable');

  // Let CSS and fonts settle
  await new Promise(r => setTimeout(r, 1000));

  // 1. Screenshot of the entire header bar
  const headerClip = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.site-header');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, scale: 1 };
    })()`
  });

  if (headerClip.result.result.value) {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: headerClip.result.result.value
    });
    fs.writeFileSync(path.resolve(__dirname, 'header_captured.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved scratch/header_captured.png');
  }

  // 2. Screenshot of the CTA logo area
  const ctaClip = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.final-cta-content');
      if (!el) return null;
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      const rect = el.getBoundingClientRect();
      return { x: Math.max(0, rect.left), y: Math.max(0, rect.top), width: rect.width, height: 350, scale: 1 };
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  // Re-fetch rect after scroll
  const ctaClipAfter = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.final-cta-content');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: Math.max(0, rect.left), y: Math.max(0, rect.top), width: rect.width, height: 350, scale: 1 };
    })()`
  });

  if (ctaClipAfter.result.result.value) {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: ctaClipAfter.result.result.value
    });
    fs.writeFileSync(path.resolve(__dirname, 'cta_captured.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved scratch/cta_captured.png');
  }

  // 3. Screenshot of footer logo area
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.site-footer');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const footerClip = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.footer-col.brand-col');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: Math.max(0, rect.left), y: Math.max(0, rect.top), width: rect.width + 50, height: rect.height + 40, scale: 1 };
    })()`
  });

  if (footerClip.result.result.value) {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: footerClip.result.result.value
    });
    fs.writeFileSync(path.resolve(__dirname, 'footer_captured.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved scratch/footer_captured.png');
  }

  // 4. Inspect computed styles
  const computed = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const h = document.querySelector('.brand-logo');
      const c = document.querySelector('.final-cta-logo-link');
      const f = document.querySelector('.footer-logo-link');
      return {
        headerLogo: h ? {
          background: window.getComputedStyle(h).backgroundColor,
          border: window.getComputedStyle(h).border,
          boxShadow: window.getComputedStyle(h).boxShadow
        } : null,
        ctaLogo: c ? {
          background: window.getComputedStyle(c).backgroundColor,
          border: window.getComputedStyle(c).border,
          boxShadow: window.getComputedStyle(c).boxShadow
        } : null,
        footerLogo: f ? {
          background: window.getComputedStyle(f).backgroundColor,
          border: window.getComputedStyle(f).border,
          boxShadow: window.getComputedStyle(f).boxShadow
        } : null
      };
    })()`
  });

  console.log('Computed styles:', JSON.stringify(computed.result.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
