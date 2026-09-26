const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000'
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
    await new Promise(r => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('#other-centers');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        const nodes = Array.from(document.querySelectorAll('.map-campus-node')).map(n => {
          const r = n.getBoundingClientRect();
          return {
            id: n.id,
            centerId: n.getAttribute('data-center-id'),
            centerIdx: n.getAttribute('data-center-index'),
            ariaLabel: n.getAttribute('aria-label'),
            rect: { x: r.x, y: r.y, width: r.width, height: r.height }
          };
        });
        const v = document.querySelector('#indiaMapViewport')?.getBoundingClientRect();
        const s = document.querySelector('#otherCentersShowcase')?.getBoundingClientRect();
        return {
          nodes,
          mapViewportRect: v ? { x: v.x, y: v.y, width: v.width, height: v.height } : null,
          showcaseRect: s ? { x: s.x, y: s.y, width: s.width, height: s.height } : null
        };
      })()`,
      returnByValue: true
    });

    console.log('DOM Evaluation:', JSON.stringify(evalRes.result?.value, null, 2));

    const s = evalRes.result?.value?.showcaseRect;
    const screenshot = await send('Page.captureScreenshot', {
      clip: s ? { x: Math.max(0, s.x), y: Math.max(0, s.y), width: s.width, height: s.height, scale: 1 } : undefined
    });

    if (screenshot && screenshot.data) {
      const outPath = 'd:\\Tushar\\miracle-it-career-academy\\scratch\\map_view.png';
      fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
      console.log('Saved screenshot to:', outPath);
    } else {
      console.log('Screenshot result:', screenshot);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    edge.kill();
  }
}

main();
