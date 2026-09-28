const fs = require('fs');

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf-8');

html = html.replace(
  '<section class="section section-light problem-section" id="problem" data-theme="light">',
  '<section class="section problem-section" id="problem" data-theme="midnight-slate">'
);

html = html.replace(
  '<section class="section section-light why-section" id="why-miracle-it" data-theme="light">',
  '<section class="section why-section" id="why-miracle-it" data-theme="space-slate">'
);

html = html.replace(
  '<section class="section section-light who-join-section" id="who-can-join" data-theme="light">',
  '<section class="section who-join-section" id="who-can-join" data-theme="deep-navy">'
);

html = html.replace(
  '<section class="section section-light proof-section" id="proof" data-theme="light">',
  '<section class="section proof-section" id="proof" data-theme="elevated-slate">'
);

html = html.replace(
  '<section class="section section-light faq-section" id="faq" data-theme="light">',
  '<section class="section faq-section" id="faq" data-theme="midnight-slate">'
);

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('Successfully updated index.html section classes');
