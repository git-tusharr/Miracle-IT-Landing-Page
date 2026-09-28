const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9246',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_tmp_dir2'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9246/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };
  const send = (method, params = {}) => {
    const curId = id++;
    return new Promise(resolve => {
      callbacks.set(curId, resolve);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');

  const userB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg')).toString('base64');
  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const inspect = async (b64, isJpg) => {
        const img = new Image();
        img.src = 'data:' + (isJpg ? 'image/jpeg' : 'image/png') + ';base64,' + b64;
        await new Promise(r => img.onload = r);
        const can = document.createElement('canvas');
        can.width = img.naturalWidth;
        can.height = img.naturalHeight;
        const ctx = can.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, can.width, can.height).data;

        // Find vertical bands where grey/white/color exist
        const rowStats = [];
        for (let y = 0; y < can.height; y += 4) {
          let orange = 0, blue = 0, grey = 0, white = 0;
          for (let x = 0; x < can.width; x += 4) {
            const idx = (y * can.width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
            if (a < 50) continue;
            if (r > 180 && g > 60 && g < 160 && b < 80) orange++;
            else if (b > 140 && r < 100) blue++;
            else if (r > 200 && g > 200 && b > 200) white++;
            else if (r > 35 && r < 120 && Math.abs(r-g)<15 && Math.abs(g-b)<15) grey++;
          }
          if (orange > 0 || blue > 0 || grey > 0 || white > 0) {
            rowStats.push({ y, orange, blue, grey, white });
          }
        }
        return { w: can.width, h: can.height, rowStats };
      };

      return {
        user: await inspect('${userB64}', true),
        square: await inspect('${sqB64}', false)
      };
    })()`
  });

  const resVal = evalRes.result.result.value;
  console.log('User bands:');
  const user = resVal.user;
  let inGrey = false, greyStart = 0;
  for (const r of user.rowStats) {
    if (r.grey > 10 && !inGrey) { inGrey = true; greyStart = r.y; }
    if (r.grey <= 10 && inGrey) { inGrey = false; console.log('User grey band: y =', greyStart, 'to', r.y); }
  }
  if (inGrey) console.log('User grey band ends at y =', user.rowStats[user.rowStats.length-1].y);

  console.log('Square bands:');
  const sq = resVal.square;
  let inWhite = false, whiteStart = 0;
  for (const r of sq.rowStats) {
    if (r.white > 10 && !inWhite) { inWhite = true; whiteStart = r.y; }
    if (r.white <= 10 && inWhite) { inWhite = false; console.log('Square white band: y =', whiteStart, 'to', r.y); }
  }
  if (inWhite) console.log('Square white band ends at y =', sq.rowStats[sq.rowStats.length-1].y);

  chrome.kill();
  process.exit(0);
}
run();
