const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000',
  'http://localhost:3000'
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
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[Browser Console]', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[Browser Exception]', data.params.exceptionDetails);
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

  // Wait 2 seconds for scripts and animations to settle
  await new Promise(r => setTimeout(r, 2000));

  // Diagnose sections
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const why = document.querySelector('#why-miracle-it');
      const learn = document.querySelector('#learning-experience');
      const who = document.querySelector('#who-can-join');
      const process = document.querySelector('#counselling-process');

      return {
        why: why ? {
          rect: why.getBoundingClientRect(),
          offsetParent: why.offsetParent ? why.offsetParent.tagName : null,
          offsetTop: why.offsetTop,
          offsetHeight: why.offsetHeight,
          pinSpacer: !!why.closest('.pin-spacer')
        } : null,
        learn: learn ? {
          rect: learn.getBoundingClientRect(),
          offsetTop: learn.offsetTop,
          offsetHeight: learn.offsetHeight
        } : null,
        who: who ? {
          rect: who.getBoundingClientRect(),
          offsetParent: who.offsetParent ? who.offsetParent.tagName : null,
          offsetTop: who.offsetTop,
          offsetHeight: who.offsetHeight,
          pinSpacer: !!who.closest('.pin-spacer'),
          stackContainerPinSpacer: !!document.querySelector('.who-stack-container')?.closest('.pin-spacer')
        } : null,
        process: process ? {
          rect: process.getBoundingClientRect(),
          offsetTop: process.offsetTop,
          offsetHeight: process.offsetHeight
        } : null,
        navLinks: Array.from(document.querySelectorAll('.nav-link')).map(l => ({
          text: l.textContent.trim(),
          href: l.getAttribute('href'),
          active: l.classList.contains('is-active')
        })),
        scrollTriggers: window.ScrollTrigger ? window.ScrollTrigger.getAll().map(st => ({
          trigger: st.trigger ? (st.trigger.id || st.trigger.className) : null,
          start: st.start,
          end: st.end,
          pin: !!st.pin
        })) : 'No ScrollTrigger'
      };
    })()`,
    returnByValue: true
  });

  console.log('--- SECTION DIAGNOSTICS ---');
  console.log(JSON.stringify(evalRes, null, 2));

  // Take screenshot of who-can-join area
  // Scroll to who-can-join
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#who-can-join');
      if (el) el.scrollIntoView();
    })()`
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshot = await send('Page.captureScreenshot');
  fs.writeFileSync('scratch/screenshot_who.png', Buffer.from(screenshot.result.data, 'base64'));
  console.log('Saved scratch/screenshot_who.png');

  ws.close();
  chrome.kill();
}

run().catch(err => {
  console.error(err);
  chrome.kill();
});
