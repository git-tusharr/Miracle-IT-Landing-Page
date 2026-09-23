const fs = require('fs');

function updateHierarchy(filePath) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, 'utf8');

  const oldH3Block = `h3 {
  font-size: clamp(1.1rem, 2.2vw, 1.55rem);
  line-height: 1.25;
  font-weight: 700;
  overflow-wrap: break-word;
  word-break: break-word;
}

p {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  line-height: 1.65;
  overflow-wrap: break-word;
}`;

  const newH3Block = `h3 {
  font-size: clamp(1.1rem, 2.2vw, 1.55rem);
  line-height: 1.25;
  font-weight: 700;
  overflow-wrap: break-word;
  word-break: break-word;
}

h4 {
  font-size: clamp(1rem, 1.8vw, 1.3rem);
  line-height: 1.3;
  font-weight: 600;
  overflow-wrap: break-word;
  word-break: break-word;
}

p {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  line-height: 1.65;
  font-weight: 400;
  overflow-wrap: break-word;
}

label, .form-label {
  font-family: var(--font-sans);
  font-weight: 500;
}`;

  // Normalize CRLF for matching
  css = css.replace(/\r\n/g, '\n');
  if (css.includes(oldH3Block)) {
    css = css.replace(oldH3Block, newH3Block);
    // Write back with CRLF if on Windows
    css = css.replace(/\n/g, '\r\n');
    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`[UPDATED HIERARCHY] ${filePath}`);
  } else {
    console.log(`[NOT FOUND] oldH3Block in ${filePath}`);
  }
}

updateHierarchy('css/global.css');
if (fs.existsSync('miracle-it-career-academy/css/global.css')) {
  updateHierarchy('miracle-it-career-academy/css/global.css');
}
