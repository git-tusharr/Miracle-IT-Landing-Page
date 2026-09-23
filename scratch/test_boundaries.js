const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const components = [
  'header',
  'problem',
  'courses',
  'learning-experience',
  'location',
  'faq',
  'final-cta'
];

for (const comp of components) {
  const startTag = `<div data-component="${comp}">`;
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) {
    console.log(`Comp ${comp} not found`);
    continue;
  }
  
  // Find where next section comment starts
  // Or let's see how the div ends
  const nextSectionCommentMatch = html.substring(startIdx).match(/\r?\n\s*<!-- \d+\.|\r?\n\s*<\/main>|\r?\n\s*<!-- Mobile Sticky|\r?\n\s*<!-- =======/);
  if (!nextSectionCommentMatch) {
    console.log(`Could not find next comment after ${comp}`);
    continue;
  }
  
  const relEnd = nextSectionCommentMatch.index;
  const chunkWithDiv = html.substring(startIdx, startIdx + relEnd);
  const lastDivIdx = chunkWithDiv.lastIndexOf('</div>');
  console.log(`Comp ${comp}: from ${startIdx} to ${startIdx + lastDivIdx + 6} (length ${lastDivIdx + 6})`);
}
