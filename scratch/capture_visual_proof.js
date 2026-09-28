const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9258',
  '--disable-gpu',
  '--window-size=1280,900',
  'http://127.0.0.1:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9258/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
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
  await send('Runtime.enable');

  const snap = async (name, scrollY) => {
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scrollY})` });
    await new Promise(r => setTimeout(r, 400));
    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.resolve(__dirname, name), Buffer.from(ss.result.data, 'base64'));
    console.log('Saved', name);
  };

  // Header & Hero
  await snap('snap_hero.png', 0);

  // Problem & Courses
  const probY = await send('Runtime.evaluate', { expression: `document.getElementById('problem').offsetTop`, returnByValue: true });
  await snap('snap_problem.png', probY.result.result.value);

  // Courses
  const courseY = await send('Runtime.evaluate', { expression: `document.getElementById('courses').offsetTop`, returnByValue: true });
  await snap('snap_courses.png', courseY.result.result.value);

  // Why Miracle IT
  const whyY = await send('Runtime.evaluate', { expression: `document.getElementById('why-miracle-it').offsetTop`, returnByValue: true });
  await snap('snap_why.png', whyY.result.result.value);

  // FAQ
  const faqY = await send('Runtime.evaluate', { expression: `document.getElementById('faq').offsetTop`, returnByValue: true });
  await snap('snap_faq.png', faqY.result.result.value);

  // Footer & Final CTA
  const footerY = await send('Runtime.evaluate', { expression: `document.getElementById('final-cta').offsetTop`, returnByValue: true });
  await snap('snap_footer_cta.png', footerY.result.result.value);

  chrome.kill();
  process.exit(0);
}
run();
