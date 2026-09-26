const fs = require('fs');
const css = fs.readFileSync('components/location/location.css', 'utf8');

let brace = 0;
let inComment = false;
let inString = false;
let stringChar = '';

for (let i = 0; i < css.length; i++) {
  const c = css[i];
  const next = css[i+1];
  
  if (!inComment && !inString && c === '/' && next === '*') {
    inComment = true;
    i++;
    continue;
  }
  if (inComment && c === '*' && next === '/') {
    inComment = false;
    i++;
    continue;
  }
  if (inComment) continue;

  if (!inString && (c === '"' || c === "'")) {
    inString = true;
    stringChar = c;
    continue;
  }
  if (inString && c === stringChar && css[i-1] !== '\\') {
    inString = false;
    continue;
  }
  if (inString) continue;

  if (c === '{') brace++;
  if (c === '}') {
    brace--;
    if (brace < 0) {
      console.log('Negative brace at index', i, JSON.stringify(css.substring(i-40, i+40)));
      break;
    }
  }
}
console.log('Final brace balance:', brace);
