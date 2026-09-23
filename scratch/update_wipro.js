const fs = require('fs');

let svg = fs.readFileSync('scratch/wipro_wiki.svg', 'utf8');

// Ensure st0 is #2a4c87
svg = svg.replace('.st0{fill:#FFFFFF}', '.st0{fill:#2a4c87}');

// Update path1163 to have fill:#FFFFFF
svg = svg.replace('style="fill:#351a55"', 'style="fill:#FFFFFF;" fill="#FFFFFF"');

// Ensure viewBox is present
if (!svg.includes('viewBox=')) {
  svg = svg.replace('<svg ', '<svg viewBox="0 0 376.8 296.5" ');
}

fs.writeFileSync('assets/icons/companies/wipro.svg', svg);
fs.writeFileSync('miracle-it-career-academy/assets/icons/companies/wipro.svg', svg);

console.log('Successfully written wipro.svg in both places');
