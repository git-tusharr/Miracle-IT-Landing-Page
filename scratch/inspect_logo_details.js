const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--remote-debugging-port=9245',
  '--disable-gpu',
  '--user-data-dir=' + path.resolve(__dirname, 'chrome_tmp_dir'),
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9245/json');
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

  const sqB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-square.png')).toString('base64');
  const userB64 = fs.readFileSync(path.resolve(__dirname, '../assets/images/miracle-it-logo-user.jpg')).toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      // Analyze user logo
      const imgU = new Image();
      imgU.src = 'data:image/jpeg;base64,${userB64}';
      await new Promise(r => imgU.onload = r);

      const canU = document.createElement('canvas');
      canU.width = imgU.naturalWidth;
      canU.height = imgU.naturalHeight;
      const ctxU = canU.getContext('2d');
      ctxU.drawImage(imgU, 0, 0);
      const dataU = ctxU.getImageData(0, 0, canU.width, canU.height).data;

      // Find average RGB of the grey text in user logo
      // Grey text has |r-g| < 15, |g-b| < 15, maxVal between 40 and 150
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let i = 0; i < dataU.length; i += 4) {
        const r = dataU[i], g = dataU[i+1], b = dataU[i+2];
        const maxVal = Math.max(r, g, b);
        const minVal = Math.min(r, g, b);
        if (maxVal - minVal < 15 && maxVal >= 40 && maxVal <= 160) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }

      // Analyze square logo
      const imgS = new Image();
      imgS.src = 'data:image/png;base64,${sqB64}';
      await new Promise(r => imgS.onload = r);

      const canS = document.createElement('canvas');
      canS.width = imgS.naturalWidth;
      canS.height = imgS.naturalHeight;
      const ctxS = canS.getContext('2d');
      ctxS.drawImage(imgS, 0, 0);
      const dataS = ctxS.getImageData(0, 0, canS.width, canS.height).data;

      // Find white pixels in square logo (the text that was made white)
      let sWhite = 0, sOrange = 0, sBlue = 0;
      // Where are white pixels located vertically in square logo?
      let minWhiteY = canS.height, maxWhiteY = 0;
      for (let y = 0; y < canS.height; y++) {
        for (let x = 0; x < canS.width; x++) {
          const idx = (y * canS.width + x) * 4;
          const r = dataS[idx], g = dataS[idx+1], b = dataS[idx+2], a = dataS[idx+3];
          if (a > 50 && r > 200 && g > 200 && b > 200) {
            sWhite++;
            if (y < minWhiteY) minWhiteY = y;
            if (y > maxWhiteY) maxWhiteY = y;
          }
        }
      }

      return {
        userGreyAvg: count > 0 ? [Math.round(rSum/count), Math.round(gSum/count), Math.round(bSum/count), count] : null,
        squareWhiteYRange: [minWhiteY, maxWhiteY, canS.height],
        sWhite
      };
    })()`
  });

  console.log('Analysis result:', evalRes.result.result.value);
  chrome.kill();
  process.exit(0);
}
run();
