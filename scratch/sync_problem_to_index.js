const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'index.html');
const problemCompPath = path.resolve(__dirname, '..', 'components', 'problem', 'problem.html');

let indexContent = fs.readFileSync(indexPath, 'utf8');
const problemContent = fs.readFileSync(problemCompPath, 'utf8');

const regex = /<div data-component="problem">[\s\S]*?<\/div>\s*(?=\s*<!-- 4\. Career Courses Section -->)/;

if (!regex.test(indexContent)) {
  console.error('Could not find data-component="problem" boundary in index.html');
  process.exit(1);
}

const replacement = `<div data-component="problem">\n${problemContent}\n    </div>`;
indexContent = indexContent.replace(regex, replacement);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Successfully synced components/problem/problem.html to index.html');
