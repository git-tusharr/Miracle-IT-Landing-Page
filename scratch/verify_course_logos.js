const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9229',
  '--disable-gpu',
  '--window-size=1400,1080',
  'http://localhost:3000'
]);

const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\ffd0a939-b75a-47e9-a6d1-7e8851c83a23';

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9229/json');
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
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to #courses
    await send('Runtime.evaluate', {
      expression: `(() => {
        const sec = document.querySelector('#courses');
        if (sec) sec.scrollIntoView({ block: 'start' });
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    // Evaluate all 6 course panels and their tech logos
    const evalData = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const panels = document.querySelectorAll('.course-preview-card');
        const results = Array.from(panels).map((p, idx) => {
          const title = p.querySelector('.course-card-title')?.innerText;
          const techPills = p.querySelectorAll('.tech-logo-pill');
          const pillDetails = Array.from(techPills).map(pill => {
            const img = pill.querySelector('img');
            const name = pill.querySelector('.tech-name')?.innerText;
            return {
              name,
              src: img ? img.src : null,
              complete: img ? img.complete : false,
              naturalWidth: img ? img.naturalWidth : 0
            };
          });
          const cardInner = p.querySelector('.card-inner.compact-card');
          const rect = cardInner ? cardInner.getBoundingClientRect() : null;
          return {
            index: idx,
            title,
            logoCount: techPills.length,
            cardHeight: rect ? rect.height : null,
            cardWidth: rect ? rect.width : null,
            pills: pillDetails
          };
        });

        return {
          totalPanels: panels.length,
          results
        };
      })()`
    });

    console.log('COURSE PANELS LOGO EVALUATION:');
    console.log(JSON.stringify(evalData.result.result.value, null, 2));

    // Capture desktop screenshot of active Card 1 (Full Stack)
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_fullstack.png'), Buffer.from(ss1.result.data, 'base64'));
    console.log('Saved snap_courses_fullstack.png');

    // Click tab 2 (Data Analytics)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#course-tab-1');
        if (tab) tab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 700));

    const ss2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_data_analytics.png'), Buffer.from(ss2.result.data, 'base64'));
    console.log('Saved snap_courses_data_analytics.png');

    // Click tab 3 (AI/ML)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#course-tab-2');
        if (tab) tab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 700));

    const ss3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_aiml.png'), Buffer.from(ss3.result.data, 'base64'));
    console.log('Saved snap_courses_aiml.png');

    // Click tab 4 (Cybersecurity)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#course-tab-3');
        if (tab) tab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 700));

    const ss4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_cybersecurity.png'), Buffer.from(ss4.result.data, 'base64'));
    console.log('Saved snap_courses_cybersecurity.png');

    // Click tab 5 (Cloud & DevOps)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#course-tab-4');
        if (tab) tab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 700));

    const ss5 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_devops.png'), Buffer.from(ss5.result.data, 'base64'));
    console.log('Saved snap_courses_devops.png');

    // Test Mobile View (375px)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 800));

    // Reset to Card 0 (Full Stack) on mobile
    await send('Runtime.evaluate', {
      expression: `(() => {
        const tab = document.querySelector('#course-tab-0');
        if (tab) tab.click();
        const card = document.querySelector('#course-panel-0');
        if (card) card.scrollIntoView({ block: 'center' });
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'snap_courses_mobile_logos.png'), Buffer.from(ssMobile.result.data, 'base64'));
    console.log('Saved snap_courses_mobile_logos.png');

    // Check overflow
    const overflowCheck = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        return {
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          overflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`
    });
    console.log('MOBILE OVERFLOW CHECK:', overflowCheck.result.result.value);

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error('Error during verification:', e);
    chrome.kill();
  }
}

run();
