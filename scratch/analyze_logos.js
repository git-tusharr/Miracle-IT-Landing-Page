const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9246',
  '--disable-gpu',
  'about:blank'
]);

async function check() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9246/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && callbacks.has(d.id)) { callbacks.get(d.id)(d); callbacks.delete(d.id); }
  };
  const send = (m, p = {}) => new Promise(r => { const i = id++; callbacks.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');

  const userB64 = fs.readFileSync('assets/images/miracle-it-logo-user.jpg').toString('base64');
  const currB64 = fs.readFileSync('assets/images/miracle-it-logo.png').toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      async function load(b64, mime) {
        const img = new Image();
        img.src = 'data:' + mime + ';base64,' + b64;
        await new Promise(r => img.onload = r);
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return { c, ctx, w: c.width, h: c.height, data: ctx.getImageData(0,0,c.width,c.height).data };
      }
      const u = await load('${userB64}', 'image/jpeg');
      const cur = await load('${currB64}', 'image/png');

      // Sample user logo at 'Career' text (approx y: 0.65 to 0.78, x: 0.4 to 0.7)
      const uPixels = [];
      for (let y = Math.floor(u.h * 0.65); y < Math.floor(u.h * 0.78); y++) {
        for (let x = Math.floor(u.w * 0.4); x < Math.floor(u.w * 0.7); x++) {
          const idx = (y * u.w + x) * 4;
          const r = u.data[idx], g = u.data[idx+1], b = u.data[idx+2];
          if (r > 30 && r < 180 && Math.abs(r-g)<15 && Math.abs(g-b)<15) {
            uPixels.push({r, g, b});
          }
        }
      }
      const avgU = uPixels.reduce((acc, p) => ({ r: acc.r+p.r/uPixels.length, g: acc.g+p.g/uPixels.length, b: acc.b+p.b/uPixels.length }), {r:0,g:0,b:0});

      // Sample current logo at 'Career' text
      const curPixels = [];
      for (let y = Math.floor(cur.h * 0.65); y < Math.floor(cur.h * 0.78); y++) {
        for (let x = Math.floor(cur.w * 0.4); x < Math.floor(cur.w * 0.7); x++) {
          const idx = (y * cur.w + x) * 4;
          const r = cur.data[idx], g = cur.data[idx+1], b = cur.data[idx+2], a = cur.data[idx+3];
          if (a > 50) curPixels.push({r, g, b, a});
        }
      }
      const curWhites = curPixels.filter(p => p.r > 220 && p.g > 220 && p.b > 220).length;

      return {
        userAvgGrey: avgU,
        uCount: uPixels.length,
        curTotalSampled: curPixels.length,
        curWhitesCount: curWhites,
        curWhitesRatio: (curWhites / curPixels.length).toFixed(2)
      };
    })()`
  });

  console.log('Result:', JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
  chrome.kill();
}
check().catch(e => { console.error(e); chrome.kill(); });
