const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../components/proof/proof.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace from .proof-testimonials-header up to before .proof-testimonials-track
const startMarker = '.proof-testimonials-header {';
const endMarker = '.proof-testimonials-track {';

const startIndex = css.indexOf(startMarker);
const endIndex = css.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers:', { startIndex, endIndex });
  process.exit(1);
}

const replacement = `.proof-testimonials-header {
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
  font-size: clamp(1.85rem, 3.2vw, 2.5rem);
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
  margin-top: 0.65rem;
}

.proof-feedback-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.65rem !important;
  font-family: var(--font-sans);
  font-size: 0.92rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.015em;
  border-radius: var(--radius-full, 9999px) !important;
  background: linear-gradient(135deg, #FF6B00 0%, #EA580C 100%) !important;
  color: #FFFFFF !important;
  border: 1px solid rgba(255, 122, 0, 0.5) !important;
  box-shadow: 0 4px 18px rgba(255, 107, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
  text-decoration: none !important;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.proof-feedback-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #FF7A00 0%, #F97316 100%) !important;
  border-color: rgba(255, 122, 0, 0.75) !important;
  box-shadow: 0 8px 26px rgba(255, 107, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
  color: #FFFFFF !important;
}

.proof-feedback-btn svg {
  color: #FFFFFF;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.proof-feedback-btn:hover svg {
  transform: scale(1.18);
}

/* High-Definition Alpha Gradient Mask (Zero white/grey edge blur overlays) */
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
}

`;

css = css.slice(0, startIndex) + replacement + css.slice(endIndex);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully replaced testimonials header, button, and mask styles!');
