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

  const sizes = [360, 390, 768];

  for (const w of sizes) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: 840,
      deviceScaleFactor: 1,
      mobile: w < 768
    });
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 2000));

    // Audit layout anomalies:
    // 1. Any element whose clientWidth or offsetWidth > w
    // 2. Any button/link smaller than 44px touch target or with text wrapping awkwardness
    // 3. Any text with font-size > viewport width causing overflow
    // 4. Modal / drawer behavior
    const audit = await send('Runtime.evaluate', {
      expression: `(() => {
        const issues = [];
        const winW = window.innerWidth;
        
        // Check all elements for overflow
        document.querySelectorAll('*').forEach(el => {
          if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'HEAD', 'META', 'TITLE', 'LINK'].includes(el.tagName)) return;
          const cls = typeof el.className === 'string' ? el.className : (el.className?.baseVal || '');
          const selector = el.tagName + (el.id ? '#' + el.id : '') + (cls ? '.' + cls.split(' ').filter(Boolean).slice(0, 2).join('.') : '');
          const r = el.getBoundingClientRect();
          if (r.right > winW + 2 && !el.closest('.company-marquee-wrap') && !el.closest('.testimonials-marquee-wrapper') && !el.closest('.who-stack-nav')) {
            const cs = window.getComputedStyle(el);
            if (cs.position !== 'absolute' && cs.position !== 'fixed' && cs.overflowX !== 'hidden') {
              issues.push({
                type: 'HORIZONTAL_OVERFLOW',
                selector,
                width: Math.round(r.width),
                right: Math.round(r.right),
                winW
              });
            }
          }

          // Check for awkward clipping or text ellipsis
          if (el.scrollWidth > el.clientWidth + 2) {
            const cs = window.getComputedStyle(el);
            if (cs.overflowX === 'visible' && !['HTML', 'BODY'].includes(el.tagName)) {
              issues.push({
                type: 'CONTENT_CLIPPED_OR_EXPANDING',
                selector,
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth
              });
            }
          }
        });

        // Check sections
        const sections = Array.from(document.querySelectorAll('section, header, footer')).map(s => ({
          id: s.id || s.className.split(' ')[0],
          rect: {
            top: Math.round(s.getBoundingClientRect().top),
            height: Math.round(s.getBoundingClientRect().height),
            width: Math.round(s.getBoundingClientRect().width)
          }
        }));

        return {
          winW,
          bodyScrollW: document.body.scrollWidth,
          htmlScrollW: document.documentElement.scrollWidth,
          issueCount: issues.length,
          topIssues: issues.slice(0, 10),
          sections
        };
      })()`,
      returnByValue: true
    });

    if (audit.result?.exceptionDetails) {
      console.error('Eval exception:', JSON.stringify(audit.result.exceptionDetails, null, 2));
    } else {
      console.log(`\n=== Homepage Audit @ ${w}px ===`);
      console.log(JSON.stringify(audit.result?.result?.value, null, 2));
    }
  }

  ws.close();
  chrome.kill();
}
run().catch(e => { console.error(e); chrome.kill(); });
