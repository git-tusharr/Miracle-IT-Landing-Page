const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

async function checkBody() {
  const port = 9391;
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
          const b = document.body;
          return {
            bodyClass: b.className,
            bodyTheme: b.getAttribute('data-theme'),
            bodyBgAlt: window.getComputedStyle(b).getPropertyValue('--color-bg-alt').trim(),
            rootBgAlt: window.getComputedStyle(document.documentElement).getPropertyValue('--color-bg-alt').trim()
          };
        })()`,
        returnByValue: true
      });
      console.log('Body Evaluation:', JSON.stringify(res.result.value, null, 2));
      ws.close();
      edge.kill();
    });
  });
}
checkBody();
