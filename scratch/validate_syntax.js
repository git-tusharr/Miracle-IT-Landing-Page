const fs = require('fs');
const path = require('path');
const vm = require('vm');

function checkJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      checkJsFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.includes('.min.js')) {
      try {
        const code = fs.readFileSync(fullPath, 'utf8');
        new vm.Script(code);
        console.log(`[SYNTAX OK] ${fullPath}`);
      } catch (err) {
        console.error(`[SYNTAX ERROR] ${fullPath}:`, err.message);
      }
    }
  }
}

checkJsFiles('components');
checkJsFiles('js');
