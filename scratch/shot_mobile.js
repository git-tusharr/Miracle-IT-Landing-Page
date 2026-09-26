const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function shotMobile() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless', '--remote-debugging-port=9226', '--disable-gpu', '--window-size=412,915'
  ]);
  await new Promise(r => setTimeout(r, 1200));

  const targets = await new Promise(res => {
    http.get('http://127.0.0.1:9226/json/list', r => {
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
      expression: 'document.readyState === "complete" && !!document.querySelector(".globe-showcase-card")',
      returnByValue: true
    });
    if (chk && chk.result && chk.result.value) break;
  }

  // Scroll to globe-showcase-card
  await send('Runtime.evaluate', {
    expression: 'document.querySelector(".globe-showcase-card").scrollIntoView({ behavior: "instant", block: "start" })'
  });
  await new Promise(r => setTimeout(r, 500));

  const shot = await send('Page.captureScreenshot');
  const outPath = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ac91d659-9ef8-498e-bd5c-c9a30fc1f267\\mobile_map_card.png';
  fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
  console.log('Mobile map card screenshot saved.');
  edge.kill();
}
shotMobile();
