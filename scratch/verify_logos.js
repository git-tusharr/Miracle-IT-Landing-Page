const fs = require('fs');

const files = [
  'assets/icons/companies/accenture.svg',
  'miracle-it-career-academy/assets/icons/companies/accenture.svg',
  'assets/icons/companies/wipro.svg',
  'miracle-it-career-academy/assets/icons/companies/wipro.svg'
];

let allPassed = true;

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`[FAIL] File missing: ${file}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<svg') || !content.includes('</svg>')) {
    console.error(`[FAIL] Invalid SVG markup in ${file}`);
    allPassed = false;
  }

  if (file.includes('accenture')) {
    const hasWhiteFill = content.includes('fill="#FFFFFF"') || content.includes('.st1{fill:#FFFFFF;}');
    const hasPurpleChevron = content.includes('#A100FF');
    if (!hasWhiteFill || !hasPurpleChevron) {
      console.error(`[FAIL] Accenture missing white text or purple chevron in ${file}`);
      allPassed = false;
    } else {
      console.log(`[PASS] Accenture logo verified in ${file} (White text + #A100FF chevron)`);
    }
  }

  if (file.includes('wipro')) {
    const hasWhiteText = content.includes('fill="#FFFFFF"') && (content.includes('style="fill:#FFFFFF;"') || content.includes('fill="#FFFFFF"'));
    const hasBrandDot0 = content.includes('.st0{fill:#2a4c87}');
    const hasDots = content.includes('class="st2"') && content.includes('class="st22"');
    if (!hasWhiteText || !hasBrandDot0 || !hasDots) {
      console.error(`[FAIL] Wipro missing white text or official dot spectrum in ${file}`);
      allPassed = false;
    } else {
      console.log(`[PASS] Wipro logo verified in ${file} (White wordmark + vibrant brand dot spectrum)`);
    }
  }
});

if (allPassed) {
  console.log('\n>>> ALL ACCENTURE AND WIPRO LOGO VALIDATIONS PASSED! <<<');
} else {
  process.exit(1);
}
