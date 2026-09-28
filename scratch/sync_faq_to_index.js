const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'index.html');
const faqCompPath = path.resolve(__dirname, '..', 'components', 'faq', 'faq.html');

let indexContent = fs.readFileSync(indexPath, 'utf8');
const faqContent = fs.readFileSync(faqCompPath, 'utf8');

const regex = /<div data-component="faq">[\s\S]*?<\/div>\s*(?=\s*<!-- 12\. Final Decision)/;

if (!regex.test(indexContent)) {
  console.error('Could not find data-component="faq" boundary in index.html');
  process.exit(1);
}

const replacement = `<div data-component="faq">\n${faqContent}\n    </div>`;
indexContent = indexContent.replace(regex, replacement);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Successfully synced components/faq/faq.html to index.html');
