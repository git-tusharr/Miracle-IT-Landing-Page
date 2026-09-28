const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'full-stack-course-bhopal/index.html',
  'data-analytics-course-bhopal/index.html',
  'ai-ml-course-bhopal/index.html',
  'cybersecurity-course-bhopal/index.html',
  'cloud-devops-course-bhopal/index.html',
  'visit-bhopal/index.html',
  'thank-you/index.html'
];

pages.forEach(p => {
  const fullPath = path.resolve(__dirname, '..', p);
  if (fs.existsSync(fullPath)) {
    const html = fs.readFileSync(fullPath, 'utf8');
    const hasHead = html.includes('<head');
    const hasBody = html.includes('<body');
    console.log(p, { exists: true, hasHead, hasBody });
  } else {
    console.log(p, { exists: false });
  }
});
