const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 1500));
    const res = await fetch('http://127.0.0.1:9222/json');
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

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);

    await send('Page.enable');
    await send('DOM.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Desktop evaluation (1280px)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));

    const evalResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const heroTitle = document.querySelector('.hero-title');
        const heroTitleLead = document.querySelector('.hero-title-lead');
        const heroTitleHighlight = document.querySelector('.hero-title-highlight');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroOrbits = document.querySelectorAll('.hero-tech-orbit');
        const heroCtas = document.querySelectorAll('.hero-cta-group a');

        const courseCards = Array.from(document.querySelectorAll('.course-preview-card'));
        const cardData = courseCards.map(c => {
          const title = c.querySelector('.course-card-title')?.innerText?.trim();
          const summary = c.querySelector('.course-card-summary')?.innerText?.trim();
          const chips = Array.from(c.querySelectorAll('.key-chip')).map(k => k.innerText.trim());
          const exploreBtn = c.querySelector('.btn-explore-track')?.innerText?.trim();
          const isCompact = c.querySelector('.card-inner')?.classList.contains('compact-card');
          const height = c.querySelector('.card-inner')?.offsetHeight;
          return { title, summary, chipsCount: chips.length, chips, exploreBtn, isCompact, height };
        });

        const hasOverflowX = document.documentElement.scrollWidth > window.innerWidth;

        return {
          hero: {
            titleText: heroTitle?.innerText?.trim(),
            hasLead: !!heroTitleLead,
            hasHighlight: !!heroTitleHighlight,
            subtitleText: heroSubtitle?.innerText?.trim(),
            orbitCount: heroOrbits.length,
            ctaCount: heroCtas.length,
            ctaTexts: Array.from(heroCtas).map(a => a.innerText.trim())
          },
          courses: {
            cardCount: courseCards.length,
            cardData
          },
          desktopOverflow: hasOverflowX
        };
      })()`,
      returnByValue: true
    });

    console.log('--- Desktop Verification Result ---');
    console.log(JSON.stringify(evalResult.result.value, null, 2));

    // Capture Desktop Hero Screenshot
    const snapDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/snap_hero_courses_desktop.png', Buffer.from(snapDesktop.result.data, 'base64'));
    console.log('Saved scratch/snap_hero_courses_desktop.png');

    // Scroll to courses on desktop and take screenshot
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#courses').scrollIntoView();`
    });
    await new Promise(r => setTimeout(r, 600));
    const snapCoursesDesktop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/snap_courses_desktop.png', Buffer.from(snapCoursesDesktop.result.data, 'base64'));
    console.log('Saved scratch/snap_courses_desktop.png');

    // 2. Mobile evaluation (375px)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const hasOverflowX = document.documentElement.scrollWidth > window.innerWidth;
        const heroTitleSize = window.getComputedStyle(document.querySelector('.hero-title')).fontSize;
        const activeCard = document.querySelector('.course-preview-card.is-active .card-inner');
        const cardHeight = activeCard ? activeCard.offsetHeight : 0;

        return {
          mobileOverflow: hasOverflowX,
          heroTitleSize,
          activeCardHeight: cardHeight
        };
      })()`,
      returnByValue: true
    });

    console.log('--- Mobile Verification Result ---');
    console.log(JSON.stringify(mobileResult.result.value, null, 2));

    const snapMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/snap_hero_courses_mobile.png', Buffer.from(snapMobile.result.data, 'base64'));
    console.log('Saved scratch/snap_hero_courses_mobile.png');

    // Scroll to courses on mobile and take screenshot
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#courses').scrollIntoView();`
    });
    await new Promise(r => setTimeout(r, 500));
    const snapCoursesMobile = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/snap_courses_mobile.png', Buffer.from(snapCoursesMobile.result.data, 'base64'));
    console.log('Saved scratch/snap_courses_mobile.png');

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
  }
}

run();
