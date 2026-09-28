const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function testFix() {
  const port = 9389;
  const tmpDir = path.join(os.tmpdir(), 'edge-blur-fix-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,900'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const targets = await new Promise((res, rej) => {
      const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      });
      req.on('error', rej);
    });

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const send = (method, params = {}) => new Promise((res, rej) => {
      const id = msgId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 2000));

    // Inject temporary fix style to hide pseudo elements and verify
    await send('Runtime.evaluate', {
      expression: `(() => {
        const style = document.createElement('style');
        style.id = 'fix-mask-blur';
        style.textContent = \`
          .proof-testimonials-mask::before,
          .proof-testimonials-mask::after,
          .proof-students-mask::before,
          .proof-students-mask::after,
          .marquee-gradient-mask::before,
          .marquee-gradient-mask::after {
            display: none !important;
          }
          .proof-testimonials-mask {
            mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%) !important;
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%) !important;
          }
        \`;
        document.head.appendChild(style);

        const el = document.querySelector('.proof-testimonials-slider-wrap');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`
    });

    await new Promise(r => setTimeout(r, 600));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/shot_feedback_fixed_preview.png', Buffer.from(shot.data, 'base64'));
    console.log('Captured scratch/shot_feedback_fixed_preview.png');

    ws.close();
  } finally {
    edge.kill();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

testFix();
