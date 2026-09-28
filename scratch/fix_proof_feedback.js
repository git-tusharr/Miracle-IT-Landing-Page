const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../components/proof/proof.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Replace testimonials mask and pseudo elements
const oldMaskBlock = `.proof-testimonials-mask {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 1rem 0 1.5rem;
  mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
}

.proof-testimonials-mask::before,
.proof-testimonials-mask::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(50px, 10vw, 140px);
  z-index: 3;
  pointer-events: none;
}

.proof-testimonials-mask::before {
  left: 0;
  background: linear-gradient(to right, var(--color-bg-alt, #0A0E1A) 0%, transparent 100%);
}

.proof-testimonials-mask::after {
  right: 0;
  background: linear-gradient(to left, var(--color-bg-alt, #0A0E1A) 0%, transparent 100%);
}`;

const newMaskBlock = `/* High-Definition Alpha Gradient Mask (Zero white/grey edge blur overlays) */
.proof-testimonials-mask {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 1.25rem 0 2rem;
  mask-image: linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%) !important;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%) !important;
}

.proof-testimonials-mask::before,
.proof-testimonials-mask::after {
  display: none !important;
  content: none !important;
}`;

if (css.includes(oldMaskBlock)) {
  css = css.replace(oldMaskBlock, newMaskBlock);
  console.log('Replaced oldMaskBlock successfully');
} else {
  console.log('oldMaskBlock not found exactly, will use targeted regex');
  css = css.replace(/\.proof-testimonials-mask\s*\{[\s\S]*?\.proof-testimonials-mask::after\s*\{[\s\S]*?\}/, newMaskBlock);
}

// 2. Add / update universal styling for .proof-feedback-btn and header
const oldHeaderBlock = `.proof-testimonials-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.proof-testimonials-title {
  font-size: clamp(1.4rem, 2.2vw, 1.85rem);
  color: #FFFFFF;
  margin: 0.35rem 0 0.5rem;
  letter-spacing: -0.02em;
  font-weight: 800;
}`;

const newHeaderBlock = `.proof-testimonials-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2.25rem;
  gap: 0.75rem;
}

.proof-slider-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.95rem;
  background: rgba(255, 122, 0, 0.1);
  border: 1px solid rgba(255, 122, 0, 0.32);
  border-radius: var(--radius-full, 9999px);
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #FF9433;
  text-transform: uppercase;
}

.proof-testimonials-title {
  font-family: var(--font-sans);
  font-size: clamp(1.85rem, 3.2vw, 2.6rem);
  color: #F8FAFC;
  margin: 0;
  letter-spacing: -0.03em;
  font-weight: 800;
  line-height: 1.2;
}

.proof-slider-sub {
  font-size: 1.05rem;
  color: #94A3B8;
  max-width: 660px;
  line-height: 1.6;
  margin: 0 auto;
}

.proof-testimonials-action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.proof-feedback-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.68rem 1.6rem;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.015em;
  border-radius: var(--radius-full, 9999px);
  background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%) !important;
  color: #FFFFFF !important;
  border: 1px solid rgba(255, 122, 0, 0.45) !important;
  box-shadow: 0 4px 18px rgba(255, 107, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.proof-feedback-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #FF7A00 0%, #F97316 100%) !important;
  border-color: rgba(255, 122, 0, 0.7) !important;
  box-shadow: 0 8px 26px rgba(255, 107, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
  color: #FFFFFF !important;
}

.proof-feedback-btn svg {
  color: #FFFFFF;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.proof-feedback-btn:hover svg {
  transform: scale(1.18);
}`;

if (css.includes(oldHeaderBlock)) {
  css = css.replace(oldHeaderBlock, newHeaderBlock);
  console.log('Replaced oldHeaderBlock successfully');
}

// 3. Remove white overlay gradients in section-light blocks that caused blur
const whiteOverlayRegex = /\/\* Eliminate black edge fades on all sliding marquees in light mode \*\/[\s\S]*?\.section-light \.proof-testimonials-mask::after\s*\{[\s\S]*?\}/;
const newCleanMarqueeRule = `/* Clean edge fades without white frosted overlay */
.marquee-gradient-mask::before,
.marquee-gradient-mask::after,
.proof-students-mask::before,
.proof-students-mask::after,
.proof-testimonials-mask::before,
.proof-testimonials-mask::after,
.section-light .marquee-gradient-mask::before,
.section-light .marquee-gradient-mask::after,
.section-light .proof-students-mask::before,
.section-light .proof-students-mask::after,
.section-light .proof-testimonials-mask::before,
.section-light .proof-testimonials-mask::after {
  display: none !important;
  content: none !important;
}

.marquee-gradient-mask,
.proof-students-mask,
.proof-testimonials-mask {
  mask-image: linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%) !important;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%) !important;
}`;

if (whiteOverlayRegex.test(css)) {
  css = css.replace(whiteOverlayRegex, newCleanMarqueeRule);
  console.log('Replaced whiteOverlayRegex successfully');
} else {
  // Also ensure no other rules paint white over mask
  css += '\n\n' + newCleanMarqueeRule;
  console.log('Appended newCleanMarqueeRule');
}

// 4. Also check card styling
const cardTopBorder = `.proof-review-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), transparent);
  pointer-events: none;
}`;

if (!css.includes('.proof-review-card::before')) {
  css = css.replace('.proof-review-card {', cardTopBorder + '\n\n.proof-review-card {');
  console.log('Added top accent to .proof-review-card');
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Finished updating components/proof/proof.css');
