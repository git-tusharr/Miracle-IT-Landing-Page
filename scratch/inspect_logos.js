const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../assets/icons/companies');
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.svg')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log(`=== ${f} ===`);
    const fills = [...content.matchAll(/fill="([^"]+)"/g)].map(m => m[1]);
    const strokes = [...content.matchAll(/stroke="([^"]+)"/g)].map(m => m[1]);
    const colors = [...content.matchAll(/#([0-9a-fA-F]{3,6})/g)].map(m => m[0]);
    console.log('fills:', Array.from(new Set(fills)));
    console.log('strokes:', Array.from(new Set(strokes)));
    console.log('hex colors:', Array.from(new Set(colors)));
    if (content.length < 500) {
      console.log('Content:', content);
    }
  }
});
