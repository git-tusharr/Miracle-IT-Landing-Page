const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9233',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  try {
    await new Promise(r => setTimeout(r, 1800));
    const res = await fetch('http://127.0.0.1:9233/json');
    const tabs = await res.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
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

    const srcPath = path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg');
    const b64 = fs.readFileSync(srcPath).toString('base64');

    const script = `
      (async () => {
        const img = new Image();
        img.src = 'data:image/jpeg;base64,${b64}';
        await new Promise(r => img.onload = r);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Sample "Career Academy" (roughly x: 450..800, y: 280..340)
        let samplesCareer = [];
        for (let y = 290; y < 330; y += 4) {
          for (let x = 450; x < 750; x += 15) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            if (r > 30) samplesCareer.push([r, g, b]);
          }
        }

        // Sample bottom text "Central India..." (roughly x: 80..800, y: 360..400)
        let samplesBottom = [];
        for (let y = 360; y < 400; y += 4) {
          for (let x = 100; x < 600; x += 20) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2];
            if (r > 30) samplesBottom.push([r, g, b]);
          }
        }

        return {
          samplesCareer: samplesCareer.slice(0, 5),
          samplesBottom: samplesBottom.slice(0, 5)
        };
      })()
    `;

    const evalRes = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: script
    });

    console.log('Sampled colors:', evalRes.result.result.value);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

run();
