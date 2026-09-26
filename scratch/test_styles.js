const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function test() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--window-size=1280,1000'
  ]);
  await new Promise(r => setTimeout(r, 1200));

  const targets = await new Promise(res => {
    http.get('http://127.0.0.1:9223/json/list', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    });
  });

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const msgId = id++;
    const h = e => {
      const r = JSON.parse(e.data);
      if (r.id === msgId) {
        ws.removeEventListener('message', h);
        res(r.result);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  
  // Wait until document.readyState === 'complete' and #other-centers exists
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    const chk = await send('Runtime.evaluate', {
      expression: 'document.readyState === "complete" && !!document.querySelector("#other-centers")',
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) {
      console.log('Page ready at iteration', i);
      break;
    }
  }

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const showcase = document.querySelector('.other-centers-showcase');
      const card = document.querySelector('.globe-showcase-card');
      const carouselCol = document.querySelector('.other-centers-carousel-col');
      const mapCol = document.querySelector('.other-centers-map-col');
      const svg = document.querySelector('.india-network-svg');
      
      const nodes = Array.from(document.querySelectorAll('.map-campus-node')).map(n => {
        const r = n.getBoundingClientRect();
        return {
          id: n.id,
          centerId: n.getAttribute('data-center-id'),
          centerIdx: n.getAttribute('data-center-index'),
          label: n.querySelector('text')?.textContent,
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height)
        };
      });

      const lines = Array.from(document.querySelectorAll('.telemetry-line')).map(l => ({
        id: l.id,
        d: l.getAttribute('d')
      }));

      return {
        nodes,
        linesCount: lines.length,
        lines,
        showcaseDisplay: showcase ? window.getComputedStyle(showcase).display : null,
        showcaseGridCols: showcase ? window.getComputedStyle(showcase).gridTemplateColumns : null,
        svgRect: svg ? svg.getBoundingClientRect() : null,
        cardRect: card ? card.getBoundingClientRect() : null
      };
    })()`,
    returnByValue: true
  });

  console.log('DOM Evaluation Result:', JSON.stringify(evalRes.result?.value, null, 2));

  // Now capture screenshot of the other-centers section
  const elRectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('#other-centers');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      const r = el.getBoundingClientRect();
      return {
        x: Math.max(0, Math.round(r.x)),
        y: Math.max(0, Math.round(r.y)),
        width: Math.round(r.width),
        height: Math.min(1000, Math.round(r.height))
      };
    })()`,
    returnByValue: true
  });

  const clip = elRectRes.result?.value;
  console.log('Screenshot clip:', clip);

  if (clip && clip.width > 0 && clip.height > 0) {
    const screenshot = await send('Page.captureScreenshot', {
      clip: {
        x: clip.x,
        y: clip.y,
        width: clip.width,
        height: clip.height,
        scale: 1
      }
    });

    const outPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ac91d659-9ef8-498e-bd5c-c9a30fc1f267\\map_verified.png';
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Screenshot saved to:', outPath);
  }

  edge.kill();
}
test();
