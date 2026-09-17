const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000'
]);

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Full Stack', path: '/full-stack-course-bhopal/' },
  { name: 'Data Analytics', path: '/data-analytics-course-bhopal/' },
  { name: 'Cybersecurity', path: '/cybersecurity-course-bhopal/' },
  { name: 'Cloud DevOps', path: '/cloud-devops-course-bhopal/' },
  { name: 'AI & ML', path: '/ai-ml-course-bhopal/' },
  { name: 'Visit Bhopal', path: '/visit-bhopal/' },
  { name: 'Thank You', path: '/thank-you/' }
];

const viewports = [
  { width: 360, height: 740, name: '360px (Galaxy S8/Small Android)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14/15)' },
  { width: 414, height: 896, name: '414px (Large Phone)' },
  { width: 768, height: 1024, name: '768px (iPad/Tablet)' },
  { width: 1024, height: 768, name: '1024px (Tablet Landscape/Laptop)' }
];

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

  const allResults = [];

  for (const p of pages) {
    console.log(`\n========================================`);
    console.log(`Auditing Page: ${p.name} (${p.path})`);
    console.log(`========================================`);

    await send('Page.navigate', { url: `http://localhost:3000${p.path}` });
    await new Promise(r => setTimeout(r, 2000));

    for (const vp of viewports) {
      // Set viewport
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });
      await new Promise(r => setTimeout(r, 500));

      // Check overflow
      const overflowInfo = await send('Runtime.evaluate', {
        expression: `(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const bodyW = document.body.scrollWidth;
          const hasHorizontalScroll = docW > winW || bodyW > winW;
          
          let culprits = [];
          if (hasHorizontalScroll) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > winW + 1) { // 1px tolerance
                culprits.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id,
                  className: typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join(' ') : '',
                  width: Math.round(rect.width),
                  right: Math.round(rect.right),
                  overflowAmount: Math.round(rect.right - winW)
                });
              }
            }
          }

          // Sort culprits by overflow amount descending and take top 5
          culprits.sort((a, b) => b.overflowAmount - a.overflowAmount);

          return {
            docW,
            bodyW,
            winW,
            hasHorizontalScroll,
            culpritCount: culprits.length,
            topCulprits: culprits.slice(0, 5)
          };
        })()`,
        returnByValue: true
      });

      const evalData = overflowInfo.result?.result || overflowInfo.result;
      const resVal = evalData?.value;
      const status = resVal && !resVal.hasHorizontalScroll ? '✅ PASS' : '❌ OVERFLOW';
      console.log(`  [${vp.name}] ${status} (docW: ${resVal?.docW}px, winW: ${resVal?.winW}px)`);
      if (resVal && resVal.hasHorizontalScroll) {
        console.log(`    Culprits (${resVal.culpritCount} total):`, JSON.stringify(resVal.topCulprits, null, 2));
      }

      allResults.push({
        page: p.name,
        path: p.path,
        viewport: vp.name,
        width: vp.width,
        pass: resVal ? !resVal.hasHorizontalScroll : false,
        data: resVal
      });
    }
  }

  fs.writeFileSync('scratch/audit_results.json', JSON.stringify(allResults, null, 2));
  console.log('\nAudit complete! Results written to scratch/audit_results.json');
  ws.close();
  chrome.kill();
}

run().catch(e => {
  console.error(e);
  chrome.kill();
});
