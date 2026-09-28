const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const whyHtml = fs.readFileSync('components/why-miracle-it/why-miracle-it.html', 'utf8');

const regex = /<div data-component="why-miracle-it">[\s\S]*?<\/div>(\s*<!-- 6\.)/;
if (!regex.test(indexHtml)) {
  console.error('Regex did not match!');
  process.exit(1);
}

const replacement = '<div data-component="why-miracle-it">\n' + whyHtml.trim() + '\n    </div>$1';
let updatedHtml = indexHtml.replace(regex, replacement);
updatedHtml = updatedHtml.replace(
  './components/why-miracle-it/why-miracle-it.css?v=5.5',
  './components/why-miracle-it/why-miracle-it.css?v=7.0'
);

fs.writeFileSync('index.html', updatedHtml, 'utf8');
console.log('Successfully synced why-miracle-it into index.html');
