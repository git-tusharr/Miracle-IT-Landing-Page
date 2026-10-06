const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const ALIASES = {
  '/meta/aiml': '/MetaAds/aiml-landing/',
  '/meta/aiml/': '/MetaAds/aiml-landing/',
  '/meta/data-analytics': '/MetaAds/data-analytics-landing/',
  '/meta/data-analytics/': '/MetaAds/data-analytics-landing/',
  '/meta/data-science': '/MetaAds/data-science-landing/',
  '/meta/data-science/': '/MetaAds/data-science-landing/',
  '/meta/fullstack': '/MetaAds/fullstack-landing/',
  '/meta/fullstack/': '/MetaAds/fullstack-landing/',
  '/meta/full-stack': '/MetaAds/fullstack-landing/',
  '/meta/full-stack/': '/MetaAds/fullstack-landing/',
  '/MetaAds/aiml': '/MetaAds/aiml-landing/',
  '/MetaAds/aiml/': '/MetaAds/aiml-landing/',
  '/MetaAds/data-analytics': '/MetaAds/data-analytics-landing/',
  '/MetaAds/data-analytics/': '/MetaAds/data-analytics-landing/',
  '/MetaAds/data-science': '/MetaAds/data-science-landing/',
  '/MetaAds/data-science/': '/MetaAds/data-science-landing/',
  '/MetaAds/fullstack': '/MetaAds/fullstack-landing/',
  '/MetaAds/fullstack/': '/MetaAds/fullstack-landing/',
  '/MetaAds/full-stack': '/MetaAds/fullstack-landing/',
  '/meta-ads/aiml': '/MetaAds/aiml-landing/',
  '/meta-ads/aiml/': '/MetaAds/aiml-landing/',
  '/meta-ads/data-analytics': '/MetaAds/data-analytics-landing/',
  '/meta-ads/data-analytics/': '/MetaAds/data-analytics-landing/',
  '/meta-ads/data-science': '/MetaAds/data-science-landing/',
  '/meta-ads/data-science/': '/MetaAds/data-science-landing/',
  '/meta-ads/fullstack': '/MetaAds/fullstack-landing/',
  '/meta-ads/fullstack/': '/MetaAds/fullstack-landing/',
  '/meta-ads/full-stack': '/MetaAds/fullstack-landing/',
  '/meta-ads/full-stack/': '/MetaAds/fullstack-landing/',
  '/MetaAds/miracle-it-fullstack-landing': '/MetaAds/fullstack-landing/',
  '/MetaAds/miracle-it-fullstack-landing/': '/MetaAds/fullstack-landing/'
};

const server = http.createServer((req, res) => {
  const [pathnameRaw, queryString] = req.url.split('?');
  const querySuffix = queryString ? `?${queryString}` : '';

  let safePath = pathnameRaw.split('#')[0];
  try {
    safePath = decodeURIComponent(safePath);
  } catch (e) {}

  // Check alias routes
  const normalizedPath = safePath.replace(/\/+$/, '') || '/';
  if (ALIASES[safePath] || ALIASES[normalizedPath]) {
    const target = ALIASES[safePath] || ALIASES[normalizedPath];
    res.writeHead(302, { 'Location': `${target}${querySuffix}` });
    res.end();
    return;
  }

  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  // Prevent directory traversal
  const resolvedPath = path.join(ROOT, safePath);
  if (!resolvedPath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${safePath}`);
      return;
    }

    // Auto-redirect directory requests to trailing slash so relative assets resolve properly
    if (stats.isDirectory()) {
      if (!pathnameRaw.endsWith('/')) {
        res.writeHead(301, { 'Location': `${pathnameRaw}/${querySuffix}` });
        res.end();
        return;
      }
    }

    let filePath = resolvedPath;
    if (stats.isDirectory()) {
      filePath = path.join(resolvedPath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(` Miracle IT Career Academy — Local Server Running!`);
  console.log(` URL: ${url}`);
  console.log(`------------------------------------------------------`);
  console.log(` Meta Ads Hub:               ${url}/MetaAds/`);
  console.log(` 1. AI & Machine Learning:   ${url}/MetaAds/aiml-landing/`);
  console.log(` 2. Data Analytics:          ${url}/MetaAds/data-analytics-landing/`);
  console.log(` 3. Data Science:            ${url}/MetaAds/data-science-landing/`);
  console.log(` 4. Full Stack Development:  ${url}/MetaAds/fullstack-landing/`);
  console.log(`======================================================\n`);

  // Automatically open default browser on Windows unless NO_BROWSER_OPEN is set
  if (!process.env.NO_BROWSER_OPEN) {
    exec(`start ${url}`);
  }
});
