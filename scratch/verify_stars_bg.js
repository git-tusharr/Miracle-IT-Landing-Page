const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function testStars() {
  const port = 9399;
  const tmpDir = path.join(os.tmpdir(), 'edge-stars-' + Date.now());
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
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = msgId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
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

    // Scroll to the counselling-process section
    const sectionInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const sec = document.getElementById('counselling-process');
        if (!sec) return { found: false };
        const rect = sec.getBoundingClientRect();
        sec.scrollIntoView({ behavior: 'instant', block: 'center' });
        const starsBg = sec.querySelector('.stars-bg-container');
        const s1 = document.getElementById('stars');
        const s2 = document.getElementById('stars2');
        const s3 = document.getElementById('stars3');
        return {
          found: true,
          top: rect.top,
          height: rect.height,
          hasStarsBg: !!starsBg,
          hasS1: !!s1,
          hasS2: !!s2,
          hasS3: !!s3,
          s1Animation: s1 ? window.getComputedStyle(s1).animationName : null,
          s2Animation: s2 ? window.getComputedStyle(s2).animationName : null,
          s3Animation: s3 ? window.getComputedStyle(s3).animationName : null,
          secBg: window.getComputedStyle(sec).backgroundImage
        };
      })()`,
      returnByValue: true
    });
    console.log('Section Info:', JSON.stringify(sectionInfo.value, null, 2));

    await new Promise(r => setTimeout(r, 1000));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/shot_stars_section.png', Buffer.from(shot.data, 'base64'));
    console.log('Captured scratch/shot_stars_section.png');

    ws.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    edge.kill();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

testStars();
