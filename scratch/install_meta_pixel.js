const fs = require('fs');
const path = require('path');

const pixelSnippet = `  <!-- Meta Pixel Code (Replace YOUR_PIXEL_ID with your actual Meta Pixel ID) -->
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
    alt="Meta Pixel" /></noscript>
  <!-- End Meta Pixel Code -->`;

const pages = [
  'full-stack-course-bhopal/index.html',
  'data-analytics-course-bhopal/index.html',
  'ai-ml-course-bhopal/index.html',
  'cybersecurity-course-bhopal/index.html',
  'cloud-devops-course-bhopal/index.html',
  'visit-bhopal/index.html',
  'thank-you/index.html'
];

let updatedCount = 0;

pages.forEach(relPath => {
  const filePath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Prevent duplicate insertion
  if (html.includes('connect.facebook.net/en_US/fbevents.js')) {
    console.log(`[Already Present] Meta Pixel in ${relPath}`);
    return;
  }

  // Insert right after End Google Tag Manager
  if (html.includes('<!-- End Google Tag Manager -->')) {
    html = html.replace('<!-- End Google Tag Manager -->', `<!-- End Google Tag Manager -->\n\n${pixelSnippet}`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[Updated] Meta Pixel added to ${relPath}`);
    updatedCount++;
  } else if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n\n${pixelSnippet}`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[Updated] Meta Pixel added to ${relPath}`);
    updatedCount++;
  }
});

console.log(`Finished: ${updatedCount} subpages updated with Meta Pixel.`);
