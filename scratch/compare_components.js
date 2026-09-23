const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const components = [
  'header',
  // 'hero', // Note hero has slider placed right after it
  'problem',
  'courses',
  'why-miracle-it',
  'learning-experience',
  'who-can-join',
  'counselling-process',
  // 'proof', // Proof had slider removed
  'location',
  'faq',
  'final-cta',
  'footer',
  'mobile-sticky-cta'
];

for (const comp of components) {
  const startTag = `<div data-component="${comp}">`;
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) {
    console.log(`Comp ${comp} not found`);
    continue;
  }
  
  // Find where this component's div closes
  // It closes before the next component or before <!-- Next Section --> or next <div data-component=...
  // In index.html, each component div contains the component HTML and ends with </div>
  const compFile = `components/${comp}/${comp}.html`;
  if (!fs.existsSync(compFile)) {
    console.log(`Comp file ${compFile} does not exist`);
    continue;
  }
  const fileContent = fs.readFileSync(compFile, 'utf8').trim();
  
  // Let's see if the fileContent matches what's inside
  const innerStart = startIdx + startTag.length;
  // Let's find the closing tag for this div
  // In index.html, before the next section comment or div data-component, there is a </div>
  // Let's search forward for the next component or comment
  console.log(`Checking ${comp}: file length=${fileContent.length}`);
}
