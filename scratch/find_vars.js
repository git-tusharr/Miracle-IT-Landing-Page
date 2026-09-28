const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

async function findVars() {
  const port = 9390;
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--window-size=1280,900'
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const req = http.get(`http://127.0.0.1:${port}/json/list`, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', async () => {
      const targets = JSON.parse(d);
      const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
      let id = 1;
      const send = (m, p = {}) => new Promise(res => {
        const cur = id++;
        const h = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === cur) { ws.removeEventListener('message', h); res(msg.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method: m, params: p }));
      });
      await new Promise(r => ws.onopen = r);
      await send('Page.enable');
      await send('Runtime.enable');
      const fileUrl = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
      await send('Page.navigate', { url: fileUrl });
      await new Promise(r => setTimeout(r, 2000));
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const els = Array.from(document.querySelectorAll('*'));
          const found = [];
          els.forEach(el => {
            const val = el.style.getPropertyValue('--color-bg-alt') || 
                        window.getComputedStyle(el).getPropertyValue('--color-bg-alt');
            if (val && val.trim() !== '') {
              found.push({
                tag: el.tagName,
                id: el.id,
                cls: el.className ? el.className.slice(0, 40) : '',
                val: val.trim()
              });
            }
          });
          return found.slice(0, 15);
        })()`,
        returnByValue: true
      });
      console.log('Elements with --color-bg-alt:', JSON.stringify(res.result.value, null, 2));
      ws.close();
      edge.kill();
    });
  });
}
findVars();
