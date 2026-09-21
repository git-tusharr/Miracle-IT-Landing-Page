const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9228',
  '--disable-gpu',
  '--window-size=1280,900',
  'http://localhost:3000'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9228/json');
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
    await send('Runtime.enable');
    await send('Page.enable');

    await new Promise(r => setTimeout(r, 1000));

    // 1. Inspect Navbar Structure
    const navInspection = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const logo = document.querySelector('.brand-logo');
        const navList = Array.from(document.querySelectorAll('.nav-list .nav-link')).map(a => ({
          text: a.innerText.trim(),
          href: a.getAttribute('href')
        }));

        const callWhatsapp = document.querySelector('.header-call-whatsapp');
        const callPill = callWhatsapp?.querySelector('.call-pill');
        const waPill = callWhatsapp?.querySelector('.whatsapp-pill');
        const bookBtn = document.querySelector('.header-book-btn');

        const stickyBar = document.querySelector('.mobile-sticky-bar');
        const stickyBookBtn = stickyBar?.querySelector('.book-action span');

        return {
          hasLogo: !!logo,
          logoText: logo?.innerText.trim().replace(/\\s+/g, ' '),
          navItems: navList,
          hasCallWhatsapp: !!callWhatsapp,
          callPillText: callPill?.innerText.trim(),
          callPillHref: callPill?.getAttribute('href'),
          waPillText: waPill?.innerText.trim(),
          waPillHref: waPill?.getAttribute('href'),
          bookBtnText: bookBtn?.innerText.trim(),
          bookBtnHref: bookBtn?.getAttribute('href'),
          stickyCtaText: stickyBookBtn?.innerText.trim()
        };
      })()`
    });

    console.log('--- NAVBAR SPECIFICATION INSPECTION ---');
    console.log(JSON.stringify(navInspection.result.result.value, null, 2));

    const outDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\a59e7e53-8dfe-4d83-842a-18fd1d581ccc';

    // Capture desktop navbar screenshot
    const desktopScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1280, height: 120, scale: 1 }
    });
    fs.writeFileSync(path.join(outDir, 'navbar_desktop_view.png'), Buffer.from(desktopScreenshot.result.data, 'base64'));
    console.log('Saved navbar_desktop_view.png');

    // 2. Test ScrollSpy on all 4 nav items
    console.log('\n--- TESTING SCROLLSPY ---');
    const sectionsToTest = ['#courses', '#why-miracle-it', '#proof', '#location'];
    for (const secId of sectionsToTest) {
      await send('Runtime.evaluate', {
        expression: `document.querySelector('${secId}')?.scrollIntoView({ block: 'start' });`
      });
      await new Promise(r => setTimeout(r, 400));
      const activeInfo = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const active = document.querySelector('.nav-link.is-active');
          return {
            target: '${secId}',
            activeText: active?.innerText.trim(),
            activeHref: active?.getAttribute('href')
          };
        })()`
      });
      console.log(`Scroll to ${secId}: Active Nav ->`, JSON.stringify(activeInfo.result.result.value));
    }

    // 3. Test Mobile Drawer and Sticky CTA (Resize to 390x844)
    console.log('\n--- TESTING MOBILE DRAWER & STICKY CTA ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    // Scroll to top
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });

    // Open mobile menu
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#navToggle')?.click();`
    });
    await new Promise(r => setTimeout(r, 400));

    const mobileDrawerScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'navbar_mobile_drawer.png'), Buffer.from(mobileDrawerScreenshot.result.data, 'base64'));
    console.log('Saved navbar_mobile_drawer.png');

    // Close mobile menu and scroll down to capture sticky CTA
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#navToggle')?.click(); window.scrollTo(0, 500);`
    });
    await new Promise(r => setTimeout(r, 400));

    const stickyScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'sticky_cta_mobile_view.png'), Buffer.from(stickyScreenshot.result.data, 'base64'));
    console.log('Saved sticky_cta_mobile_view.png');

    ws.close();
    chrome.kill();
  } catch (err) {
    console.error(err);
    chrome.kill();
  }
}

run();
