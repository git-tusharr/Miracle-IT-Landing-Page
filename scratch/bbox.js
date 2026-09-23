const fs = require('fs');
const content = fs.readFileSync('scratch/wipro_wiki.svg', 'utf8');

// Parse all path coordinates
const allD = [...content.matchAll(/d="([^"]+)"/g)].map(m => m[1]);

let overallMinX = Infinity, overallMaxX = -Infinity;
let overallMinY = Infinity, overallMaxY = -Infinity;

let textMinX = Infinity, textMaxX = -Infinity;
let textMinY = Infinity, textMaxY = -Infinity;

// path1163 is the last path
const textD = allD[allD.length - 1];

function getBBoxFromD(d) {
  // Extract all numbers
  // Matches coordinate pairs like M 100 200, c dx dy dx dy dx dy etc.
  // We can do a quick tokenization of SVG path
  let x = 0, y = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  // replace commands with space + command + space
  const tokens = d.replace(/([a-df-z])/gi, ' $1 ').trim().split(/[\s,]+/);
  let cmd = '';
  let i = 0;
  
  function update(curX, curY) {
    if (curX < minX) minX = curX;
    if (curX > maxX) maxX = curX;
    if (curY < minY) minY = curY;
    if (curY > maxY) maxY = curY;
  }
  
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-df-z]$/i.test(t)) {
      cmd = t;
      i++;
      continue;
    }
    
    // arguments
    if (cmd === 'M') {
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      update(x, y);
      cmd = 'L';
    } else if (cmd === 'm') {
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      update(x, y);
      cmd = 'l';
    } else if (cmd === 'L') {
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'l') {
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'H') {
      x = parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'h') {
      x += parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'V') {
      y = parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'v') {
      y += parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'C') {
      update(parseFloat(tokens[i++]), parseFloat(tokens[i++]));
      update(parseFloat(tokens[i++]), parseFloat(tokens[i++]));
      x = parseFloat(tokens[i++]);
      y = parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'c') {
      update(x + parseFloat(tokens[i++]), y + parseFloat(tokens[i++]));
      update(x + parseFloat(tokens[i++]), y + parseFloat(tokens[i++]));
      x += parseFloat(tokens[i++]);
      y += parseFloat(tokens[i++]);
      update(x, y);
    } else if (cmd === 'S' || cmd === 's') {
      const isRel = cmd === 's';
      const x1 = isRel ? x + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      const y1 = isRel ? y + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      x = isRel ? x + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      y = isRel ? y + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      update(x1, y1); update(x, y);
    } else if (cmd === 'Q' || cmd === 'q') {
      const isRel = cmd === 'q';
      const x1 = isRel ? x + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      const y1 = isRel ? y + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      x = isRel ? x + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      y = isRel ? y + parseFloat(tokens[i++]) : parseFloat(tokens[i++]);
      update(x1, y1); update(x, y);
    } else if (cmd === 'Z' || cmd === 'z') {
      // close
      i++;
    } else {
      i++;
    }
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

const textBBox = getBBoxFromD(textD);
console.log('Text bbox:', textBBox);

allD.forEach((d, idx) => {
  const bb = getBBoxFromD(d);
  if (bb.minX < overallMinX) overallMinX = bb.minX;
  if (bb.maxX > overallMaxX) overallMaxX = bb.maxX;
  if (bb.minY < overallMinY) overallMinY = bb.minY;
  if (bb.maxY > overallMaxY) overallMaxY = bb.maxY;
});

console.log('Overall bbox:', {
  overallMinX, overallMaxX, overallMinY, overallMaxY,
  width: overallMaxX - overallMinX,
  height: overallMaxY - overallMinY
});
