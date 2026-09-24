const fs = require('fs');

function updateLocationCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const eol = content.includes('\r\n') ? '\r\n' : '\n';

  // 1. Update .other-center-card base background to 0.98 for solid readability
  content = content.replace(
    /background:\s*rgba\(13,\s*20,\s*36,\s*0\.9\);/,
    'background: rgba(11, 17, 32, 0.98);'
  );

  // 2. Target 768px block
  const target768 = `  .other-center-card {${eol}` +
    `    width: clamp(240px, 75vw, 265px);${eol}` +
    `    height: 230px;${eol}` +
    `    margin-top: -115px;${eol}` +
    `    margin-left: calc(-1 * clamp(240px, 75vw, 265px) / 2);${eol}` +
    `    padding: 1.05rem 1.15rem;${eol}` +
    `  }`;

  const replacement768 = `  .other-center-card {${eol}` +
    `    width: 270px;${eol}` +
    `    height: 235px;${eol}` +
    `    margin-top: -117px;${eol}` +
    `    margin-left: -135px;${eol}` +
    `    padding: 1.05rem 1.15rem;${eol}` +
    `  }`;

  if (content.includes(target768)) {
    content = content.replace(target768, replacement768);
    console.log(`[UPDATED 768px CARD] in ${filePath}`);
  } else {
    console.log(`[NOT FOUND 768px] in ${filePath}`);
  }

  // 3. Target 480px block
  const target480 = `  .other-center-card {${eol}` +
    `    width: clamp(225px, 78vw, 250px);${eol}` +
    `    height: 220px;${eol}` +
    `    margin-top: -110px;${eol}` +
    `    margin-left: calc(-1 * clamp(225px, 78vw, 250px) / 2);${eol}` +
    `    padding: 0.95rem 1rem;${eol}` +
    `  }`;

  const replacement480 = `  .other-center-card {${eol}` +
    `    width: 255px;${eol}` +
    `    height: 225px;${eol}` +
    `    margin-top: -112px;${eol}` +
    `    margin-left: -127px;${eol}` +
    `    padding: 0.95rem 1rem;${eol}` +
    `  }${eol}${eol}` +
    `  @media (max-width: 360px) {${eol}` +
    `    .other-center-card {${eol}` +
    `      width: 235px;${eol}` +
    `      height: 225px;${eol}` +
    `      margin-top: -112px;${eol}` +
    `      margin-left: -117px;${eol}` +
    `      padding: 0.85rem 0.9rem;${eol}` +
    `    }${eol}` +
    `  }`;

  if (content.includes(target480)) {
    content = content.replace(target480, replacement480);
    console.log(`[UPDATED 480px CARD] in ${filePath}`);
  } else {
    console.log(`[NOT FOUND 480px] in ${filePath}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateLocationCss('components/location/location.css');
if (fs.existsSync('miracle-it-career-academy/components/location/location.css')) {
  updateLocationCss('miracle-it-career-academy/components/location/location.css');
}

console.log('Location CSS update complete!');
