const fs = require('fs');
const path = require('path');

console.log('--- STARTING TYPOGRAPHY MIGRATION TO SORA & INTER ---');

// 1. UPDATE index.html
function updateIndexHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace Google Fonts link
  const oldFontRegex = /<!-- Google Fonts:.*?-->\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans:[^"]+"\s+rel="stylesheet">/s;
  
  const newFontTag = `<!-- Google Fonts: Sora & Inter for Modern Professional Tech Theme -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;

  if (oldFontRegex.test(html)) {
    html = html.replace(oldFontRegex, newFontTag);
    console.log(`[UPDATED] Google Fonts in ${filePath}`);
  } else {
    // Try simpler replace if comments differ
    const simpleOld = /<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans:[^"]+"\s+rel="stylesheet">/s;
    if (simpleOld.test(html)) {
      html = html.replace(simpleOld, '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">');
      console.log(`[UPDATED] Simple Google Fonts match in ${filePath}`);
    }
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

updateIndexHtml('index.html');
if (fs.existsSync('miracle-it-career-academy/index.html')) {
  updateIndexHtml('miracle-it-career-academy/index.html');
}

// 2. UPDATE css/global.css
function updateGlobalCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, 'utf8');

  // Header comment
  css = css.replace('Plus Jakarta Sans & JetBrains Mono Typography.', 'Sora & Inter Typography.');

  // @import url
  css = css.replace(
    /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans:[^']+'\);/,
    "@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');"
  );

  // Variables in :root
  css = css.replace(
    /--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;/,
    "--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  );
  css = css.replace(
    /--font-heading: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;/,
    "--font-heading: 'Sora', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
  );
  // Remove --font-mono line
  css = css.replace(/\s*--font-mono: 'JetBrains Mono', monospace;\r?\n/, '\n');

  // Hierarchy
  // h1 font weight 800
  css = css.replace(
    /h1\s*\{\s*font-size: clamp\([^)]+\);\s*line-height: [^;]+;\s*letter-spacing: [^;]+;\s*font-weight: 900;/,
    (match) => match.replace('font-weight: 900;', 'font-weight: 800;')
  );

  // Buttons font weight 600
  css = css.replace(
    /\.btn\s*\{([^}]*?)font-weight: 700;/s,
    (match, p1) => `.btn {${p1}font-weight: 600;`
  );
  css = css.replace(
    /\.btn-lg\s*\{([^}]*?)font-weight: 700;/s,
    (match, p1) => `.btn-lg {${p1}font-weight: 600;`
  );

  // Section tag
  css = css.replace(
    /\.section-tag\s*\{([^}]*?)font-family: var\(--font-mono\);([^}]*?)letter-spacing: 0\.08em;/s,
    (match, p1, p2) => `.section-tag {${p1}font-family: var(--font-sans);${p2}letter-spacing: 0.03em;`
  );

  // Replace any remaining var(--font-mono) in global.css
  css = css.replace(/var\(--font-mono, monospace\)/g, 'var(--font-sans)');
  css = css.replace(/var\(--font-mono\)/g, 'var(--font-sans)');

  fs.writeFileSync(filePath, css, 'utf8');
  console.log(`[UPDATED] ${filePath}`);
}

updateGlobalCss('css/global.css');
if (fs.existsSync('miracle-it-career-academy/css/global.css')) {
  updateGlobalCss('miracle-it-career-academy/css/global.css');
}

// 3. UPDATE ALL COMPONENT CSS FILES
const componentCssFiles = [
  'components/counselling-form/counselling-form.css',
  'components/counselling-process/counselling-process.css',
  'components/courses/courses.css',
  'components/final-cta/final-cta.css',
  'components/footer/footer.css',
  'components/header/header.css',
  'components/hero/hero.css',
  'components/learning-experience/learning-experience.css',
  'components/location/location.css',
  'components/mobile-sticky-cta/mobile-sticky-cta.css',
  'components/problem/problem.css',
  'components/proof/proof.css',
  'components/who-can-join/who-can-join.css',
  'components/why-miracle-it/why-miracle-it.css',
  'css/backgrounds.css',
  'full-stack-course-bhopal/style.css'
];

componentCssFiles.forEach(relPath => {
  [relPath, 'miracle-it-career-academy/' + relPath].forEach(targetPath => {
    if (!fs.existsSync(targetPath)) return;
    let fileContent = fs.readFileSync(targetPath, 'utf8');

    // Replace var(--font-mono, monospace) and var(--font-mono)
    fileContent = fileContent.replace(/var\(--font-mono,\s*monospace\)/g, 'var(--font-sans)');
    fileContent = fileContent.replace(/var\(--font-mono\)/g, 'var(--font-sans)');

    // Ensure buttons have weight 600
    if (targetPath.includes('who-can-join.css')) {
      fileContent = fileContent.replace(
        /\.who-cta-btn\s*\{([^}]*?)font-weight: 700;/s,
        (m, p1) => `.who-cta-btn {${p1}font-weight: 600;`
      );
    }

    fs.writeFileSync(targetPath, fileContent, 'utf8');
    console.log(`[UPDATED] ${targetPath}`);
  });
});

console.log('--- TYPOGRAPHY REPLACEMENT COMPLETE ---');
