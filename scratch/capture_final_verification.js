const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_verify_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9315',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function verify() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9315/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
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

  await new Promise(r => setTimeout(r, 1200));

  // 1. Header screenshot
  const headerClip = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.site-header');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: 0, y: 0, width: rect.width, height: 90, scale: 1 };
    })()`
  });

  if (headerClip.result.result.value) {
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: headerClip.result.result.value });
    fs.writeFileSync(path.resolve(__dirname, 'final_header_live.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved final_header_live.png');
  }

  // 2. Final CTA screenshot
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#final-cta');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const ctaClip = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('#final-cta .final-cta-content');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: Math.max(0, rect.left - 20), y: Math.max(0, rect.top - 20), width: rect.width + 40, height: 320, scale: 1 };
    })()`
  });

  if (ctaClip.result.result.value) {
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: ctaClip.result.result.value });
    fs.writeFileSync(path.resolve(__dirname, 'final_cta_live.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved final_cta_live.png');
  }

  // 3. Footer screenshot
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#siteFooter');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const footerClip = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('.footer-col.brand-col');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: Math.max(0, rect.left - 10), y: Math.max(0, rect.top - 10), width: rect.width + 20, height: 280, scale: 1 };
    })()`
  });

  if (footerClip.result.result.value) {
    const shot = await send('Page.captureScreenshot', { format: 'png', clip: footerClip.result.result.value });
    fs.writeFileSync(path.resolve(__dirname, 'final_footer_live.png'), Buffer.from(shot.result.data, 'base64'));
    console.log('Saved final_footer_live.png');
  }

  // Check computed styles
  const styles = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const getS = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return { bg: cs.backgroundColor, border: cs.border, shadow: cs.boxShadow, padding: cs.padding };
      };
      return {
        headerLogoLink: getS('.brand-logo'),
        ctaLogoLink: getS('.final-cta-logo-link'),
        footerLogoLink: getS('.footer-logo-link'),
        ctaLogoWrap: getS('.final-cta-logo-wrap')
      };
    })()`
  });

  console.log('Final styles:', JSON.stringify(styles.result.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
