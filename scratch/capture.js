const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://127.0.0.1:3000/#why-miracle-it';
const outName = process.argv[3] || 'why_miracle_current.png';
const outPath = path.resolve(__dirname, outName);
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve('C:\\Users\\Lenovo\\AppData\\Local\\Temp', 'chrome-user-' + Date.now());

try {
  execFileSync(chromePath, [
    '--headless',
    '--disable-gpu',
    '--window-size=1440,2400',
    `--user-data-dir=${userDataDir}`,
    `--screenshot=${outPath}`,
    url
  ], { timeout: 15000 });
  console.log('Saved screenshot to:', outPath);
} catch (err) {
  console.error('Error taking screenshot:', err.message);
} finally {
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}
}
