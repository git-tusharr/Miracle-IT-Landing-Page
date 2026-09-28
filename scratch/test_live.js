const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9257',
  '--disable-gpu',
  'http://127.0.0.1:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));
  const res = await fetch('http://127.0.0.1:9257/json');
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
  await send('Runtime.enable');

  const r = await send('Runtime.evaluate', {
    expression: `(() => {
      const sections = Array.from(document.querySelectorAll('section')).map(s => ({
        id: s.id,
        className: s.className,
        bg: window.getComputedStyle(s).backgroundColor
      }));
      return {
        url: window.location.href,
        title: document.title,
        sectionCount: sections.length,
        sections
      };
    })()`,
    returnByValue: true
  });
  console.log('Result:', JSON.stringify(r.result.result.value, null, 2));

  // Test courses hover
  const hoverRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const section = document.querySelector('#courses');
      const navItems = Array.from(section.querySelectorAll('.course-nav-item'));
      const cards = Array.from(section.querySelectorAll('.course-preview-card'));

      // Check initial
      const initNav = navItems.findIndex(i => i.classList.contains('is-active'));
      const initCard = cards.findIndex(c => c.classList.contains('is-active'));

      // Fast hover across 0 -> 1 -> 2 -> 3
      navItems[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise(r => setTimeout(r, 40));
      navItems[2].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise(r => setTimeout(r, 40));
      navItems[3].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      // Wait 350ms
      await new Promise(r => setTimeout(r, 350));

      const after3Nav = navItems.findIndex(i => i.classList.contains('is-active'));
      const after3Card = cards.findIndex(c => c.classList.contains('is-active'));

      // Switch back to 1
      navItems[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await new Promise(r => setTimeout(r, 350));

      const back1Nav = navItems.findIndex(i => i.classList.contains('is-active'));
      const back1Card = cards.findIndex(c => c.classList.contains('is-active'));

      return {
        initial: { nav: initNav, card: initCard },
        afterSweep3: { nav: after3Nav, card: after3Card, success: after3Nav === 3 && after3Card === 3 },
        afterSweepBack1: { nav: back1Nav, card: back1Card, success: back1Nav === 1 && back1Card === 1 }
      };
    })()`
  });
  console.log('HOVER TEST:', JSON.stringify(hoverRes.result.result.value, null, 2));

  // Logo inspection
  const logoRes = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const headerLogo = document.querySelector('.brand-logo');
      const footerLogo = document.querySelector('.footer-logo-link');
      const ctaLogo = document.querySelector('.final-cta-logo-link');

      return {
        header: headerLogo ? {
          bg: window.getComputedStyle(headerLogo).backgroundColor,
          boxShadow: window.getComputedStyle(headerLogo).boxShadow,
          borderRadius: window.getComputedStyle(headerLogo).borderRadius
        } : null,
        footer: footerLogo ? {
          bg: window.getComputedStyle(footerLogo).backgroundColor,
          borderRadius: window.getComputedStyle(footerLogo).borderRadius
        } : null,
        cta: ctaLogo ? {
          bg: window.getComputedStyle(ctaLogo).backgroundColor,
          borderRadius: window.getComputedStyle(ctaLogo).borderRadius
        } : null
      };
    })()`
  });
  console.log('LOGO STYLES:', JSON.stringify(logoRes.result.result.value, null, 2));

  chrome.kill();
  process.exit(0);
}
run();
