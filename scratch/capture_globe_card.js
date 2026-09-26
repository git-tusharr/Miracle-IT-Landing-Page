const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1100'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1200));

    const targets = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9222/json/list', res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve(JSON.parse(raw)));
      }).on('error', reject);
    });

    const target = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const res = JSON.parse(event.data);
          if (res.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2200));

    // Scroll to the card and measure its viewport coordinates
    const rectRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        const el = document.querySelector('.globe-showcase-card');
        if (!el) return null;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        await new Promise(r => setTimeout(r, 400));
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          viewport: { w: window.innerWidth, h: window.innerHeight }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Target rect:', rectRes.result?.value);
    const clip = rectRes.result?.value;

    if (clip && clip.width > 0 && clip.height > 0) {
      const screenshot = await send('Page.captureScreenshot', {
        clip: {
          x: Math.max(0, clip.x),
          y: Math.max(0, clip.y),
          width: clip.width,
          height: clip.height,
          scale: 1
        }
      });

      const outPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ac91d659-9ef8-498e-bd5c-c9a30fc1f267\\map_card_live.png';
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log('Saved screenshot successfully to:', outPath);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    edge.kill();
  }
}

main();
