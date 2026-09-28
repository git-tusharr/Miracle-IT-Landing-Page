const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const heroHtml = fs.readFileSync('components/hero/hero.html', 'utf8');

const regex = /<div data-component="hero">[\s\S]*?<\/div>(\s*<!-- 2\.5)/;
if (!regex.test(indexHtml)) {
  console.error('Regex did not match hero component in index.html!');
  process.exit(1);
}

const replacement = '<div data-component="hero">\n' + heroHtml.trim() + '\n    </div>$1';
let updatedHtml = indexHtml.replace(regex, replacement);

fs.writeFileSync('index.html', updatedHtml, 'utf8');
console.log('Successfully synced hero into index.html');
