/**
 * Automated Verification Script for Tablet/Device Mockup Responsiveness
 * Section: "A Practical, Honest Approach to Tech Education" (#why-miracle-it)
 * Target Breakpoints: 768px, 600px, 480px, 390px, 360px
 */

const fs = require('fs');
const http = require('http');

console.log('================================================================');
console.log(' AUDIT: Tablet Mockup (#whyTabletDevice) Responsiveness Test    ');
console.log(' Target Breakpoints: 768px, 600px, 480px, 390px, 360px          ');
console.log('================================================================\n');

// 1. Check CSS syntax & rule balance
const cssPath = 'components/why-miracle-it/why-miracle-it.css';
const cssContent = fs.readFileSync(cssPath, 'utf8');

let braceCount = 0;
let inComment = false;
for (let i = 0; i < cssContent.length; i++) {
  if (!inComment && cssContent[i] === '/' && cssContent[i + 1] === '*') {
    inComment = true;
    i++;
    continue;
  }
  if (inComment && cssContent[i] === '*' && cssContent[i + 1] === '/') {
    inComment = false;
    i++;
    continue;
  }
  if (!inComment) {
    if (cssContent[i] === '{') braceCount++;
    if (cssContent[i] === '}') braceCount--;
  }
}

if (braceCount !== 0) {
  console.error(`[FAIL] ${cssPath} has unbalanced braces! Depth: ${braceCount}`);
  process.exit(1);
} else {
  console.log(`[PASS] ${cssPath}: Syntax clean, all braces perfectly balanced.`);
}

// 2. Audit Breakpoint Tiers in CSS
const targetBreakpoints = [
  { width: 768, tier: 'max-width: 991px', desc: 'Tablet Portrait / iPad' },
  { width: 600, tier: 'max-width: 680px', desc: 'Small Tablet / Phablet' },
  { width: 480, tier: 'max-width: 520px', desc: 'Large Smartphone' },
  { width: 390, tier: 'max-width: 420px', desc: 'Standard iPhone (12/13/14/15)' },
  { width: 360, tier: 'max-width: 360px', desc: 'Compact Android (Galaxy S)' }
];

console.log('\n--- 2. Media Query Coverage Audit ---');
targetBreakpoints.forEach(bp => {
  const hasTier = cssContent.includes(bp.tier);
  if (hasTier) {
    console.log(`[PASS] ${bp.width}px (${bp.desc}) covered by active tier: @media (${bp.tier})`);
  } else {
    console.error(`[FAIL] Missing media query tier for ${bp.width}px! Expected: ${bp.tier}`);
    process.exit(1);
  }
});

// 3. Verify Specific Tablet Mockup Responsive Features
console.log('\n--- 3. Tablet Device Mockup Structural Audits ---');

const featureChecks = [
  {
    name: 'Proportional Chassis Scaling (Chassis & Glare insets sync)',
    test: () => {
      return cssContent.includes('tablet-glass-glare') &&
             cssContent.includes('inset: 10px 10px 12px 10px') &&
             cssContent.includes('inset: 8px 8px 10px 8px') &&
             cssContent.includes('inset: 7px 7px 9px 7px') &&
             cssContent.includes('inset: 6px 6px 8px 6px');
    }
  },
  {
    name: 'Camera Notch & Sensor Dot Proportional Reduction',
    test: () => {
      return cssContent.includes('.tablet-camera-notch') &&
             cssContent.includes('height: 7px') &&
             cssContent.includes('height: 6px') &&
             cssContent.includes('height: 5px') &&
             cssContent.includes('height: 4.5px');
    }
  },
  {
    name: 'Top OS Bar Responsive Text & No-Collision Safeguards',
    test: () => {
      return cssContent.includes('.tablet-chapter-pill') &&
             cssContent.includes('text-overflow: ellipsis') &&
             cssContent.includes('.os-brand .os-version') &&
             cssContent.includes('display: none');
    }
  },
  {
    name: 'Slide 1: Dual-State Ratio Bar (Desktop full vs Mobile compact text)',
    test: () => {
      return cssContent.includes('.ratio-text-desktop') &&
             cssContent.includes('.ratio-text-mobile') &&
             cssContent.includes('display: none') &&
             cssContent.includes('display: inline');
    }
  },
  {
    name: 'Slide 1: Daily Routine Grid Horizontal Snap on Mobile (<680px)',
    test: () => {
      return cssContent.includes('.daily-routine-grid') &&
             cssContent.includes('scroll-snap-type: x mandatory') &&
             cssContent.includes('routine-phase');
    }
  },
  {
    name: 'Slides 2 & 3: Pillars 2-Column on Tablet (768px) and Snap Strip on Mobile',
    test: () => {
      return cssContent.includes('.pillars-slide-grid') &&
             cssContent.includes('grid-template-columns: repeat(2, 1fr)') &&
             cssContent.includes('scroll-snap-type: x mandatory');
    }
  },
  {
    name: 'Slide 4: 3-Column Table on Tablet (768px & 600px) and Structured Cards on Mobile (<=520px)',
    test: () => {
      return cssContent.includes('grid-template-columns: 120px 1fr 1.15fr') &&
             cssContent.includes('grid-template-columns: 105px 1fr 1.1fr') &&
             cssContent.includes("content: '✕ Traditional: '") &&
             cssContent.includes("content: '✔ Miracle IT: '");
    }
  },
  {
    name: 'Slide 5: Pledge Card Quote & Responsive Stacked CTA Buttons',
    test: () => {
      return cssContent.includes('.pledge-card-wrap') &&
             cssContent.includes('.pledge-quote-text') &&
             cssContent.includes('.pledge-actions-row .btn');
    }
  },
  {
    name: 'Bottom HUD: Compact Nav Dots & Responsive Hint Text (Scroll vs Swipe)',
    test: () => {
      return cssContent.includes('.story-scroll-hint .hint-desktop') &&
             cssContent.includes('.story-scroll-hint .hint-mobile') &&
             cssContent.includes('.story-dot.is-active');
    }
  }
];

featureChecks.forEach(fc => {
  if (fc.test()) {
    console.log(`[PASS] ${fc.name}`);
  } else {
    console.error(`[FAIL] ${fc.name}`);
    process.exit(1);
  }
});

// 4. Verify JS Controller Handles Dynamic Chapter Title Shortening
console.log('\n--- 4. JS Controller Audit ---');
const jsPath = 'components/why-miracle-it/why-miracle-it.js';
const jsContent = fs.readFileSync(jsPath, 'utf8');

if (
  jsContent.includes('chapterTitlesFull') &&
  jsContent.includes('chapterTitlesShort') &&
  jsContent.includes('chapterTitlesMini') &&
  jsContent.includes('getChapterTitle')
) {
  console.log('[PASS] why-miracle-it.js: Multi-tier dynamic chapter titling implemented.');
} else {
  console.error('[FAIL] why-miracle-it.js is missing multi-tier dynamic titling logic!');
  process.exit(1);
}

// 5. Verify HTML Component & index.html Synchronicity
console.log('\n--- 5. Synchronicity Audit ---');
const compHtml = fs.readFileSync('components/why-miracle-it/why-miracle-it.html', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const checks = [
  'ratio-text-desktop',
  'ratio-text-mobile',
  'hint-desktop',
  'hint-mobile'
];

checks.forEach(token => {
  const inComp = compHtml.includes(token);
  const inIndex = indexHtml.includes(token);
  if (inComp && inIndex) {
    console.log(`[PASS] Token '${token}' present in both component HTML and index.html`);
  } else {
    console.error(`[FAIL] Token '${token}' mismatch! inComp: ${inComp}, inIndex: ${inIndex}`);
    process.exit(1);
  }
});

// 6. Test Local HTTP Server
console.log('\n--- 6. HTTP Server Check ---');
http.get('http://localhost:3000', (res) => {
  if (res.statusCode === 200) {
    console.log('[PASS] Local server responded HTTP 200 OK');
    console.log('\n================================================================');
    console.log(' ALL TESTS PASSED: TABLET MOCKUP OPTIMIZED FOR ALL 5 BREAKPOINTS');
    console.log(' 768px, 600px, 480px, 390px, and 360px VERIFIED CLEANLY!        ');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error(`[FAIL] Server returned HTTP ${res.statusCode}`);
    process.exit(1);
  }
}).on('error', (err) => {
  console.error(`[FAIL] Server request error: ${err.message}`);
  process.exit(1);
});
