const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = path.join(__dirname, 'chrome_scroll_tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9299',
  '--disable-gpu',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,900',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9299/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const cur = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) {
        ws.removeEventListener('message', handler);
        resolve(d);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));

  // 1. Boundary: Placed Students into Problem
  await send('Runtime.evaluate', {
    expression: `(() => {
      const prob = document.getElementById('problem');
      if (prob) {
        const rect = prob.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - 300);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  let ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'scroll_placed_to_problem.png'), Buffer.from(ss.result.data, 'base64'));

  // 2. Inside Dark Core (Courses / Why)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const courses = document.getElementById('courses');
      if (courses) {
        courses.scrollIntoView({ block: 'start' });
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'scroll_inside_dark_courses.png'), Buffer.from(ss.result.data, 'base64'));

  // 3. Boundary: Location into FAQ
  await send('Runtime.evaluate', {
    expression: `(() => {
      const faq = document.getElementById('faq');
      if (faq) {
        const rect = faq.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - 300);
      }
    })()`
  });
  await new Promise(r => setTimeout(r, 600));
  ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'scroll_location_to_faq.png'), Buffer.from(ss.result.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Scroll screenshots captured successfully!');
}

run().catch(err => {
  console.error(err);
  chrome.kill();
});
