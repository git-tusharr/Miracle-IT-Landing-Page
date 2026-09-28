const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9290',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9290/json');
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

  const origB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg')).toString('base64');
  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');

  // Let's create high-resolution, perfectly rendered alternatives:
  // Alternative 1: Authentic dark-grey core with a substantial 4.5px crisp white outer keyline (scales to ~1.2px on screen, clearly readable, ZERO background box!)
  // Alternative 2: Authentic brand dark grey with an ambient luminous backlight
  // Alternative 3: Subtle dark glassmorphic badge (translucent 5% white glass with 10% border, NOT solid white)
  // Alternative 4: Premium Dark-Mode brand typography (Cool silver/platinum #E2E8F0 for "Career Academy", retaining brand hierarchy without awkward borders or boxes)

  const r = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      // Load image
      const img = new Image();
      img.src = 'data:image/jpeg;base64,${origB64}';
      await new Promise(res => img.onload = res);

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Extract colors from original
      const can = document.createElement('canvas');
      can.width = w;
      can.height = h;
      const ctx = can.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const srcData = ctx.getImageData(0, 0, w, h);
      const d = srcData.data;

      // We create a clean transparent canvas
      // In miracle-it-logo-user.jpg: background is white (~255)
      // Orange cap & Miracle: r > 200, g between 80 and 160, b < 60
      // Blue IT: b > 180, r < 60
      // Dark grey Career Academy: r,g,b in 40..90
      // Tagline Central India's No.1...: r,g,b in 90..140

      // Let's create an accurate keyline version
      const keylineCan = document.createElement('canvas');
      keylineCan.width = w;
      keylineCan.height = h;
      const kCtx = keylineCan.getContext('2d');

      const silverCan = document.createElement('canvas');
      silverCan.width = w;
      silverCan.height = h;
      const sCtx = silverCan.getContext('2d');

      const kData = kCtx.createImageData(w, h);
      const kd = kData.data;
      const sData = sCtx.createImageData(w, h);
      const sd = sData.data;

      const greyMask = new Float32Array(w * h);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const rVal = d[idx], gVal = d[idx+1], bVal = d[idx+2];
          const brightness = (rVal + gVal + bVal) / 3;

          // Background is near white
          if (brightness > 240 && Math.max(rVal, gVal, bVal) - Math.min(rVal, gVal, bVal) < 15) {
            continue; // transparent
          }

          // Compute alpha based on distance from white
          const distFromWhite = 255 - brightness;
          const alpha = Math.min(255, Math.max(0, distFromWhite * 3.5));

          const isGreyText = (y > 230) && (Math.max(rVal, gVal, bVal) - Math.min(rVal, gVal, bVal) < 30) && brightness < 150;

          if (isGreyText) {
            greyMask[y * w + x] = alpha / 255;
            
            // For keyline version: keep exact dark grey (#374151)
            kd[idx] = 55;
            kd[idx+1] = 65;
            kd[idx+2] = 81;
            kd[idx+3] = alpha;

            // For silver dark-mode version: elegant cool silver (#E2E8F0)
            sd[idx] = 226;
            sd[idx+1] = 232;
            sd[idx+2] = 240;
            sd[idx+3] = alpha;
          } else {
            // Keep original colors for Cap, Miracle, IT
            kd[idx] = rVal;
            kd[idx+1] = gVal;
            kd[idx+2] = bVal;
            kd[idx+3] = alpha;

            sd[idx] = rVal;
            sd[idx+1] = gVal;
            sd[idx+2] = bVal;
            sd[idx+3] = alpha;
          }
        }
      }

      // Add a bold, crisp keyline contour (radius ~ 6px) around grey text
      const contourCan = document.createElement('canvas');
      contourCan.width = w;
      contourCan.height = h;
      const cCtx = contourCan.getContext('2d');
      const cData = cCtx.createImageData(w, h);
      const cd = cData.data;

      const rad = 6;
      for (let y = 230; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (greyMask[y * w + x] > 0.8) continue;
          let maxVal = 0;
          for (let dy = -rad; dy <= rad; dy++) {
            const ny = y + dy;
            if (ny < 230 || ny >= h) continue;
            for (let dx = -rad; dx <= rad; dx++) {
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
          if (maxVal > 0.1) {
            const idx = (y * w + x) * 4;
            cd[idx] = 255;
            cd[idx+1] = 255;
            cd[idx+2] = 255;
            cd[idx+3] = Math.round(Math.min(255, maxVal * 2 * 255));
          }
        }
      }
      cCtx.putImageData(cData, 0, 0);
      kCtx.putImageData(kData, 0, 0);
      sCtx.putImageData(sData, 0, 0);

      // Composite contour under dark grey
      const compKeyline = document.createElement('canvas');
      compKeyline.width = w;
      compKeyline.height = h;
      const compCtx = compKeyline.getContext('2d');
      compCtx.drawImage(contourCan, 0, 0);
      compCtx.drawImage(keylineCan, 0, 0);

      return {
        keylinePng: compKeyline.toDataURL('image/png'),
        silverPng: silverCan.toDataURL('image/png')
      };
    })()`
  });

  const val = r.result.result.value;
  fs.writeFileSync(path.resolve(__dirname, 'logo_bold_keyline.png'), Buffer.from(val.keylinePng.replace(/^data:image\/png;base64,/, ''), 'base64'));
  fs.writeFileSync(path.resolve(__dirname, 'logo_silver_mode.png'), Buffer.from(val.silverPng.replace(/^data:image\/png;base64,/, ''), 'base64'));

  console.log('Generated test logos.');

  // Now create an HTML test page to display all alternatives side by side on the site's dark background
  const testHtml = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        margin: 0;
        padding: 40px;
        background: #07090E;
        color: #F8FAFC;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }
      h2 { font-size: 20px; color: #94A3B8; margin-top: 30px; margin-bottom: 12px; }
      .row {
        display: flex;
        align-items: center;
        gap: 30px;
        padding: 24px;
        background: #0D1424;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        margin-bottom: 24px;
      }
      .label { width: 320px; }
      .label h3 { margin: 0 0 6px 0; font-size: 16px; color: #FFFFFF; }
      .label p { margin: 0; font-size: 13px; color: #94A3B8; }
      
      /* Styles under test */
      .demo-box {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 240px;
        min-height: 70px;
      }
      
      /* Style A: Completely Transparent Floating (No background at all) with Bold Crisp Outline */
      .style-a img {
        height: 48px;
        width: auto;
        display: block;
        filter: drop-shadow(0 2px 10px rgba(0,0,0,0.6));
      }

      /* Style B: Completely Transparent Floating with Silver Mode (Official Dark Mode typography) */
      .style-b img {
        height: 48px;
        width: auto;
        display: block;
        filter: drop-shadow(0 2px 10px rgba(0,0,0,0.6));
      }

      /* Style C: Subtle Dark Glassmorphic Pill (Glass 5% white, NOT solid white) */
      .style-c {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(12px);
        padding: 8px 20px;
        border-radius: 9999px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .style-c img {
        height: 44px;
        width: auto;
        display: block;
      }

      /* Style D: Ambient Radiant Glow behind Logo (Radial glow, no box border) */
      .style-d {
        position: relative;
        padding: 6px 12px;
      }
      .style-d::before {
        content: '';
        position: absolute;
        inset: -10px;
        background: radial-gradient(ellipse at center, rgba(255, 122, 0, 0.22) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 75%);
        filter: blur(10px);
        z-index: 0;
      }
      .style-d img {
        position: relative;
        z-index: 1;
        height: 48px;
        width: auto;
        display: block;
      }
    </style>
  </head>
  <body>
    <h1 style="margin-top:0; font-size:24px;">Logo Alternatives (Without Awkward White Background)</h1>
    
    <div class="row">
      <div class="label">
        <h3>Option 1: Bold Keyline Floating Logo</h3>
        <p>100% transparent floating. Keeps dark grey text core with crisp outer edge. Zero container box.</p>
      </div>
      <div class="demo-box style-a">
        <img src="logo_bold_keyline.png" alt="Bold Keyline">
      </div>
    </div>

    <div class="row">
      <div class="label">
        <h3>Option 2: Platinum/Silver Dark Mode</h3>
        <p>Official modern dark-mode treatment. "Career Academy" in elegant cool silver (#E2E8F0). Clean & ultra-sharp.</p>
      </div>
      <div class="demo-box style-b">
        <img src="logo_silver_mode.png" alt="Silver Dark Mode">
      </div>
    </div>

    <div class="row">
      <div class="label">
        <h3>Option 3: Dark Glassmorphic Pill</h3>
        <p>Subtle 5% frosted dark glass (NOT solid white). Matches dark theme seamlessly.</p>
      </div>
      <div class="demo-box style-c">
        <img src="logo_silver_mode.png" alt="Glass Pill">
      </div>
    </div>

    <div class="row">
      <div class="label">
        <h3>Option 4: Ambient Brand Backlight</h3>
        <p>Soft orange/blue brand glow behind transparent logo. Zero box border.</p>
      </div>
      <div class="demo-box style-d">
        <img src="logo_silver_mode.png" alt="Backlight">
      </div>
    </div>
  </body>
  </html>`;

  fs.writeFileSync(path.resolve(__dirname, 'compare_logo_solutions.html'), testHtml);

  // Navigate to compare_logo_solutions.html and screenshot
  await send('Page.navigate', { url: 'file:///' + path.resolve(__dirname, 'compare_logo_solutions.html').replace(/\\\\/g, '/') });
  await new Promise(r => setTimeout(r, 1200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'compare_logo_solutions.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved scratch/compare_logo_solutions.png');

  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
