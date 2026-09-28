const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_folder_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

// Build a standalone test page with the new Folder HTML + CSS + JS
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Folder Card Prototype Test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/global.css">
  <link rel="stylesheet" href="../components/hero/hero.css">
  <style>
    body {
      background-color: #07090E;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(255, 122, 0, 0.16) 0%, transparent 50%),
        radial-gradient(circle at 85% 65%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
        linear-gradient(180deg, rgba(7, 9, 14, 0.94) 0%, #07090E 100%);
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 20px;
      font-family: 'Inter', sans-serif;
      box-sizing: border-box;
    }
    .preview-box {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="preview-box" id="testBox"></div>
  <script src="../components/hero/hero.js"></script>
</body>
</html>`;

fs.writeFileSync(path.resolve(__dirname, 'test_folder_proto.html'), htmlContent);

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9411',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000/scratch/test_folder_proto.html'
]);

async function evaluate(send, expr) {
  const evalRes = await send('Runtime.evaluate', { expression: expr });
  return evalRes.result?.result?.value;
}

async function testFolder() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9411/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('test_folder_proto.html'));
  if (!pageTab) {
    console.error('Page tab not found');
    chrome.kill();
    return;
  }
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

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

  console.log('Prototype test script ready.');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

testFolder().catch(console.error);
