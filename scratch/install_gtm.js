const fs = require('fs');
const path = require('path');

const gtmId = 'GTM-XXXXXXXX';

const gtmScript = `  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${gtmId}');</script>
  <!-- End Google Tag Manager -->`;

const gtmNoscript = `  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;

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

let modifiedCount = 0;

pages.forEach(relPath => {
  const filePath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`[Skipped] ${relPath} not found`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Prevent duplicate insertion
  if (html.includes('googletagmanager.com/gtm.js')) {
    console.log(`[Already Present] GTM in ${relPath}`);
    return;
  }

  // 1. Insert GTM script right after <head> or <meta name="viewport" ...>
  if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n${gtmScript}`);
  } else if (html.includes('<head ')) {
    html = html.replace(/(<head[^>]*>)/i, `$1\n${gtmScript}`);
  } else {
    console.error(`No <head> tag in ${relPath}`);
    return;
  }

  // 2. Insert GTM noscript immediately after opening <body...>
  if (html.includes('<body>')) {
    html = html.replace('<body>', `<body>\n${gtmNoscript}`);
  } else if (html.includes('<body ')) {
    html = html.replace(/(<body[^>]*>)/i, `$1\n${gtmNoscript}`);
  } else {
    console.error(`No <body> tag in ${relPath}`);
    return;
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[Updated] GTM tags added to ${relPath}`);
  modifiedCount++;
});

console.log(`Successfully added GTM to ${modifiedCount} pages.`);
