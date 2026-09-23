const fs = require('fs');

console.log('--- FINE-TUNING BADGES, TAGS, AND EYEBROW LABELS ---');

// 1. Update SVG text in location.html and index.html
function fixSvgText(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("'Plus Jakarta Sans', sans-serif")) {
    content = content.replace(/'Plus Jakarta Sans', sans-serif/g, "'Inter', system-ui, sans-serif");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[UPDATED SVG TEXT] ${filePath}`);
  }
}

fixSvgText('components/location/location.html');
fixSvgText('index.html');
if (fs.existsSync('miracle-it-career-academy/components/location/location.html')) {
  fixSvgText('miracle-it-career-academy/components/location/location.html');
}
if (fs.existsSync('miracle-it-career-academy/index.html')) {
  fixSvgText('miracle-it-career-academy/index.html');
}

// 2. Fine-tune badge, tag, label styles across CSS files
function updateCssRules(filePath, rules) {
  if (!fs.existsSync(filePath)) return;
  let css = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  rules.forEach(({ selector, regex, replacement }) => {
    if (regex.test(css)) {
      css = css.replace(regex, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, css, 'utf8');
    console.log(`[UPDATED LABELS/TAGS] ${filePath}`);
  }
}

// Courses
const coursesRules = [
  {
    selector: '.course-duration-hint',
    regex: /\.course-duration-hint\s*\{[^}]*\}/s,
    replacement: `.course-duration-hint {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: #CBD5E1;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}`
  },
  {
    selector: '.tech-stack-title',
    regex: /\.tech-stack-title\s*\{[^}]*\}/s,
    replacement: `.tech-stack-title {
  display: block;
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-brand);
  margin-bottom: 0.5rem;
}`
  },
  {
    selector: '.key-areas-title',
    regex: /\.key-areas-title\s*\{[^}]*\}/s,
    replacement: `.key-areas-title {
  display: block;
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-cyan);
  margin-bottom: 0.65rem;
}`
  }
];

updateCssRules('components/courses/courses.css', coursesRules);
if (fs.existsSync('miracle-it-career-academy/components/courses/courses.css')) {
  updateCssRules('miracle-it-career-academy/components/courses/courses.css', coursesRules);
}

// Problem
const problemRules = [
  {
    selector: '.matcher-chip',
    regex: /\.matcher-chip\s*\{([^}]*?)font-family:\s*var\(--font-sans\);([^}]*?)\}/s,
    replacement: (m) => {
      return m.replace(/letter-spacing:\s*[^;]+;/, 'letter-spacing: 0.03em;')
              .replace(/font-weight:\s*[^;]+;/, 'font-weight: 600;');
    }
  },
  {
    selector: '.dilemma-status-tag',
    regex: /\.dilemma-status-tag\s*\{([^}]*?)font-family:\s*var\(--font-sans\);([^}]*?)\}/s,
    replacement: (m) => {
      let res = m.replace(/font-weight:\s*[^;]+;/, 'font-weight: 600;');
      if (!res.includes('letter-spacing:')) res = res.replace('font-weight: 600;', 'font-weight: 600;\n  letter-spacing: 0.03em;\n  text-transform: uppercase;');
      return res;
    }
  },
  {
    selector: '.trap-row .contrast-badge',
    regex: /\.trap-row \.contrast-badge\s*\{([^}]*?)font-weight:\s*700;/s,
    replacement: (m, p1) => `.trap-row .contrast-badge {${p1}font-weight: 600;\n  letter-spacing: 0.03em;`
  },
  {
    selector: '.fix-row .contrast-badge',
    regex: /\.fix-row \.contrast-badge\s*\{([^}]*?)font-weight:\s*700;/s,
    replacement: (m, p1) => `.fix-row .contrast-badge {${p1}font-weight: 600;\n  letter-spacing: 0.03em;`
  },
  {
    selector: '.comp-badge',
    regex: /\.comp-badge\s*\{([^}]*?)font-weight:\s*800;/s,
    replacement: (m, p1) => `.comp-badge {${p1}font-weight: 600;\n  letter-spacing: 0.03em;`
  }
];

updateCssRules('components/problem/problem.css', problemRules);
if (fs.existsSync('miracle-it-career-academy/components/problem/problem.css')) {
  updateCssRules('miracle-it-career-academy/components/problem/problem.css', problemRules);
}

// Proof
const proofRules = [
  {
    selector: '.marquee-pill-badge',
    regex: /\.marquee-pill-badge\s*\{([^}]*?)font-weight:\s*800;([^}]*?)letter-spacing:\s*[^;]+;/s,
    replacement: (m, p1, p2) => `.marquee-pill-badge {${p1}font-weight: 600;${p2}letter-spacing: 0.03em;`
  },
  {
    selector: '.proof-tag',
    regex: /\.proof-tag\s*\{([^}]*?)font-weight:\s*800;/s,
    replacement: (m, p1) => `.proof-tag {${p1}font-weight: 600;\n  letter-spacing: 0.03em;`
  },
  {
    selector: '.proof-student-badge',
    regex: /\.proof-student-badge\s*\{([^}]*?)font-weight:\s*700;([^}]*?)letter-spacing:\s*[^;]+;/s,
    replacement: (m, p1, p2) => `.proof-student-badge {${p1}font-weight: 600;${p2}letter-spacing: 0.03em;`
  },
  {
    selector: '.proof-review-badge',
    regex: /\.proof-review-badge\s*\{([^}]*?)font-weight:\s*700;([^}]*?)letter-spacing:\s*[^;]+;/s,
    replacement: (m, p1, p2) => `.proof-review-badge {${p1}font-weight: 600;${p2}letter-spacing: 0.03em;`
  }
];

updateCssRules('components/proof/proof.css', proofRules);
if (fs.existsSync('miracle-it-career-academy/components/proof/proof.css')) {
  updateCssRules('miracle-it-career-academy/components/proof/proof.css', proofRules);
}

// Learning Experience
const learnRules = [
  {
    selector: '.card-step-badge',
    regex: /\.card-step-badge\s*\{([^}]*?)font-weight:\s*700;/s,
    replacement: (m, p1) => `.card-step-badge {${p1}font-weight: 600;\n  letter-spacing: 0.03em;\n  text-transform: uppercase;`
  }
];

updateCssRules('components/learning-experience/learning-experience.css', learnRules);
if (fs.existsSync('miracle-it-career-academy/components/learning-experience/learning-experience.css')) {
  updateCssRules('miracle-it-career-academy/components/learning-experience/learning-experience.css', learnRules);
}

// Who Can Join
const whoRules = [
  {
    selector: '.who-badge',
    regex: /\.who-badge\s*\{([^}]*?)font-weight:\s*700;/s,
    replacement: (m, p1) => `.who-badge {${p1}font-weight: 600;\n  letter-spacing: 0.03em;`
  },
  {
    selector: '.rec-label',
    regex: /\.rec-label\s*\{([^}]*?)font-weight:\s*700;/s,
    replacement: (m, p1) => `.rec-label {${p1}font-weight: 600;\n  letter-spacing: 0.03em;\n  text-transform: uppercase;`
  }
];

updateCssRules('components/who-can-join/who-can-join.css', whoRules);
if (fs.existsSync('miracle-it-career-academy/components/who-can-join/who-can-join.css')) {
  updateCssRules('miracle-it-career-academy/components/who-can-join/who-can-join.css', whoRules);
}

// Counselling Process
const processRules = [
  {
    selector: '.step-indicator-pill',
    regex: /\.step-indicator-pill\s*\{([^}]*?)font-weight:\s*700;([^}]*?)letter-spacing:\s*[^;]+;/s,
    replacement: (m, p1, p2) => `.step-indicator-pill {${p1}font-weight: 600;${p2}letter-spacing: 0.03em;`
  }
];

updateCssRules('components/counselling-process/counselling-process.css', processRules);
if (fs.existsSync('miracle-it-career-academy/components/counselling-process/counselling-process.css')) {
  updateCssRules('miracle-it-career-academy/components/counselling-process/counselling-process.css', processRules);
}

console.log('--- ALL BADGES & LABELS FINE-TUNED ---');
