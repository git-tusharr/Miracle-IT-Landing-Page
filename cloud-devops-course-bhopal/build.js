/**
 * MIRACLE IT — CLOUD & DEVOPS COURSE PAGE STATIC COMPILER & WATCHER
 * Assembles all modular components into index.html
 * 
 * Usage:
 *   node build.js         (compiles index.html from index.template.html)
 *   node build.js --watch (watches components/ for edits and auto-compiles)
 */

const fs = require('fs');
const path = require('path');

const COURSE_DIR = __dirname;
const COMPONENTS_DIR = path.join(COURSE_DIR, 'components');
const TEMPLATE_FILE = path.join(COURSE_DIR, 'index.template.html');
const OUTPUT_FILE = path.join(COURSE_DIR, 'index.html');

const COMPONENTS = [
  'header',
  'hero',
  'audience',
  'curriculum',
  'learning-method',
  'projects',
  'career-support',
  'specs',
  'experience',
  'faq',
  'location',
  'counselling-form',
  'footer',
  'mobile-sticky-cta'
];

function compile() {
  console.log('[Miracle IT Build] Compiling Cloud & DevOps course landing page components...');
  
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`[Miracle IT Build] Error: Template file missing: ${TEMPLATE_FILE}`);
    return;
  }

  let template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  let compiledCount = 0;

  COMPONENTS.forEach(name => {
    const compFile = path.join(COMPONENTS_DIR, name, `${name}.html`);
    if (fs.existsSync(compFile)) {
      const compContent = fs.readFileSync(compFile, 'utf8').trim();
      const targetMarker = `<div data-component="${name}"></div>`;
      
      if (template.includes(targetMarker)) {
        template = template.replace(
          targetMarker,
          `<div data-component="${name}">\n${compContent}\n  </div>`
        );
        compiledCount++;
      } else {
        console.warn(`[Miracle IT Build] Target marker not found in template for: ${name}`);
      }
    } else {
      console.warn(`[Miracle IT Build] Missing component file: ${compFile}`);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, template, 'utf8');
  const now = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  console.log(`[Miracle IT Build] Successfully compiled ${compiledCount} components into index.html (${now})`);
}

// Check arguments for --watch mode
if (process.argv.includes('--watch')) {
  console.log('[Miracle IT Build] Starting watch mode on components and template...');
  compile();
  
  // Watch template
  fs.watch(TEMPLATE_FILE, (eventType) => {
    if (eventType === 'change') {
      console.log('[Miracle IT Build] Template updated, recompiling...');
      compile();
    }
  });

  // Watch component directory recursively
  fs.watch(COMPONENTS_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
      console.log(`[Miracle IT Build] Component changed (${filename}), recompiling...`);
      compile();
    }
  });
} else {
  compile();
}
