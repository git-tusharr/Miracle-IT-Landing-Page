const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--window-size=1280,1000'
  ]);

  // wait for port 9222
  await new Promise(r => setTimeout(r, 1500));

  http.get('http://localhost:9222/json/new?http://localhost:3000/#other-centers', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const pageInfo = JSON.parse(data);
      const wsUrl = pageInfo.webSocketDebuggerUrl;
      const WebSocket = require('node:dns'); // wait, do we have ws module?
    });
  });
}
