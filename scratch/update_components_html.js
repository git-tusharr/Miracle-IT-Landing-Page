const fs = require('fs');
const path = require('path');

const mappings = [
  {
    file: 'components/problem/problem.html',
    from: '<section class="section section-light problem-section" id="problem" data-theme="light">',
    to: '<section class="section problem-section" id="problem" data-theme="midnight-slate">'
  },
  {
    file: 'components/why-miracle-it/why-miracle-it.html',
    from: '<section class="section section-light why-section" id="why-miracle-it" data-theme="light">',
    to: '<section class="section why-section" id="why-miracle-it" data-theme="space-slate">'
  },
  {
    file: 'components/who-can-join/who-can-join.html',
    from: '<section class="section section-light who-join-section" id="who-can-join" data-theme="light">',
    to: '<section class="section who-join-section" id="who-can-join" data-theme="deep-navy">'
  },
  {
    file: 'components/proof/proof.html',
    from: '<section class="section section-light proof-section" id="proof" data-theme="light">',
    to: '<section class="section proof-section" id="proof" data-theme="elevated-slate">'
  },
  {
    file: 'components/faq/faq.html',
    from: '<section class="section section-light faq-section" id="faq" data-theme="light">',
    to: '<section class="section faq-section" id="faq" data-theme="midnight-slate">'
  }
];

mappings.forEach(m => {
  if (fs.existsSync(m.file)) {
    let content = fs.readFileSync(m.file, 'utf-8');
    content = content.replace(m.from, m.to);
    fs.writeFileSync(m.file, content, 'utf-8');
    console.log('Updated', m.file);
  }
});
