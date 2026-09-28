const fs = require('fs');
const path = require('path');

const logos = [
  'google.svg',
  'meta.svg',
  'nvidia.svg',
  'wipro.svg',
  'infosys.svg',
  'accenture.svg',
  'capgemini.svg',
  'hcl.svg',
  'deloitte.svg',
  'dot9games.png',
  'uline.svg',
  'tcs.svg'
];

const cards = logos.map(name => `
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div style="width: 200px; height: 80px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <img src="../assets/icons/companies/${name}" style="max-width: 140px; max-height: 48px; object-fit: contain;">
    </div>
    <span style="font-family: sans-serif; font-size: 13px; font-weight: 600; color: #475569;">${name}</span>
  </div>
`).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Logo Test</title>
</head>
<body style="background: #F8FAFC; padding: 40px; display: flex; flex-wrap: wrap; gap: 24px; justify-content: center;">
  ${cards}
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'test_all_logos.html'), html);
console.log('Created test_all_logos.html');
