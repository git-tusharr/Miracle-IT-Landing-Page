const { spawn } = require('child_process');

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

  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2000));

  for (const width of [360, 390, 768]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: width,
      height: 800,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const winW = window.innerWidth;
        const bodyChildren = Array.from(document.body.children).filter(el => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE');
        
        const main = document.querySelector('#main-content');
        const sectionInfo = [];
        if (main) {
          for (const s of main.children) {
            const cs = window.getComputedStyle(s);
            if (s.scrollWidth > winW) {
              // Find inner element causing scrollWidth
              const offenders = [];
              for (const descendant of s.querySelectorAll('*')) {
                if (descendant.scrollWidth > winW || descendant.getBoundingClientRect().right > winW + 1) {
                  const dcs = window.getComputedStyle(descendant);
                  if (dcs.overflowX !== 'hidden') {
                    offenders.push({
                      tag: descendant.tagName,
                      id: descendant.id,
                      className: descendant.className,
                      offsetWidth: descendant.offsetWidth,
                      scrollWidth: descendant.scrollWidth,
                      rectRight: Math.round(descendant.getBoundingClientRect().right),
                      overflowX: dcs.overflowX
                    });
                  }
                }
              }
              sectionInfo.push({
                tag: s.tagName,
                id: s.id,
                className: s.className,
                scrollWidth: s.scrollWidth,
                offsetWidth: s.offsetWidth,
                offendersCount: offenders.length,
                topOffenders: offenders.slice(0, 5)
              });
            }
          }
        }
        return { winW, bodyScrollW: document.body.scrollWidth, sectionInfo };
      })()`,
      returnByValue: true
    });

    console.log(`\n--- Width: ${width}px ---`);
    console.log(JSON.stringify(check.result?.result?.value || check.result?.value, null, 2));
  }

  ws.close();
  chrome.kill();
}
run().catch(e => { console.error(e); chrome.kill(); });
