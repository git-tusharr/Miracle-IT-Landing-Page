const { spawn } = require('child_process');
const http = require('http');

async function check() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless', '--remote-debugging-port=9225', '--disable-gpu', '--window-size=1280,1000'
  ]);
  await new Promise(r => setTimeout(r, 1200));

  const targets = await new Promise(res => {
    http.get('http://127.0.0.1:9225/json/list', r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    });
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(res => {
    const msgId = id++;
    const h = e => { const r = JSON.parse(e.data); if (r.id === msgId) { ws.removeEventListener('message', h); res(r.result); } };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000/scratch/preview_map.html' });

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    const chk = await send('Runtime.evaluate', {
      expression: 'document.readyState === "complete" && !!document.querySelector("#mapPinJabalpur")',
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) break;
  }

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const pin = document.querySelector('#mapPinJabalpur');
      const text = Array.from(document.querySelectorAll('text')).find(t => t.textContent.includes('Napier'));
      const textRect = text ? text.getBoundingClientRect() : null;
      const pinRect = pin ? pin.getBoundingClientRect() : null;
      const svg = document.querySelector('.india-network-svg');
      const svgRect = svg ? svg.getBoundingClientRect() : null;

      const style = window.getComputedStyle(pin);

      return {
        svgRect: { x: svgRect.x, y: svgRect.y, w: svgRect.width, h: svgRect.height },
        pinRect: { x: pinRect.x, y: pinRect.y, w: pinRect.width, h: pinRect.height },
        textRect: textRect ? { x: textRect.x, y: textRect.y, w: textRect.width, h: textRect.height } : null,
        pinTransformAttr: pin.getAttribute('transform'),
        pinClassList: pin.className.baseVal,
        pinComputedTransform: style.transform,
        pinComputedTransformOrigin: style.transformOrigin
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(res, null, 2));
  edge.kill();
}
check();
