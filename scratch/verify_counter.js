const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9225',
  '--disable-gpu',
  '--window-size=1280,1000',
  'http://localhost:3000'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9225/json');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };
    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise((resolve) => {
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    console.log('--- TEST 1: SCROLL INTO VIEW TRIGGER ---');

    // Scroll directly to campus-stats-bar
    await send('Runtime.evaluate', {
      expression: `(() => {
        const stats = document.querySelector('.campus-stats-bar');
        if (stats) {
          stats.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    // Sample stats over time
    const samples = [];
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 300));
      const sample = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const items = Array.from(document.querySelectorAll('.campus-stat .stat-number'));
          return items.map(el => ({
            text: el.innerText.trim(),
            isCounting: el.classList.contains('is-counting'),
            isComplete: el.classList.contains('is-complete')
          }));
        })()`
      });
      const val = sample?.result?.result?.value || sample?.result?.value || [];
      samples.push({
        timeMs: (i + 1) * 300,
        data: Array.isArray(val) ? val : []
      });
    }

    console.log('Scroll-in Samples over time:');
    samples.forEach(s => {
      console.log(`[+${s.timeMs}ms]`, s.data.length ? s.data.map(d => `${d.text} (${d.isCounting ? 'counting' : d.isComplete ? 'complete' : 'idle'})`).join(' | ') : 'No data sampled');
    });

    // Capture screenshot of completed stats bar
    const screenshotFinal = await send('Page.captureScreenshot', { format: 'png' });
    const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\c22db8df-be12-447f-9c1b-8ca1b3855256';
    fs.writeFileSync(path.join(outDir, 'campus_stats_completed.png'), Buffer.from(screenshotFinal.result.data, 'base64'));
    console.log('Saved campus_stats_completed.png');

    console.log('\n--- TEST 2: REFRESH WHILE IN VIEW TRIGGER ---');
    // Set hash so on reload browser anchors to learning-experience
    await send('Page.navigate', { url: 'http://localhost:3000#learning-experience' });
    await new Promise(r => setTimeout(r, 600));

    // Sample right after arrival / reload (should start from 0 and count up)
    const refreshSamples = [];
    for (let i = 0; i < 6; i++) {
      const sample = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const items = Array.from(document.querySelectorAll('.campus-stat .stat-number'));
          return items.map(el => ({
            text: el.innerText.trim(),
            isCounting: el.classList.contains('is-counting'),
            isComplete: el.classList.contains('is-complete')
          }));
        })()`
      });
      const val = sample?.result?.result?.value || sample?.result?.value || [];
      refreshSamples.push({
        timeMs: i * 300,
        data: Array.isArray(val) ? val : []
      });

      // Capture midway screenshot
      if (i === 2) {
        const screenshotHalf = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'campus_stats_counting_midway.png'), Buffer.from(screenshotHalf.result.data, 'base64'));
        console.log('Saved campus_stats_counting_midway.png');
      }

      await new Promise(r => setTimeout(r, 300));
    }

    console.log('Refresh Samples over time:');
    refreshSamples.forEach(s => {
      console.log(`[+${s.timeMs}ms]`, s.data.length ? s.data.map(d => `${d.text} (${d.isCounting ? 'counting' : d.isComplete ? 'complete' : 'idle'})`).join(' | ') : 'No data sampled');
    });

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error('Error during test:', err);
    chrome.kill();
  }
}

run();
