const { spawn } = require('child_process');
const http = require('http');

async function check() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless', '--remote-debugging-port=9224', '--disable-gpu', '--window-size=1280,1000'
  ]);
  await new Promise(r => setTimeout(r, 1200));

  const targets = await new Promise(res => {
    http.get('http://127.0.0.1:9224/json/list', r => {
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
      expression: 'document.readyState === "complete" && !!document.querySelector("#indiaMapViewport")',
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) {
      console.log('Ready at iteration', i);
      break;
    }
  }

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const v = document.querySelector('#indiaMapViewport').getBoundingClientRect();
      const nodes = Array.from(document.querySelectorAll('.map-campus-node')).map(n => {
        const r = n.getBoundingClientRect();
        return {
          id: n.id,
          city: n.querySelector('text')?.textContent,
          relX: Math.round(r.x - v.x),
          relY: Math.round(r.y - v.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          transform: n.getAttribute('transform')
        };
      });
      return { viewport: { w: Math.round(v.width), h: Math.round(v.height) }, nodes };
    })()`,
    returnByValue: true
  });

  console.log('Node Relative Positions inside Map Viewport:');
  console.log(JSON.stringify(res.result?.value, null, 2));
  edge.kill();
}
check();
