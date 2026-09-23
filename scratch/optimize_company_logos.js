const fs = require('fs');

// 1. Deloitte: Make text white, green dot stays #86bc24
let deloitte = fs.readFileSync('assets/icons/companies/deloitte.svg', 'utf8');
deloitte = deloitte.replace(/fill:#0f0b0b/g, 'fill:#FFFFFF');
fs.writeFileSync('assets/icons/companies/deloitte.svg', deloitte);
console.log('Updated deloitte.svg to dark-mode white text');

// 2. Meta: Make text white, gradient symbol stays
let meta = fs.readFileSync('assets/icons/companies/meta.svg', 'utf8');
meta = meta.replace(/fill:#192830/g, 'fill:#FFFFFF');
if (!meta.includes('viewBox')) {
  meta = meta.replace('<svg ', '<svg viewBox="0 0 948 191" ');
}
fs.writeFileSync('assets/icons/companies/meta.svg', meta);
console.log('Updated meta.svg to dark-mode white text with viewBox');

// 3. Accenture: Check paths and colors
let acc = fs.readFileSync('assets/icons/companies/accenture.svg', 'utf8');
if (!acc.includes('fill="#FFFFFF"') && !acc.includes('fill:#FFFFFF')) {
  // Replace fill="#000000" or black paths with white, keeping #A100FF for chevron
  acc = acc.replace(/fill="#000000"/g, 'fill="#FFFFFF"');
  acc = acc.replace(/fill="#231F20"/g, 'fill="#FFFFFF"');
  acc = acc.replace(/fill:#231f20/g, 'fill:#FFFFFF');
  // If path has no fill, style it
  acc = acc.replace('<svg ', '<svg fill="#FFFFFF" ');
}
fs.writeFileSync('assets/icons/companies/accenture.svg', acc);
console.log('Updated accenture.svg to dark-mode white text');

// 4. NVIDIA: Set NVIDIA brand green #76B900 and white
let nvd = fs.readFileSync('assets/icons/companies/nvidia.svg', 'utf8');
if (!nvd.includes('fill=')) {
  nvd = nvd.replace('<svg ', '<svg fill="#76B900" ');
}
fs.writeFileSync('assets/icons/companies/nvidia.svg', nvd);
console.log('Updated nvidia.svg with NVIDIA green fill');

// 5. Uline: Clean up background rect and make text white
let uline = fs.readFileSync('assets/icons/companies/uline.svg', 'utf8');
uline = uline.replace(/<rect[^>]+fill="#ffffff"[^>]*>/i, '');
uline = uline.replace(/fill:#003366/g, 'fill:#FFFFFF');
uline = uline.replace(/fill="#003366"/g, 'fill="#FFFFFF"');
fs.writeFileSync('assets/icons/companies/uline.svg', uline);
console.log('Updated uline.svg to transparent dark-mode white');

// 6. Wipro: Make sure viewBox is present
let wipro = fs.readFileSync('assets/icons/companies/wipro.svg', 'utf8');
if (!wipro.includes('viewBox')) {
  wipro = wipro.replace('<svg ', '<svg viewBox="0 0 376.8 296.5" ');
}
// In wipro, text is dark blue #2a4c87; on dark background, make the wipro text readable
wipro = wipro.replace(/\.st0\{fill:#2a4c87\}/, '.st0{fill:#FFFFFF}');
fs.writeFileSync('assets/icons/companies/wipro.svg', wipro);
console.log('Updated wipro.svg with viewBox and white text');

// 7. Capgemini: Make text readable on dark background
let cap = fs.readFileSync('assets/icons/companies/capgemini.svg', 'utf8');
// Spade is #12abdb (bright cyan-blue), text is #0070ad
cap = cap.replace(/fill:#0070ad/g, 'fill:#FFFFFF');
fs.writeFileSync('assets/icons/companies/capgemini.svg', cap);
console.log('Updated capgemini.svg with white text');

// 8. HCL: Make sure it has viewBox and bright blue/white text
let hcl = fs.readFileSync('assets/icons/companies/hcl.svg', 'utf8');
hcl = hcl.replace(/fill="#006cb7"/g, 'fill="#0082D5"');
fs.writeFileSync('assets/icons/companies/hcl.svg', hcl);
console.log('Updated hcl.svg');

// 9. TCS: Check text
let tcs = fs.readFileSync('assets/icons/companies/tcs.svg', 'utf8');
// Tata letters are #007DC5; on dark background #38BDF8 or #FFFFFF looks ultra crisp
tcs = tcs.replace(/fill="#007DC5"/g, 'fill="#FFFFFF"');
fs.writeFileSync('assets/icons/companies/tcs.svg', tcs);
console.log('Updated tcs.svg with crisp white Tata lettering and colored ribbon');
