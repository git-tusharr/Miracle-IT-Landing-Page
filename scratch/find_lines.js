const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split(/\r?\n/);

function findLine(str, startFrom = 0) {
  for (let i = startFrom; i < lines.length; i++) {
    if (lines[i].includes(str)) return i + 1;
  }
  return -1;
}

console.log('Hero close div:', findLine('<!-- 3. Problem / Career Confusion Section -->') - 1);
console.log('Placed slider start in proof:', findLine('PLACED STUDENTS FLOATING KINETIC SLIDER'));
console.log('Marquee start in proof (after slider):', findLine('Dual-Track Infinite Kinetic Marquee'));
console.log('Location start:', findLine('<div data-component="location">'));
console.log('Location end / FAQ start:', findLine('<div data-component="faq">'));
console.log('FAQ end / Final CTA start:', findLine('<div data-component="final-cta">'));
console.log('Final CTA end / Footer start:', findLine('<div data-component="footer">'));
