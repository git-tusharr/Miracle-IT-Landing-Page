const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const tmpDir = path.resolve(__dirname, 'chrome_tmp_vfolder_' + Date.now());
fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9455',
  '--disable-gpu',
  '--window-size=1440,900',
  '--user-data-dir=' + tmpDir,
  'http://127.0.0.1:3000'
]);

async function evaluate(send, expr) {
  const evalRes = await send('Runtime.evaluate', { expression: expr });
  return evalRes.result?.result?.value;
}

async function runTest() {
  await new Promise(r => setTimeout(r, 2200));
  const res = await fetch('http://127.0.0.1:9455/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url.includes('127.0.0.1'));
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

  console.log('=== TEST 1: HERO FOLDER CLOSED STATE (DESKTOP) ===');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Ensure DOM is ready
  for (let i = 0; i < 40; i++) {
    const ready = await evaluate(send, 'document.readyState');
    const hasFolder = await evaluate(send, '!!document.querySelector("#heroFolderCard")');
    if (ready === 'complete' && hasFolder) {
      console.log('DOM ready and #heroFolderCard detected!');
      break;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // Scroll to hero section
  await evaluate(send, `(() => {
    document.querySelector('#hero')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const isCheckedInitial = await evaluate(send, 'document.querySelector("#heroFolderToggle")?.checked');
  const activeTabInitial = await evaluate(send, 'document.querySelector(".stack-tab.is-active")?.textContent.trim()');
  console.log(`Initial Folder Closed State -> Checked: ${isCheckedInitial} | Active Tab: "${activeTabInitial}"`);

  // Capture screenshot of CLOSED folder state
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_closed.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_closed.png');

  console.log('\n=== TEST 2: CLICK TO OPEN FOLDER ===');
  await evaluate(send, `(() => {
    const card = document.querySelector('#heroFolderCard');
    card.click();
  })()`);
  await new Promise(r => setTimeout(r, 800));

  const isCheckedAfterClick = await evaluate(send, 'document.querySelector("#heroFolderToggle")?.checked');
  console.log(`After Click -> Folder Checked: ${isCheckedAfterClick}`);

  // Capture screenshot of OPEN folder state (Card 1 roadmap.js)
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_opened.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_opened.png');

  console.log('\n=== TEST 3: AUTO-SWAP AFTER 2.5-3 SECONDS ===');
  console.log('Waiting 3 seconds for automatic swap to Card 2 (ai_model.py)...');
  await new Promise(r => setTimeout(r, 3200));

  const topCardAfterSwap1 = await evaluate(send, `(() => {
    const top = document.querySelector('.code-stack-card.is-top');
    return top ? top.querySelector('.card-file-label')?.textContent.trim() : null;
  })()`);
  const activeTabAfterSwap1 = await evaluate(send, 'document.querySelector(".stack-tab.is-active")?.textContent.trim()');
  console.log(`After 1st Auto-Swap -> Top Card: "${topCardAfterSwap1}" | Active Tab: "${activeTabAfterSwap1}"`);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_swapped_ch2.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_swapped_ch2.png');

  console.log('Waiting another 2.8 seconds for automatic swap to Card 3 (insights.sql)...');
  await new Promise(r => setTimeout(r, 3000));

  const topCardAfterSwap2 = await evaluate(send, `(() => {
    const top = document.querySelector('.code-stack-card.is-top');
    return top ? top.querySelector('.card-file-label')?.textContent.trim() : null;
  })()`);
  const activeTabAfterSwap2 = await evaluate(send, 'document.querySelector(".stack-tab.is-active")?.textContent.trim()');
  console.log(`After 2nd Auto-Swap -> Top Card: "${topCardAfterSwap2}" | Active Tab: "${activeTabAfterSwap2}"`);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_swapped_ch3.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_swapped_ch3.png');

  console.log('\n=== TEST 4: MOBILE VIEWPORT (390x844) ===');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await evaluate(send, `(() => {
    document.querySelector('#hero')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  })()`);
  await new Promise(r => setTimeout(r, 600));

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.resolve(__dirname, 'snap_hero_folder_mobile.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved snap_hero_folder_mobile.png');

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}

  console.log('\n=== ALL FOLDER CARD TESTS COMPLETED SUCCESSFULLY! ===');
}

runTest().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
