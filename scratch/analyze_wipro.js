const fs = require('fs');
const content = fs.readFileSync('scratch/wipro_wiki.svg', 'utf8');

const pathRegex = /<path id="([^"]+)" d="([^"]+)"(?:\s+class="([^"]+)")?(?:\s+style="([^"]+)")?/g;
let match;
const paths = [];

while ((match = pathRegex.exec(content)) !== null) {
  paths.push({
    id: match[1],
    d: match[2],
    cls: match[3],
    style: match[4]
  });
}

console.log('Total paths found:', paths.length);
const textPath = paths.find(p => p.id === 'path1163');
console.log('Text path:', textPath.id, 'style:', textPath.style);

// Check dot paths vs text
console.log('Dots paths count:', paths.length - 1);
