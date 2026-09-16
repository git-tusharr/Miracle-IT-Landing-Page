const { spawn } = require('child_process');

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

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const why = document.querySelector('#why-miracle-it');
      const whySpacer = why ? why.parentElement : null;
      const learn = document.querySelector('#learning-experience');
      const learnParent = learn ? learn.parentElement : null;
      const who = document.querySelector('#who-can-join');
      const whoContainer = document.querySelector('#whoStackContainer');
      const whoSpacer = whoContainer ? whoContainer.parentElement : null;

      const rectToObj = (r) => r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) } : null;

      return {
        why: {
          tagName: why?.tagName,
          style: why?.getAttribute('style'),
          parentClass: whySpacer?.className,
          parentStyle: whySpacer?.getAttribute('style'),
          offsetHeight: why?.offsetHeight,
          clientRect: rectToObj(why?.getBoundingClientRect())
        },
        learn: {
          exists: !!learn,
          innerHTMLSnippet: learn ? learn.innerHTML.substring(0, 100) : null,
          parent: learnParent ? learnParent.tagName + '.' + learnParent.className : null,
          offsetHeight: learn?.offsetHeight,
          clientRect: rectToObj(learn?.getBoundingClientRect())
        },
        who: {
          style: who?.getAttribute('style'),
          offsetHeight: who?.offsetHeight,
          containerSpacer: whoSpacer?.className,
          containerStyle: whoSpacer?.getAttribute('style'),
          cards: Array.from(document.querySelectorAll('.who-stack-card')).map(c => ({
            idx: c.getAttribute('data-card-index'),
            style: c.getAttribute('style'),
            clientRect: rectToObj(c.getBoundingClientRect())
          }))
        }
      };
    })()`,
    returnByValue: true
  });

  console.log('info is:', JSON.stringify(info, null, 2));
  ws.close();
  chrome.kill();
}
run().catch(e => { console.error(e); chrome.kill(); });
