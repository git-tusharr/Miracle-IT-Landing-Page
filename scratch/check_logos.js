const fs = require('fs');

const files = ['google.svg', 'meta.svg', 'nvidia.svg', 'wipro.svg', 'infosys.svg', 'accenture.svg', 'capgemini.svg', 'hcl.svg', 'deloitte.svg', 'tcs.svg', 'uline.svg'];

files.forEach(f => {
  const c = fs.readFileSync('assets/icons/companies/' + f, 'utf8');
  console.log('=== ' + f + ' ===');
  const fills = c.match(/fill=["'][^"']+["']/g) || [];
  const styles = c.match(/fill\s*:\s*[^;}"']+/g) || [];
  console.log('Fills:', [...new Set([...fills, ...styles])].slice(0, 10));
});
