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

  // 2. Replace max-width: 768px card sizing
  const card768Regex = /\.other-center-card\s*\{\s*width:\s*clamp\(240px,\s*75vw,\s*265px\);\s*height:\s*230px;\s*margin-top:\s*-115px;\s*margin-left:\s*calc\([^)]+\);\s*padding:\s*1\.05rem\s+1\.15rem;\s*\}/;
  const replacement768 = `.other-center-card {${eol}    width: 270px;${eol}    height: 235px;${eol}    margin-top: -117px;${eol}    margin-left: -135px;${eol}    padding: 1.05rem 1.15rem;${eol}  }`;

  if (card768Regex.test(content)) {
    content = content.replace(card768Regex, replacement768);
    console.log(`[UPDATED 768px CARD] in ${filePath}`);
  }

  // 3. Replace max-width: 480px card sizing
  const card480Regex = /\.other-center-card\s*\{\s*width:\s*clamp\(225px,\s*78vw,\s*250px\);\s*height:\s*220px;\s*margin-top:\s*-110px;\s*margin-left:\s*calc\([^)]+\);\s*padding:\s*0\.95rem\s+1rem;\s*\}/;
  const replacement480 = `.other-center-card {${eol}    width: 255px;${eol}    height: 225px;${eol}    margin-top: -112px;${eol}    margin-left: -127px;${eol}    padding: 0.95rem 1rem;${eol}  }${eol}${eol}  @media (max-width: 360px) {${eol}    .other-center-card {${eol}      width: 235px;${eol}      height: 225px;${eol}      margin-top: -112px;${eol}      margin-left: -117px;${eol}      padding: 0.85rem 0.9rem;${eol}    }${eol}  }`;

  if (card480Regex.test(content)) {
    content = content.replace(card480Regex, replacement480);
    console.log(`[UPDATED 480px CARD] in ${filePath}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateLocationCss('components/location/location.css');
if (fs.existsSync('miracle-it-career-academy/components/location/location.css')) {
  updateLocationCss('miracle-it-career-academy/components/location/location.css');
}

console.log('Location CSS update complete!');
