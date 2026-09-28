const fs = require('fs');
const path = require('path');

const companiesDir = path.join(__dirname, '../assets/icons/companies');

// 1. Accenture
let acc = fs.readFileSync(path.join(companiesDir, 'accenture.svg'), 'utf8');
acc = acc.replace(/\.st1\{fill:#FFFFFF;\}/g, '.st1{fill:#000000;}');
acc = acc.replace(/fill="#FFFFFF"/g, 'fill="#000000"');
fs.writeFileSync(path.join(companiesDir, 'accenture.svg'), acc, 'utf8');
console.log('Fixed accenture.svg');

// 2. Meta
let meta = fs.readFileSync(path.join(companiesDir, 'meta.svg'), 'utf8');
meta = meta.replace(/<path id="Text" style="fill:#FFFFFF"/g, '<path id="Text" style="fill:#000000"');
fs.writeFileSync(path.join(companiesDir, 'meta.svg'), meta, 'utf8');
console.log('Fixed meta.svg');

// 3. Wipro
let wipro = fs.readFileSync(path.join(companiesDir, 'wipro.svg'), 'utf8');
wipro = wipro.replace(/style="fill:#FFFFFF;" fill="#FFFFFF"/g, 'style="fill:#1f3d70;" fill="#1f3d70"');
fs.writeFileSync(path.join(companiesDir, 'wipro.svg'), wipro, 'utf8');
console.log('Fixed wipro.svg');

// 4. Capgemini
let cap = fs.readFileSync(path.join(companiesDir, 'capgemini.svg'), 'utf8');
cap = cap.replace(/fill:#FFFFFF;/g, 'fill:#001b3a;');
fs.writeFileSync(path.join(companiesDir, 'capgemini.svg'), cap, 'utf8');
console.log('Fixed capgemini.svg');

// 5. Deloitte
let deloitte = fs.readFileSync(path.join(companiesDir, 'deloitte.svg'), 'utf8');
deloitte = deloitte.replace(/style="fill:#FFFFFF"/g, 'style="fill:#000000"');
fs.writeFileSync(path.join(companiesDir, 'deloitte.svg'), deloitte, 'utf8');
console.log('Fixed deloitte.svg');

// 6. Uline
let uline = fs.readFileSync(path.join(companiesDir, 'uline.svg'), 'utf8');
uline = uline.replace(/\.st0\{fill:#FFFFFF;\}/g, '.st0{fill:#002b66;}');
uline = uline.replace(/fill="#FFFFFF"/g, 'fill="#002b66"');
fs.writeFileSync(path.join(companiesDir, 'uline.svg'), uline, 'utf8');
console.log('Fixed uline.svg');

console.log('All 6 logos fixed successfully!');
