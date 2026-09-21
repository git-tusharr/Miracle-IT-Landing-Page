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
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({ type: data.params.type, text: data.params.args.map(a => a.value).join(' ') });
      }
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

    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 2500));

    const auditResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const sections = [
          { num: '01', name: 'Sticky Header', sel: '#siteHeader', component: 'header' },
          { num: '02', name: 'Hero', sel: '#hero', component: 'hero' },
          { num: '03', name: 'Problem Section', sel: '#problem', component: 'problem' },
          { num: '04', name: 'Course Options', sel: '#courses', component: 'courses' },
          { num: '05', name: 'Why Miracle IT', sel: '#why-miracle-it', component: 'why-miracle-it' },
          { num: '06', name: 'Learning Experience', sel: '#learning-experience', component: 'learning-experience' },
          { num: '07', name: 'Who Can Join?', sel: '#who-can-join', component: 'who-can-join' },
          { num: '08', name: 'Career Counselling Process', sel: '#counselling-process', component: 'counselling-process' },
          { num: '09', name: 'Proof / Trust', sel: '#proof', component: 'proof' },
          { num: '10', name: 'Location', sel: '#location', component: 'location' },
          { num: '11', name: 'FAQ', sel: '#faq', component: 'faq' },
          { num: '12', name: 'Final CTA', sel: '#final-cta', component: 'final-cta' },
          { num: '13', name: 'Footer', sel: '#siteFooter', component: 'footer' }
        ];

        const sectionCheck = sections.map(s => {
          const el = document.querySelector(s.sel);
          const mount = document.querySelector('[data-component="' + s.component + '"]');
          return {
            num: s.num,
            name: s.name,
            found: !!el,
            mounted: !!mount
          };
        });

        // Check unverified companies ticker
        const companyTicker = document.querySelector('#companies') || document.querySelector('.company-ticker-section');

        // Check Hero content
        const heroTitle = document.querySelector('.hero-title')?.innerText?.replace(/\\s+/g, ' ').trim();
        const heroSubtitle = document.querySelector('.hero-subtitle')?.innerText?.replace(/\\s+/g, ' ').trim();
        const heroCTAs = Array.from(document.querySelectorAll('.hero-cta-group a')).map(a => a.innerText.trim());

        // Check Course Cards meta
        const courseCards = Array.from(document.querySelectorAll('.course-preview-card')).map(card => {
          const title = card.querySelector('.course-card-title')?.innerText?.trim();
          const whoFor = card.querySelector('.course-meta-row:nth-child(1) .course-meta-val')?.innerText?.trim();
          const keyAreas = card.querySelector('.course-meta-row:nth-child(2) .course-meta-val')?.innerText?.trim();
          const ctas = Array.from(card.querySelectorAll('.course-card-footer a')).map(a => a.innerText.trim());
          return { title, hasWhoFor: !!whoFor, hasKeyAreas: !!keyAreas, ctas };
        });

        // Check Section 12 Final CTA
        const finalTitle = document.querySelector('.final-cta-title')?.innerText?.replace(/\\s+/g, ' ').trim();
        const finalSubtitle = document.querySelector('.final-cta-subtitle')?.innerText?.replace(/\\s+/g, ' ').trim();
        const formEl = document.querySelector('#counsellingForm');
        const phoneLink = document.querySelector('.final-shortcuts-bar a[href^="tel:"]')?.href;
        const whatsappLink = document.querySelector('.final-shortcuts-bar a[data-config-whatsapp]') !== null;
        const directionsLink = document.querySelector('.final-shortcuts-bar a[data-config-directions]') !== null;
        const counsellingAnchor = document.querySelector('#counselling-form') !== null;

        // Check Footer
        const privacyBtn = document.querySelector('#btnOpenPrivacy') !== null;
        const termsBtn = document.querySelector('#btnOpenTerms') !== null;
        const privacyModal = document.querySelector('#privacyModal') !== null;
        const termsModal = document.querySelector('#termsModal') !== null;

        return {
          sectionCheck,
          companyTickerFound: !!companyTicker,
          heroTitle,
          heroSubtitle,
          heroCTAs,
          courseCardsCount: courseCards.length,
          courseCards,
          finalTitle,
          finalSubtitle,
          hasForm: !!formEl,
          phoneLink,
          hasWhatsApp: whatsappLink,
          hasDirections: directionsLink,
          hasCounsellingAnchor: counsellingAnchor,
          footerLegal: { privacyBtn, termsBtn, privacyModal, termsModal }
        };
      })()`,
      returnByValue: true
    });

    console.log('AUDIT REPORT:');
    const val = auditResult.result?.result?.value || auditResult.result?.value || auditResult;
    console.log(JSON.stringify(val, null, 2));

    // Test Privacy Modal Interaction
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelector('#btnOpenPrivacy')?.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 300));
    const modalCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const m = document.querySelector('#privacyModal');
        return {
          isOpen: m?.classList.contains('is-open'),
          isHiddenAttr: m?.hasAttribute('hidden')
        };
      })()`,
      returnByValue: true
    });
    console.log('PRIVACY MODAL TEST:', modalCheck.result?.result?.value || modalCheck);

    // Close Modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelector('#btnClosePrivacy')?.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 200));

    // Check Console errors
    console.log('CONSOLE LOGS / ERRORS:');
    consoleLogs.filter(l => l.type === 'error' || l.type === 'warning').forEach(l => console.log(l));

    chrome.kill();
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
  }
}

run();
