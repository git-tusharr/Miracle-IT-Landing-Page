const { spawn } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--window-size=1280,1000',
  'http://localhost:3000'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const pageTab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let msgId = 1;
  const callbacks = new Map();
  const errors = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      errors.push(data.params.exceptionDetails);
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

  await new Promise(r => setTimeout(r, 2000));

  // Check all section targets
  const sectionIds = [
    '#hero',
    '#problem',
    '#courses',
    '#why-miracle-it',
    '#learning-experience',
    '#who-can-join',
    '#counselling-process',
    '#proof',
    '#location',
    '#faq',
    '#counselling-form'
  ];

  const sectionAudit = await send('Runtime.evaluate', {
    expression: `(() => {
      const results = [];
      const ids = ${JSON.stringify(sectionIds)};
      for (const id of ids) {
        const el = document.querySelector(id);
        results.push({
          id,
          found: !!el,
          offsetHeight: el ? el.offsetHeight : 0,
          offsetWidth: el ? el.offsetWidth : 0,
          display: el ? window.getComputedStyle(el).display : 'none',
          visibility: el ? window.getComputedStyle(el).visibility : 'hidden'
        });
      }
      return results;
    })()`,
    returnByValue: true
  });

  const getVal = res => res?.result?.result?.value;

  console.log('--- SECTION AUDIT ---');
  console.log(JSON.stringify(getVal(sectionAudit), null, 2));

  // Test ScrollSpy across multiple scroll positions
  const testScrolls = [
    { label: 'Hero (Top)', y: 0, expected: 'none' },
    { label: 'Problem', y: 1500, expected: 'Dilemma' },
    { label: 'Courses', y: 2500, expected: 'Courses' },
    { label: 'Why Miracle IT', y: 4500, expected: 'Why Miracle IT' },
    { label: 'Learning Experience', y: 8000, expected: 'Lab & Class' },
    { label: 'Counselling Process', y: 13800, expected: 'Process' },
    { label: 'Location', y: 17000, expected: 'Location' },
    { label: 'FAQ', y: 19500, expected: 'FAQs' }
  ];

  // Get exact top positions of all sections taking pin spacers into account
  const exactPositions = await send('Runtime.evaluate', {
    expression: `(() => {
      const ids = ['#problem', '#courses', '#why-miracle-it', '#learning-experience', '#who-can-join', '#counselling-process', '#location', '#faq'];
      return ids.map(id => {
        const el = document.querySelector(id);
        const spacer = el ? (el.closest('.pin-spacer') || el.parentElement?.closest('.pin-spacer')) : null;
        const targetEl = spacer || el;
        const rect = targetEl ? targetEl.getBoundingClientRect() : null;
        return {
          id,
          top: targetEl ? Math.round(rect.top + window.pageYOffset) : 0,
          height: targetEl ? Math.round(targetEl.offsetHeight) : 0
        };
      });
    })()`,
    returnByValue: true
  });
  console.log('--- EXACT SECTION COORDINATES ---', JSON.stringify(getVal(exactPositions), null, 2));

  console.log('--- SCROLLSPY ACCURACY TEST ---');
  for (const item of (getVal(exactPositions) || [])) {
    const testY = item.top + 100;
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, ${testY}); window.dispatchEvent(new Event('scroll'));`
    });
    await new Promise(r => setTimeout(r, 200));

    const activeNav = await send('Runtime.evaluate', {
      expression: `(() => {
        const active = document.querySelector('.nav-link.is-active');
        return active ? active.textContent.trim() : 'none';
      })()`,
      returnByValue: true
    });

    console.log(`Target: ${item.id} (Y=${testY}) => Active Nav: "${getVal(activeNav)}"`);
  }

  // Test FAQ Accordion click
  const faqTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const firstFaq = document.querySelector('.faq-item');
      const question = firstFaq ? firstFaq.querySelector('.faq-question') : null;
      if (!question) return { success: false, reason: 'No question found' };
      const beforeOpen = firstFaq.classList.contains('is-open');
      question.click();
      const afterOpen = firstFaq.classList.contains('is-open');
      return { success: true, beforeOpen, afterOpen };
    })()`,
    returnByValue: true
  });
  console.log('--- FAQ ACCORDION TEST ---', JSON.stringify(getVal(faqTest)));

  // Test Course Tab Switching
  const courseTest = await send('Runtime.evaluate', {
    expression: `(() => {
      const tabs = Array.from(document.querySelectorAll('.course-tab-btn'));
      if (tabs.length < 2) return { success: false, reason: 'Less than 2 tabs' };
      const secondTab = tabs[1];
      secondTab.click();
      return {
        success: true,
        secondTabActive: secondTab.classList.contains('is-active'),
        secondTabCourseId: secondTab.getAttribute('data-course-id')
      };
    })()`,
    returnByValue: true
  });
  console.log('--- COURSES TAB TEST ---', JSON.stringify(getVal(courseTest)));

  console.log('--- BROWSER ERRORS ---', errors.length === 0 ? 'ZERO ERRORS!' : errors);

  ws.close();
  chrome.kill();
}
run().catch(e => { console.error(e); chrome.kill(); });
