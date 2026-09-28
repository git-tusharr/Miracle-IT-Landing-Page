const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9250',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_verify_dir'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9250/json');
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
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });

  console.log('Navigating to http://localhost:3000 ...');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Verify Logo & Navbar
  const navLogoShot = await send('Page.captureScreenshot', {
    clip: { x: 0, y: 0, width: 1366, height: 120, scale: 1 }
  });
  fs.writeFileSync(path.resolve(__dirname, 'shot_header_logo.png'), Buffer.from(navLogoShot.result.data, 'base64'));
  console.log('Saved shot_header_logo.png');

  // 2. Test Courses Section Hover Effect
  console.log('Testing Courses Hover Switching...');
  const hoverTest = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const section = document.querySelector('#courses');
      section.scrollIntoView();
      await new Promise(r => setTimeout(r, 300));

      const navItems = Array.from(section.querySelectorAll('.course-nav-item'));
      const cards = Array.from(section.querySelectorAll('.course-preview-card'));

      // Check initial state
      const initialActiveNav = navItems.findIndex(i => i.classList.contains('is-active'));
      const initialActiveCard = cards.findIndex(c => c.classList.contains('is-active'));

      // Simulate fast sweeping hover across items:
      // Hover track 1, then track 2, then track 3 in quick succession (50ms apart)
      navItems[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));
      navItems[2].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise(r => setTimeout(r, 50));
      navItems[3].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      // Wait 350ms for transition to complete
      await new Promise(r => setTimeout(r, 350));

      const finalActiveNav = navItems.findIndex(i => i.classList.contains('is-active'));
      const finalActiveCard = cards.findIndex(c => c.classList.contains('is-active'));

      return {
        initialActiveNav,
        initialActiveCard,
        finalActiveNav,
        finalActiveCard,
        success: finalActiveNav === 3 && finalActiveCard === 3
      };
    })()`
  });

  console.log('Course Hover Rapid Test Result:', hoverTest.result.result.value);

  // Take screenshot of Courses section
  const coursesShot = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => {
      const el = document.querySelector('#courses');
      const rect = el.getBoundingClientRect();
      return { x: rect.left, y: window.scrollY + rect.top, width: rect.width, height: 700 };
    })()`
  });
  const cRect = coursesShot.result.result.value;
  const courseSectionPic = await send('Page.captureScreenshot', {
    clip: { x: 0, y: cRect.y, width: 1366, height: 700, scale: 1 }
  });
  fs.writeFileSync(path.resolve(__dirname, 'shot_courses_hover.png'), Buffer.from(courseSectionPic.result.data, 'base64'));
  console.log('Saved shot_courses_hover.png');

  // 3. Verify Section Backgrounds & Transitions (Problem -> Courses -> Why Miracle IT -> FAQ)
  const sectionsReport = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const ids = ['hero', 'placed-students', 'problem', 'courses', 'why-miracle-it', 'learning-experience', 'who-can-join', 'counselling-process', 'proof', 'location', 'faq', 'final-cta'];
      return ids.map(id => {
        const el = document.getElementById(id);
        if (!el) return { id, error: 'not found' };
        const style = window.getComputedStyle(el);
        return {
          id,
          bgColor: style.backgroundColor,
          color: style.color
        };
      });
    })()`
  });
  console.log('Section Styles Summary:', JSON.stringify(sectionsReport.result.result.value, null, 2));

  // 4. Capture Footer Logo
  const footerReport = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.getElementById('siteFooter');
      const rect = el.getBoundingClientRect();
      return { y: window.scrollY + rect.top, height: Math.min(rect.height, 450) };
    })()`
  });
  const fRect = footerReport.result.result.value;
  const footerPic = await send('Page.captureScreenshot', {
    clip: { x: 0, y: fRect.y, width: 1366, height: fRect.height, scale: 1 }
  });
  fs.writeFileSync(path.resolve(__dirname, 'shot_footer_logo.png'), Buffer.from(footerPic.result.data, 'base64'));
  console.log('Saved shot_footer_logo.png');

  // 5. Capture Final CTA Logo
  const ctaReport = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const el = document.getElementById('final-cta');
      const rect = el.getBoundingClientRect();
      return { y: window.scrollY + rect.top, height: 400 };
    })()`
  });
  const ctaRect = ctaReport.result.result.value;
  const ctaPic = await send('Page.captureScreenshot', {
    clip: { x: 0, y: ctaRect.y, width: 1366, height: 400, scale: 1 }
  });
  fs.writeFileSync(path.resolve(__dirname, 'shot_final_cta_logo.png'), Buffer.from(ctaPic.result.data, 'base64'));
  console.log('Saved shot_final_cta_logo.png');

  chrome.kill();
  process.exit(0);
}
run();
