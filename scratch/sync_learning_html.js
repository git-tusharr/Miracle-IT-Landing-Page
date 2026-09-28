const fs = require('fs');
const path = require('path');

const compHtml = fs.readFileSync(path.resolve(__dirname, '../components/learning-experience/learning-experience.html'), 'utf8');

// Extract the track content
const trackMatch = compHtml.match(/<div class="learning-carousel-track">([\s\S]*?)<\/div>\s*<\/div>\s*<!-- Carousel Navigation/);
if (!trackMatch) {
  console.error('Could not match track in component HTML');
  process.exit(1);
}
const newTrackContent = trackMatch[1].trim();

let indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const indexTrackRegex = /(<div class="learning-carousel-track">)[\s\S]*?(<\/div>\s*<\/div>\s*<!-- Carousel Navigation)/;

if (!indexTrackRegex.test(indexHtml)) {
  console.error('Could not match track in index.html');
  process.exit(1);
}

indexHtml = indexHtml.replace(indexTrackRegex, `$1\n${newTrackContent}\n              $2`);
fs.writeFileSync(path.resolve(__dirname, '../index.html'), indexHtml, 'utf8');
console.log('Successfully synced streamlined learning-experience cards into index.html');
