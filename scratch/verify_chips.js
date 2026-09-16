const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223; // Use a fresh port
const TARGET_URL = 'http://localhost:3000';
const ARTIFACT_DIR = path.resolve(__dirname, '..');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Launching headless Chrome on port ' + PORT + '...');
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1000',
    'about:blank'
  ]);

  let isKilled = false;
  const cleanup = () => {
    if (!isKilled) {
      isKilled = true;
      try { chromeProcess.kill(); } catch (e) {}
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  let versionInfo = null;
  for (let i = 0; i < 25; i++) {
    await wait(300);
    try {
      versionInfo = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (versionInfo && versionInfo.webSocketDebuggerUrl) break;
    } catch (e) {}
  }

  if (!versionInfo) {
    console.error('Failed to connect to Chrome debugging endpoint.');
    cleanup();
    process.exit(1);
  }

  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  console.log('Navigating to', TARGET_URL);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: TARGET_URL });
  await wait(3500);

  // 1. Dilemma Buttons Test
  console.log('Testing Problem Dilemma Buttons...');
  const dilemmaEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const box = document.querySelector('.problem-diagnostic-box');
      const btns = Array.from(document.querySelectorAll('.problem-diagnostic-box .diagnostic-btn'));
      if (!box || btns.length === 0) return { error: 'Diagnostic box or buttons not found' };
      box.scrollIntoView({ behavior: 'instant', block: 'center' });
      return {
        count: btns.length,
        texts: btns.map(b => b.textContent.trim()),
        boxRect: box.getBoundingClientRect()
      };
    })()`,
    returnByValue: true
  });
  console.log('Dilemma box detection:', dilemmaEval.result.value);
  await wait(500);

  // Take screenshot of problem dilemma buttons
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'problem_dilemma_buttons.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved problem_dilemma_buttons.png');

  // Click second dilemma button (Confused Across 10+ Courses?)
  const clickDilemma = await send('Runtime.evaluate', {
    expression: `(() => {
      const btns = document.querySelectorAll('.problem-diagnostic-box .diagnostic-btn');
      if (btns[1]) {
        btns[1].click();
        return {
          clicked: btns[1].textContent.trim(),
          isActive: btns[1].classList.contains('is-active')
        };
      }
      return { error: 'Button 1 not found' };
    })()`,
    returnByValue: true
  });
  console.log('Click dilemma button 1 result:', clickDilemma.result.value);
  await wait(400);

  const shot1Active = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'problem_dilemma_buttons_active.png'), Buffer.from(shot1Active.data, 'base64'));
  console.log('Saved problem_dilemma_buttons_active.png');

  // 2. Form Course Chips Test
  console.log('Testing Counselling Form Course Chips...');
  const formEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const form = document.querySelector('#counsellingForm');
      const chips = Array.from(document.querySelectorAll('.form-course-chip'));
      const select = document.querySelector('#courseInterest');
      if (!form || chips.length === 0) return { error: 'Form or course chips not found' };
      form.scrollIntoView({ behavior: 'instant', block: 'center' });
      return {
        chipCount: chips.length,
        chipTexts: chips.map(c => c.textContent.trim()),
        initialSelectVal: select ? select.value : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Form course chips detection:', formEval.result.value);
  await wait(500);

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'form_course_chips.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved form_course_chips.png');

  // Click "📊 Data & BI" chip
  const clickCourse = await send('Runtime.evaluate', {
    expression: `(() => {
      const chips = document.querySelectorAll('.form-course-chip');
      const select = document.querySelector('#courseInterest');
      const target = Array.from(chips).find(c => c.textContent.includes('Data & BI'));
      if (target) {
        target.click();
        return {
          clicked: target.textContent.trim(),
          isActive: target.classList.contains('is-active'),
          selectValue: select ? select.value : null
        };
      }
      return { error: 'Data & BI chip not found' };
    })()`,
    returnByValue: true
  });
  console.log('Click Data & BI chip result:', clickCourse.result.value);
  await wait(400);

  const shot2Active = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'form_course_chips_active.png'), Buffer.from(shot2Active.data, 'base64'));
  console.log('Saved form_course_chips_active.png');

  // Click "⚡ Full Stack" chip
  const clickFS = await send('Runtime.evaluate', {
    expression: `(() => {
      const chips = document.querySelectorAll('.form-course-chip');
      const select = document.querySelector('#courseInterest');
      const target = Array.from(chips).find(c => c.textContent.includes('Full Stack'));
      if (target) {
        target.click();
        return {
          clicked: target.textContent.trim(),
          isActive: target.classList.contains('is-active'),
          selectValue: select ? select.value : null
        };
      }
      return { error: 'Full Stack chip not found' };
    })()`,
    returnByValue: true
  });
  console.log('Click Full Stack chip result:', clickFS.result.value);
  await wait(400);

  // 3. Mobile Viewport Test (390 x 844)
  console.log('Testing Mobile Viewport (390 x 844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await wait(500);

  // Mobile dilemma buttons
  await send('Runtime.evaluate', {
    expression: `(() => {
      const box = document.querySelector('.problem-diagnostic-box');
      if (box) box.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await wait(400);
  const shotMobileDilemma = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_dilemma_buttons.png'), Buffer.from(shotMobileDilemma.data, 'base64'));
  console.log('Saved mobile_dilemma_buttons.png');

  // Mobile form chips
  await send('Runtime.evaluate', {
    expression: `(() => {
      const form = document.querySelector('#counsellingForm');
      if (form) form.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await wait(400);
  const shotMobileForm = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_form_chips.png'), Buffer.from(shotMobileForm.data, 'base64'));
  console.log('Saved mobile_form_chips.png');

  console.log('All verification tasks completed successfully!');
  cleanup();
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
