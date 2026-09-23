const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add data-theme="obsidian" to #placed-students
html = html.replace(
  '<section class="placed-students-section" id="placed-students" aria-label="Verified Placed Students Showcase">',
  '<section class="placed-students-section" id="placed-students" data-theme="obsidian" aria-label="Verified Placed Students Showcase">'
);

// 2. Update who-can-join CTA button in index.html
const oldWhoBtn = `<a href="#counselling-form" class="btn btn-primary btn-lg btn-magnetic"
                data-track-cta="who_discuss_counsellor">
                Discuss Your Career With A Counsellor
              </a>`;

const newWhoBtn = `<a href="#counselling-form" class="btn btn-primary btn-lg who-cta-btn btn-magnetic"
                data-track-cta="who_discuss_counsellor">
                <span>Discuss Your Career With A Counsellor</span>
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>`;

if (html.includes('data-track-cta="who_discuss_counsellor"')) {
  html = html.replace(/<a href="#counselling-form" class="btn btn-primary btn-lg btn-magnetic"\s+data-track-cta="who_discuss_counsellor">\s*Discuss Your Career With A Counsellor\s*<\/a>/, newWhoBtn);
  console.log('Updated who-can-join CTA button in index.html.');
}

// 3. Move counselling-form anchor in final-cta inside index.html
const oldFinalAnchor = '<div id="counselling-form" style="position:relative; top:-90px; visibility:hidden;" aria-hidden="true"></div>';
const newFinalAnchor = '<div id="counselling-form" style="position:relative; top:-30px; visibility:hidden;" aria-hidden="true"></div>';

if (html.includes(oldFinalAnchor)) {
  html = html.replace(oldFinalAnchor, '');
  // Insert before the form wrapper
  html = html.replace(
    '<!-- Booking Form Container with Glowing Border Beam -->',
    '<!-- Smooth anchor target for in-page Book Visit & Counselling buttons -->\r\n    ' + newFinalAnchor + '\r\n\r\n    <!-- Booking Form Container with Glowing Border Beam -->'
  );
  console.log('Moved counselling-form anchor in final-cta inside index.html.');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully updated!');
