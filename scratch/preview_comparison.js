const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const testHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 30px;
      background: #07090E;
      color: #F8FAFC;
      font-family: system-ui, -apple-system, sans-serif;
    }
    h2 { font-size: 18px; color: #94A3B8; margin-top: 0; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .panel {
      background: #0B1120;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 24px;
    }
    .title {
      font-size: 16px;
      font-weight: 700;
      color: #FF7A00;
      margin-bottom: 8px;
    }
    .desc {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .preview-box {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 20px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .bg-header {
      background: #07090E;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .bg-cta {
      background: #0D1424;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .bg-footer {
      background: #05070B;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .logo-h {
      height: 48px;
      width: auto;
      display: block;
      filter: drop-shadow(0 2px 10px rgba(0,0,0,0.5));
    }
    .logo-sq {
      height: 72px;
      width: auto;
      display: block;
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.6));
    }
  </style>
</head>
<body>
  <h2>Visual Comparison on Actual Website Section Backgrounds</h2>
  
  <div class="grid">
    <!-- Option A: Silver/Platinum Slate Mode (Professional Dark Mode Hierarchy) -->
    <div class="panel">
      <div class="title">Option A: Slate Silver (#CBD5E1) — Seamless Floating</div>
      <div class="desc">
        Brand hierarchy preserved: "Career Academy" is grey (secondary, muted relative to Orange & Blue), perfectly legible without any white background box or borders.
      </div>

      <div style="font-size:12px; color:#64748B; margin-bottom:4px;">Header (#07090E):</div>
      <div class="preview-box bg-header">
        <img src="sol_silver.png" class="logo-h">
      </div>

      <div style="font-size:12px; color:#64748B; margin-bottom:4px;">Final CTA Bento (#0D1424):</div>
      <div class="preview-box bg-cta">
        <img src="sol_silver.png" class="logo-h">
      </div>

      <div style="font-size:12px; color:#64748B; margin-bottom:4px;">Footer (#05070B):</div>
      <div class="preview-box bg-footer">
        <img src="sol_square_silver.png" class="logo-sq">
      </div>
    </div>

    <!-- Option B: Keyline Contour (#374151 Dark Grey + White Anti-aliased Rim) -->
    <div class="panel">
      <div class="title">Option B: Keyline Contour (#374151 + Luminous Rim)</div>
      <div class="desc">
        Letter interior strictly keeps #374151 dark charcoal grey with a crisp luminous rim around each character. Zero container box.
      </div>

      <div style="font-size:12px; color:#64748B; margin-bottom:4px;">Header (#07090E):</div>
      <div class="preview-box bg-header">
        <img src="sol_keyline.png" class="logo-h">
      </div>

      <div style="font-size:12px; color:#64748B; margin-bottom:4px;">Final CTA Bento (#0D1424):</div>
      <div class="preview-box bg-cta">
        <img src="sol_keyline.png" class="logo-h">
      </div>

      <div style="font-size:12px; color:#64748B; margin-bottom:4px;">Footer (#05070B):</div>
      <div class="preview-box bg-footer">
        <img src="sol_square_silver.png" class="logo-sq">
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.resolve(__dirname, 'preview_comparison.html'), testHtml);

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9294',
  '--disable-gpu',
  '--window-size=1200,900',
  'file:///' + path.resolve(__dirname, 'preview_comparison.html').replace(/\\/g, '/')
]);

async function capture() {
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9294/json');
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
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'preview_comparison.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved preview_comparison.png');
  chrome.kill();
  process.exit(0);
}

capture().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
