const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function inspectRules() {
  const port = 9393;
  const tmpDir = path.join(os.tmpdir(), 'edge-rules-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1280,900'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const targets = await new Promise((res, rej) => {
      const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      });
      req.on('error', rej);
    });

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const send = (method, params = {}) => new Promise((res, rej) => {
      const id = msgId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('CSS.enable');

    const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 2000));

    // Get the element and its matched CSS rules
    const doc = await send('DOM.getDocument');
    const maskNode = await send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: '.proof-testimonials-mask'
    });

    const matchedRules = await send('CSS.getMatchedStylesForNode', {
      nodeId: maskNode.nodeId
    });

    const pseudoMatches = matchedRules.pseudoElements || [];
    console.log('Pseudo matches found:', pseudoMatches.length);
    for (const p of pseudoMatches) {
      console.log('Pseudo type:', p.pseudoType);
      for (const m of p.matches) {
        console.log('  Selector:', m.rule.selectorList.text, '| Origin:', m.rule.origin);
        for (const prop of m.rule.style.cssProperties) {
          if (prop.name === 'background' || prop.name === 'background-image') {
            console.log('    ', prop.name, ':', prop.value);
          }
        }
      }
    }

    ws.close();
  } finally {
    edge.kill();
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
}

inspectRules();
