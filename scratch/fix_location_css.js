const fs = require('fs');
let css = fs.readFileSync('components/location/location.css', 'utf8');

if (css.includes('#location.location-section::after')) {
  css = css.replace(
    /\/\* Smooth gradient seam transitioning from dark location section into bright FAQ section \*\/[\s\S]*?z-index:\s*4;\s*\}/,
    '/* Seamless architectural section transition (Zero blur, crisp vector flow) */\n#location.location-section::after,\n.location-section::after {\n  display: none !important;\n}'
  );
  fs.writeFileSync('components/location/location.css', css, 'utf8');
  console.log('Successfully updated location.css');
} else {
  console.log('Target not found in location.css');
}
