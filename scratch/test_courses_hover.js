const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9254',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_test_dir3'),
  'about:blank'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 1500));
    const res = await fetch('http://127.0.0.1:9254/json');
    const tabs = await res.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    let loadFired = false;
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Page.loadEventFired') {
        loadFired = true;
      }
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
    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Navigating to http://localhost:3000 ...');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    
    // Wait until load event or up to 6s
    for (let i = 0; i < 30 && !loadFired; i++) {
      await new Promise(r => setTimeout(r, 200));
    }
    console.log('Page loaded, loadFired =', loadFired);
    await new Promise(r => setTimeout(r, 1000));

    // Test 1: Rapid hover across courses
    const hoverTest = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
        try {
          const section = document.querySelector('#courses');
          if (!section) return { error: 'No #courses section found. Total sections: ' + document.querySelectorAll('section').length };
          const navItems = Array.from(section.querySelectorAll('.course-nav-item'));
          const cards = Array.from(section.querySelectorAll('.course-preview-card'));

          const initNav = navItems.findIndex(i => i.classList.contains('is-active'));
          const initCard = cards.findIndex(c => c.classList.contains('is-active'));

          // Rapid sweep: 0 -> 1 -> 2 -> 3
          navItems[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          await new Promise(r => setTimeout(r, 45));
          navItems[2].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          await new Promise(r => setTimeout(r, 45));
          navItems[3].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

          // Wait 350ms for transition
          await new Promise(r => setTimeout(r, 350));

          const finalNav = navItems.findIndex(i => i.classList.contains('is-active'));
          const finalCard = cards.findIndex(c => c.classList.contains('is-active'));

          // Test next sweep back to 0
          navItems[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          await new Promise(r => setTimeout(r, 350));

          const resetNav = navItems.findIndex(i => i.classList.contains('is-active'));
          const resetCard = cards.findIndex(c => c.classList.contains('is-active'));

          return {
            totalNavItems: navItems.length,
            totalCards: cards.length,
            init: { nav: initNav, card: initCard },
            sweepTo3: { nav: finalNav, card: finalCard, passed: finalNav === 3 && finalCard === 3 },
            sweepTo0: { nav: resetNav, card: resetCard, passed: resetNav === 0 && resetCard === 0 }
          };
        } catch (e) {
          return { error: e.message, stack: e.stack };
        }
      })()`
    });

    console.log('HOVER TEST RESULT:', hoverTest.result.result.value);

    // Test 2: Section background colors
    const sectionStyles = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const sections = Array.from(document.querySelectorAll('section'));
        return sections.map(s => {
          const comp = window.getComputedStyle(s);
          return {
            id: s.id || 'no-id',
            className: s.className,
            bg: comp.backgroundColor,
            color: comp.color
          };
        });
      })()`
    });

    console.log('ALL SECTIONS BACKGROUNDS:');
    sectionStyles.result.result.value.forEach(s => {
      console.log(`- ID: ${String(s.id).padEnd(22)} | Class: ${String(s.className).padEnd(35)} | BG: ${s.bg}`);
    });

    // Test 3: Logo styles in Header, Footer, and Final CTA
    const logoStyles = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const headerLogo = document.querySelector('.brand-logo');
        const footerLogo = document.querySelector('.footer-logo-link');
        const ctaLogo = document.querySelector('.final-cta-logo-link');
        
        return {
          header: headerLogo ? {
            bg: window.getComputedStyle(headerLogo).backgroundColor,
            padding: window.getComputedStyle(headerLogo).padding,
            borderRadius: window.getComputedStyle(headerLogo).borderRadius
          } : null,
          footer: footerLogo ? {
            bg: window.getComputedStyle(footerLogo).backgroundColor,
            padding: window.getComputedStyle(footerLogo).padding,
            borderRadius: window.getComputedStyle(footerLogo).borderRadius
          } : null,
          finalCta: ctaLogo ? {
            bg: window.getComputedStyle(ctaLogo).backgroundColor,
            padding: window.getComputedStyle(ctaLogo).padding,
            borderRadius: window.getComputedStyle(ctaLogo).borderRadius
          } : null
        };
      })()`
    });

    console.log('LOGO CONTAINERS:');
    console.log(JSON.stringify(logoStyles.result.result.value, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}
run();
