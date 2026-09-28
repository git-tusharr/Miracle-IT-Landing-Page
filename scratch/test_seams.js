const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9256',
  '--disable-gpu',
  '--window-size=1440,900',
  'http://localhost:3000'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9256/json');
    const tabs = await res.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
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
    await new Promise((r) => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    // Scroll to the boundary between placed-students and problem
    await send('Runtime.evaluate', {
      expression: `(() => {
        const prob = document.getElementById('problem');
        const rect = prob.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - 400);
      })()`
    });
    await new Promise((r) => setTimeout(r, 600));
    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/seam_top_boundary.png', Buffer.from(ss.result.data, 'base64'));

    // Scroll to the boundary between location and faq
    await send('Runtime.evaluate', {
      expression: `(() => {
        const faq = document.getElementById('faq');
        const rect = faq.getBoundingClientRect();
        window.scrollTo(0, window.pageYOffset + rect.top - 400);
      })()`
    });
    await new Promise((r) => setTimeout(r, 600));
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/seam_bottom_boundary.png', Buffer.from(ss.result.data, 'base64'));

    ws.close();
    chrome.kill();
    console.log('Seam screenshots captured successfully!');
  } catch (err) {
    console.error(err);
    chrome.kill();
  }
}, 2000);
