const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const components = [
  'header',
  'hero',
  'problem',
  'courses',
  'why-miracle-it',
  'learning-experience',
  'who-can-join',
  'counselling-process',
  'proof',
  'location',
  'faq',
  'final-cta',
  'footer',
  'mobile-sticky-cta'
];

for (let i = 0; i < components.length; i++) {
  const comp = components[i];
  const startStr = `<div data-component="${comp}">`;
  const startIdx = html.indexOf(startStr);
  const nextStartIdx = i < components.length - 1 ? html.indexOf(`<div data-component="${components[i+1]}">`) : html.indexOf('</body>');
  
  const chunk = html.substring(startIdx, nextStartIdx);
  // find last </div> in chunk
  const lastDiv = chunk.lastIndexOf('</div>');
  console.log(`Comp ${comp}: chunk length=${chunk.length}, last </div> offset=${lastDiv}, remainder after last </div>=${JSON.stringify(chunk.substring(lastDiv + 6).trim())}`);
}
