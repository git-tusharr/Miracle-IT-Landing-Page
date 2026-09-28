const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function inspectMask() {
  const port = 9394;
  const tmpDir = path.join(os.tmpdir(), 'edge-inspect-' + Date.now());
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

    const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 2000));

    const styles = await send('Runtime.evaluate', {
      expression: `(() => {
        const mask = document.querySelector('.proof-testimonials-mask');
        const sec = document.getElementById('proof');
        const beforeStyle = window.getComputedStyle(mask, '::before');
        const afterStyle = window.getComputedStyle(mask, '::after');
        const maskStyle = window.getComputedStyle(mask);
        const secStyle = window.getComputedStyle(sec);
        return {
          sectionClasses: sec.className,
          sectionBg: secStyle.backgroundColor,
          maskBg: maskStyle.backgroundColor,
          maskImage: maskStyle.maskImage || maskStyle.webkitMaskImage,
          beforeContent: beforeStyle.content,
          beforeBg: beforeStyle.backgroundImage || beforeStyle.backgroundColor,
          beforeWidth: beforeStyle.width,
          afterBg: afterStyle.backgroundImage || afterStyle.backgroundColor,
          afterWidth: afterStyle.width
        };
      })()`,
      returnByValue: true
    });
    console.log('Mask pseudo styles:', JSON.stringify(styles.result.value, null, 2));

    ws.close();
  } finally {
    edge.kill();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

inspectMask();
