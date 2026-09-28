const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9292',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9292/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    if (d.id && callbacks.has(d.id)) { callbacks.get(d.id)(d); callbacks.delete(d.id); }
  };
  const send = (m, p = {}) => {
    const curId = id++;
    return new Promise(r => { callbacks.set(curId, r); ws.send(JSON.stringify({ id: curId, method: m, params: p })); });
  };
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');

  const userB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg')).toString('base64');
  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      // 1. Process from original miracle-it-logo-user.jpg
      const img = new Image();
      img.src = 'data:image/jpeg;base64,${userB64}';
      await new Promise(r => img.onload = r);

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const can = document.createElement('canvas');
      can.width = w;
      can.height = h;
      const ctx = can.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Find bounds
      let minX = w, maxX = 0, minY = h, maxY = 0;

      // Canvases:
      // A) Silver/Platinum Dark Mode: "Career Academy" is #CBD5E1 (slate-grey)
      const canSilver = document.createElement('canvas');
      canSilver.width = w; canSilver.height = h;
      const ctxSilver = canSilver.getContext('2d');
      const dataSilver = ctxSilver.createImageData(w, h);
      const ds = dataSilver.data;

      // B) Keyline: "Career Academy" is #374151 with luminous rim
      const canKeyline = document.createElement('canvas');
      canKeyline.width = w; canKeyline.height = h;
      const ctxKeyline = canKeyline.getContext('2d');
      const dataKeyline = ctxKeyline.createImageData(w, h);
      const dk = dataKeyline.data;

      const greyMask = new Float32Array(w * h);

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        const isMono = (maxVal - minVal) < 22;

        if (maxVal <= 18) {
          // background
          continue;
        }

        const px = (i / 4) % w;
        const py = Math.floor((i / 4) / w);

        const t = Math.min(1, Math.max(0, (maxVal - 18) / 45));
        const alpha = Math.round(t * 255);
        if (alpha < 15) continue;

        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;

        // Is it the dark grey text? (y > 210 and mono)
        const isGreyText = (py > 210) && isMono;

        if (isGreyText) {
          greyMask[py * w + px] = alpha / 255;

          // Silver mode: elegant cool silver grey (#CBD5E1 / rgb(203, 213, 225))
          const factor = Math.min(1, maxVal / 65);
          ds[i] = Math.round(203 * factor);
          ds[i+1] = Math.round(213 * factor);
          ds[i+2] = Math.round(225 * factor);
          ds[i+3] = alpha;

          // Keyline: authentic dark grey (#374151 / rgb(55, 65, 81))
          dk[i] = Math.round(55 * factor);
          dk[i+1] = Math.round(65 * factor);
          dk[i+2] = Math.round(81 * factor);
          dk[i+3] = alpha;
        } else {
          // Cap, stars, Miracle, IT
          const boost = Math.min(1.0 / Math.max(t, 0.3), 2.0);
          const nr = Math.min(255, Math.round(r * boost));
          const ng = Math.min(255, Math.round(g * boost));
          const nb = Math.min(255, Math.round(b * boost));

          ds[i] = nr; ds[i+1] = ng; ds[i+2] = nb; ds[i+3] = alpha;
          dk[i] = nr; dk[i+1] = ng; dk[i+2] = nb; dk[i+3] = alpha;
        }
      }

      ctxSilver.putImageData(dataSilver, 0, 0);

      // Add luminous stroke under Keyline
      const canRim = document.createElement('canvas');
      canRim.width = w; canRim.height = h;
      const ctxRim = canRim.getContext('2d');
      const dataRim = ctxRim.createImageData(w, h);
      const dr = dataRim.data;

      const rad = 4.5;
      const rCeil = Math.ceil(rad);
      for (let y = 210; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (greyMask[y * w + x] > 0.75) continue;
          let maxVal = 0;
          for (let dy = -rCeil; dy <= rCeil; dy++) {
            const ny = y + dy;
            if (ny < 210 || ny >= h) continue;
            for (let dx = -rCeil; dx <= rCeil; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              const m = greyMask[ny * w + nx];
              if (m > 0) {
                const dist = Math.hypot(dx, dy);
                if (dist <= rad) {
                  const strength = (1 - dist / rad) * m;
                  if (strength > maxVal) maxVal = strength;
                }
              }
            }
          }
          if (maxVal > 0.08) {
            const idx = (y * w + x) * 4;
            dr[idx] = 255;
            dr[idx+1] = 255;
            dr[idx+2] = 255;
            dr[idx+3] = Math.round(Math.min(1, maxVal * 1.8) * 250);
          }
        }
      }
      ctxRim.putImageData(dataRim, 0, 0);
      ctxKeyline.putImageData(dataKeyline, 0, 0);

      const compKeyline = document.createElement('canvas');
      compKeyline.width = w; compKeyline.height = h;
      const ctxComp = compKeyline.getContext('2d');
      ctxComp.drawImage(canRim, 0, 0);
      ctxComp.drawImage(canKeyline, 0, 0);

      // Crop both canvases
      const pad = 10;
      const cropX = Math.max(0, minX - pad);
      const cropY = Math.max(0, minY - pad);
      const cropW = Math.min(w - cropX, (maxX - minX) + pad * 2);
      const cropH = Math.min(h - cropY, (maxY - minY) + pad * 2);

      const cropSilver = document.createElement('canvas');
      cropSilver.width = cropW; cropSilver.height = cropH;
      cropSilver.getContext('2d').drawImage(canSilver, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const cropKey = document.createElement('canvas');
      cropKey.width = cropW; cropKey.height = cropH;
      cropKey.getContext('2d').drawImage(compKeyline, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // 2. Also do square logo
      const imgSq = new Image();
      imgSq.src = 'data:image/png;base64,${sqB64}';
      await new Promise(r => imgSq.onload = r);

      const canSq = document.createElement('canvas');
      canSq.width = imgSq.naturalWidth;
      canSq.height = imgSq.naturalHeight;
      const ctxSq = canSq.getContext('2d');
      ctxSq.drawImage(imgSq, 0, 0);
      const sqData = ctxSq.getImageData(0, 0, canSq.width, canSq.height);
      const sqD = sqData.data;

      // In square logo, convert dark grey text (y > 700) to silver
      const canSqSilver = document.createElement('canvas');
      canSqSilver.width = canSq.width; canSqSilver.height = canSq.height;
      const ctxSqSilver = canSqSilver.getContext('2d');
      const sqSilverData = ctxSqSilver.createImageData(canSq.width, canSq.height);
      const sqDs = sqSilverData.data;

      for (let i = 0; i < sqD.length; i += 4) {
        const r = sqD[i], g = sqD[i+1], b = sqD[i+2], a = sqD[i+3];
        const py = Math.floor((i / 4) / canSq.width);
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        const isMono = (maxVal - minVal) < 22;

        if (py > 690 && isMono && a > 30) {
          const factor = Math.min(1, maxVal / 65);
          sqDs[i] = Math.round(203 * factor);
          sqDs[i+1] = Math.round(213 * factor);
          sqDs[i+2] = Math.round(225 * factor);
          sqDs[i+3] = a;
        } else {
          sqDs[i] = r; sqDs[i+1] = g; sqDs[i+2] = b; sqDs[i+3] = a;
        }
      }
      ctxSqSilver.putImageData(sqSilverData, 0, 0);

      return {
        silverPng: cropSilver.toDataURL('image/png'),
        keylinePng: cropKey.toDataURL('image/png'),
        squareSilverPng: canSqSilver.toDataURL('image/png')
      };
    })()`
  });

  const val = evalRes.result.result.value;
  fs.writeFileSync(path.resolve(__dirname, 'sol_silver.png'), Buffer.from(val.silverPng.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync(path.resolve(__dirname, 'sol_keyline.png'), Buffer.from(val.keylinePng.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync(path.resolve(__dirname, 'sol_square_silver.png'), Buffer.from(val.squareSilverPng.replace(/^data:image\/png;base64,/, ''), 'base64'));

  console.log('Saved sol_silver.png, sol_keyline.png, and sol_square_silver.png');

  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
