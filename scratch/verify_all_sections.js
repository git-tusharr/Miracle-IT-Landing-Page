const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9255',
  '--disable-gpu',
  '--window-size=1440,1080',
  'http://localhost:3000'
]);

const outDir = path.resolve(__dirname);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9255/json');
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

    // Wait for fonts, styles & images
    await new Promise(r => setTimeout(r, 2000));

    // 1. Screenshot of Header & Hero
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 0);`
    });
    await new Promise(r => setTimeout(r, 600));

    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_desktop_header_hero.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_desktop_header_hero.png');

    // 2. Logo Zoom Crop
    const logoBox = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const logo = document.querySelector('.header-brand-logo-img');
        if (!logo) return null;
        const rect = logo.getBoundingClientRect();
        return { x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20 };
      })()`
    });

    if (logoBox && logoBox.result && logoBox.result.value) {
      const clip = logoBox.result.value;
      const logoSs = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: Math.max(0, clip.x),
          y: Math.max(0, clip.y),
          width: clip.width,
          height: clip.height,
          scale: 1
        }
      });
      fs.writeFileSync(path.join(outDir, 'snap_desktop_logo_zoom.png'), Buffer.from(logoSs.result.data, 'base64'));
      console.log('Saved snap_desktop_logo_zoom.png');
    }

    // 3. Screenshot of Placed Students & Hiring Companies
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('placed-students');
        if (el) el.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_desktop_placed_and_hiring.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_desktop_placed_and_hiring.png');

    // 4. Transition into Problem (Dark Theme)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const prob = document.getElementById('problem');
        if (prob) {
          const rect = prob.getBoundingClientRect();
          window.scrollTo(0, window.pageYOffset + rect.top - 120);
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_desktop_problem_transition.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_desktop_problem_transition.png');

    // 5. Screenshot of FAQ Section
    await send('Runtime.evaluate', {
      expression: `(() => {
        const faq = document.getElementById('faq');
        if (faq) faq.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_desktop_faq.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_desktop_faq.png');

    // 6. Screenshot of Footer
    await send('Runtime.evaluate', {
      expression: `(() => {
        const footer = document.getElementById('siteFooter');
        if (footer) footer.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_desktop_footer.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_desktop_footer.png');

    // 7. Mobile Viewport Test (390x844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));

    // Mobile Hero
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
    await new Promise(r => setTimeout(r, 600));
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_mobile_hero.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_mobile_hero.png');

    // Mobile Placed Students
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('placed-students');
        if (el) el.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_mobile_placed.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_mobile_placed.png');

    // Mobile FAQ
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('faq');
        if (el) el.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_mobile_faq.png'), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved snap_mobile_faq.png');

    ws.close();
    chrome.kill();
    console.log('All verification snapshots completed successfully.');
  } catch (err) {
    console.error('Error during verification:', err);
    chrome.kill();
  }
}

run();
