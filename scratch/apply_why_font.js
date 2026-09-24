const fs = require('fs');

function updateWhyCss(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Detect line ending
  const isCrlf = content.includes('\r\n');
  const eol = isCrlf ? '\r\n' : '\n';

  // 1. Add screen font definition before .tablet-screen-bezel
  const targetBezelRegex = /\/\*\s*Tablet Display Screen Container\s*\*\/\r?\n\.tablet-screen-bezel\s*\{/;
  const replacementBezel = `/* ==========================================================================${eol}` +
    `   Screen Display High-Tech Typography (JetBrains Mono Workstation Aesthetic)${eol}` +
    `   Distinctive terminal/IDE typography that sets the tablet screen apart from the site${eol}` +
    `   ========================================================================== */${eol}` +
    `.tablet-device-chassis,${eol}` +
    `.tablet-screen-bezel {${eol}` +
    `  --font-screen: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;${eol}` +
    `  font-family: var(--font-screen);${eol}` +
    `  -webkit-font-smoothing: antialiased;${eol}` +
    `  -moz-osx-font-smoothing: grayscale;${eol}` +
    `}${eol}${eol}` +
    `.tablet-screen-bezel,${eol}` +
    `.tablet-screen-bezel h3,${eol}` +
    `.tablet-screen-bezel h4,${eol}` +
    `.tablet-screen-bezel p,${eol}` +
    `.tablet-screen-bezel span,${eol}` +
    `.tablet-screen-bezel strong,${eol}` +
    `.tablet-screen-bezel button,${eol}` +
    `.tablet-screen-bezel a,${eol}` +
    `.tablet-screen-bezel text,${eol}` +
    `.tablet-bottom-hud,${eol}` +
    `.tablet-bottom-hud button {${eol}` +
    `  font-family: var(--font-screen);${eol}` +
    `}${eol}${eol}` +
    `/* Tablet Display Screen Container */${eol}.tablet-screen-bezel {`;

  if (targetBezelRegex.test(content) && !content.includes('--font-screen: \'JetBrains Mono\'')) {
    content = content.replace(targetBezelRegex, replacementBezel);
    console.log(`[ADDED FONT ROOT] ${filePath}`);
  }

  // 2. Replace var(--font-sans) with var(--font-screen) inside why-miracle-it.css
  const countBefore = (content.match(/var\(--font-sans\)/g) || []).length;
  content = content.replace(/var\(--font-sans\)/g, 'var(--font-screen)');
  const countAfter = (content.match(/var\(--font-screen\)/g) || []).length;
  console.log(`[REPLACED FONT-SANS] in ${filePath}: replaced ${countBefore} occurrences, total font-screen now: ${countAfter}`);

  // 3. Fine-tune slide-title letter-spacing & font-weight for JetBrains Mono
  content = content.replace(
    /\.slide-title\s*\{([^}]*?)font-weight:\s*800;([^}]*?)letter-spacing:\s*-0\.015em;/s,
    (match, p1, p2) => `.slide-title {${p1}font-family: var(--font-screen); font-weight: 700;${p2}letter-spacing: -0.025em;`
  );

  // 4. Fine-tune slide-sub for JetBrains Mono
  content = content.replace(
    /\.slide-sub\s*\{([^}]*?)line-height:\s*1\.5;/s,
    (match, p1) => `.slide-sub {${p1}font-family: var(--font-screen); line-height: 1.5; letter-spacing: -0.01em;`
  );

  // 5. Fine-tune pillar-heading for JetBrains Mono
  if (!content.includes('.pillar-heading {\r\n  font-family: var(--font-screen)') &&
      !content.includes('.pillar-heading {\n  font-family: var(--font-screen)')) {
    content = content.replace(
      /\.pillar-heading\s*\{/g,
      `.pillar-heading {${eol}  font-family: var(--font-screen);`
    );
  }

  // 6. Fine-tune pledge-quote-text for JetBrains Mono
  if (!content.includes('.pledge-quote-text {\r\n  font-family: var(--font-screen)') &&
      !content.includes('.pledge-quote-text {\n  font-family: var(--font-screen)')) {
    content = content.replace(
      /\.pledge-quote-text\s*\{/g,
      `.pledge-quote-text {${eol}  font-family: var(--font-screen);`
    );
  }

  // 7. Fine-tune pledge-actions-row buttons for JetBrains Mono
  if (!content.includes('.pledge-actions-row .btn')) {
    content += `${eol}${eol}/* Ensure screen CTAs use screen font */${eol}.pledge-actions-row .btn {${eol}  font-family: var(--font-screen);${eol}  letter-spacing: -0.01em;${eol}}${eol}`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateWhyCss('components/why-miracle-it/why-miracle-it.css');
if (fs.existsSync('miracle-it-career-academy/components/why-miracle-it/why-miracle-it.css')) {
  updateWhyCss('miracle-it-career-academy/components/why-miracle-it/why-miracle-it.css');
}

console.log('Update finished!');
