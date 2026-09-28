const fs = require('fs');
const path = require('path');

const cssContent = `/* ==========================================================================
   WHY MIRACLE IT — NEXT-GEN INTERACTIVE ARCHITECTURE SHOWCASE
   A Practical, Honest Approach to Tech Education
   Miracle IT Career Academy — Bhopal
   ========================================================================== */

.why-section {
  background-color: var(--color-bg-alt, #07090E);
  position: relative;
  overflow: hidden;
  padding: clamp(3.5rem, 6vw, 6rem) 0;
}

.why-container {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.why-header {
  text-align: center;
  margin-bottom: clamp(2rem, 3.5vw, 3rem);
  max-width: 820px;
}

.why-header h2 {
  font-size: clamp(1.85rem, 3vw, 2.6rem);
  color: #FFFFFF;
  margin-top: 0.5rem;
  margin-bottom: 0.85rem;
  letter-spacing: -0.025em;
  line-height: 1.2;
  font-weight: 800;
}

.why-header .text-lead {
  font-size: clamp(0.98rem, 1.4vw, 1.12rem);
  color: #94A3B8;
  line-height: 1.6;
  margin: 0 auto;
}

/* ==========================================================================
   SPACIOUS INTERACTIVE SHOWCASE CONTAINER (ELEVATED UI FEATURE)
   ========================================================================== */

.why-showcase-container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Interactive Chapter Nav Bar */
.why-chapter-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.45rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.chapter-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.6rem 1.15rem;
  border-radius: 9999px;
  background: transparent;
  border: 1px solid transparent;
  color: #94A3B8;
  font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.chapter-tab:hover {
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.chapter-tab.is-active {
  background: linear-gradient(135deg, rgba(255, 122, 0, 0.2) 0%, rgba(234, 88, 12, 0.12) 100%);
  border-color: #FF7A00;
  color: #FF9433;
  box-shadow: 0 4px 20px rgba(255, 122, 0, 0.28);
}

.chapter-num {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  letter-spacing: 0.04em;
}

.chapter-tab.is-active .chapter-num {
  background: rgba(255, 122, 0, 0.3);
  color: #FFFFFF;
}

/* Spacious Architecture Stage Card */
.why-stage-card {
  position: relative;
  width: 100%;
  background: #0B1120;
  background: linear-gradient(175deg, #0E1628 0%, #080D1A 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  box-shadow: 
    0 25px 70px -10px rgba(0, 0, 0, 0.75),
    0 0 40px rgba(255, 122, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Horizontal Track Viewport */
.tablet-story-viewport {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.tablet-story-track {
  display: flex;
  width: 500%;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Individual Slide (Generous Whitespace & Padding) */
.tablet-slide {
  width: 20%;
  flex: 0 0 20%;
  padding: clamp(2.25rem, 4vw, 3.5rem);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.slide-content-wrap {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

/* Slide Kicker & Meta */
.slide-kicker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.slide-tag {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #38BDF8;
}

.slide-badge-meta {
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  color: #94A3B8;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.slide-title {
  font-size: clamp(1.4rem, 2.2vw, 1.95rem);
  color: #FFFFFF;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin-bottom: 0.75rem;
}

.slide-sub {
  font-size: clamp(0.92rem, 1.3vw, 1.02rem);
  color: #94A3B8;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 820px;
}

/* ==========================================================================
   SLIDE 1: THE 70/30 FORMULA (Spacious & Clean)
   ========================================================================== */

.ratio-bar-track {
  display: flex;
  height: 48px;
  border-radius: 9999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.ratio-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  transition: width 0.6s ease;
}

.ratio-coding {
  background: linear-gradient(90deg, #FF6000 0%, #FF851A 100%);
  color: #FFFFFF;
  box-shadow: 0 0 24px rgba(255, 122, 0, 0.4);
}

.ratio-theory {
  background: rgba(30, 41, 59, 0.9);
  color: #94A3B8;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.ratio-text-mobile {
  display: none;
}

/* 3-Phase Daily Routine Grid */
.daily-routine-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.35rem;
}

.routine-phase {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 18px;
  padding: 1.5rem 1.35rem;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.routine-phase:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
}

.routine-phase.phase-active {
  background: rgba(255, 122, 0, 0.05);
  border-color: rgba(255, 122, 0, 0.35);
  box-shadow: 0 10px 30px rgba(255, 122, 0, 0.12), inset 0 1px 0 rgba(255, 122, 0, 0.2);
}

.phase-time {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #FF9433;
  margin-bottom: 0.6rem;
}

.routine-phase.phase-active .phase-time {
  color: #FF7A00;
}

.routine-phase strong {
  font-size: 1.05rem;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
  line-height: 1.35;
  font-weight: 700;
}

.routine-phase p {
  font-size: 0.86rem;
  color: #94A3B8;
  line-height: 1.55;
  margin: 0;
}

/* ==========================================================================
   SLIDE 2 & 3: PILLARS GRID (Spacious 2-Column Bento)
   ========================================================================== */

.pillars-slide-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.pillar-story-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  padding: clamp(1.6rem, 2.5vw, 2.25rem);
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.pillar-story-card:hover {
  background: rgba(255, 255, 255, 0.045);
  border-color: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
}

.pillar-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.pillar-icon-box svg {
  width: 24px;
  height: 24px;
}

.blue-box { background: rgba(37, 99, 235, 0.15); color: #38BDF8; border: 1px solid rgba(37, 99, 235, 0.3); }
.emerald-box { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
.amber-box { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); }
.purple-box { background: rgba(139, 92, 246, 0.15); color: #C084FC; border: 1px solid rgba(139, 92, 246, 0.3); }

.pillar-heading {
  font-size: clamp(1.1rem, 1.6vw, 1.28rem);
  color: #FFFFFF;
  font-weight: 750;
  margin-bottom: 0.65rem;
  line-height: 1.3;
}

.pillar-sub {
  font-size: 0.88rem;
  color: #94A3B8;
  line-height: 1.6;
  margin-bottom: 1.35rem;
  flex: 1;
}

.pillar-footer-tag {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1rem;
}

.pillar-footer-tag span {
  font-size: 0.78rem;
  font-weight: 600;
  color: #E2E8F0;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* ==========================================================================
   SLIDE 4: COMPARISON MATRIX (Clean & Spacious Table)
   ========================================================================== */

.comp-matrix-dashboard {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.comp-row {
  display: grid;
  grid-template-columns: 180px 1fr 1fr;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1.5rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.comp-row:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.comp-factor {
  font-weight: 700;
  font-size: 0.92rem;
  color: #FFFFFF;
}

.comp-trad {
  font-size: 0.86rem;
  color: #94A3B8;
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.45;
}

.comp-trad::before {
  content: '✕';
  position: absolute;
  left: 0;
  top: 1px;
  color: #F87171;
  font-weight: 800;
  font-size: 0.85rem;
}

.comp-miracle {
  font-size: 0.88rem;
  font-weight: 600;
  color: #34D399;
  padding-left: 1.35rem;
  position: relative;
  line-height: 1.45;
}

.comp-miracle::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 1px;
  color: #10B981;
  font-weight: 800;
  font-size: 0.95rem;
}

/* ==========================================================================
   SLIDE 5: ETHICAL TRANSPARENCY PLEDGE
   ========================================================================== */

.pledge-card-wrap {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  padding: clamp(2rem, 3.5vw, 3rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.pledge-seal {
  width: 90px;
  height: 90px;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 6px 20px rgba(255, 122, 0, 0.35));
}

.pledge-seal svg {
  width: 100%;
  height: 100%;
}

.pledge-quote-text {
  font-size: clamp(1.05rem, 1.6vw, 1.28rem);
  color: #FFFFFF;
  line-height: 1.65;
  font-weight: 500;
  font-style: italic;
  max-width: 780px;
  margin: 0 auto 1.75rem auto;
}

.pledge-trust-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1rem;
  margin-bottom: 2rem;
}

.pledge-pill {
  font-size: 0.82rem;
  font-weight: 600;
  color: #38BDF8;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.22);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
}

.pledge-actions-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* ==========================================================================
   STAGE FOOTER (Controls, Progress & Info)
   ========================================================================== */

.why-stage-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 2rem;
  background: rgba(8, 13, 26, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 1.5rem;
}

.stage-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #E2E8F0;
  font-family: var(--font-sans);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stage-nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.22);
  color: #FFFFFF;
  transform: translateY(-1px);
}

.stage-nav-btn svg {
  width: 16px;
  height: 16px;
}

.stage-progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
}

.stage-chapter-indicator {
  font-size: 0.82rem;
  font-weight: 700;
  color: #94A3B8;
  letter-spacing: 0.02em;
}

.stage-progress-bar-wrap {
  width: 180px;
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.stage-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF7A00, #38BDF8);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 9999px;
}

/* ==========================================================================
   RESPONSIVE BREAKPOINTS
   ========================================================================== */

@media (max-width: 900px) {
  .daily-routine-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .pillars-slide-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .comp-row {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .comp-factor {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 0.4rem;
  }
}

@media (max-width: 640px) {
  .why-chapter-nav {
    border-radius: 18px;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 0.5rem;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .chapter-tab {
    padding: 0.5rem 0.85rem;
    font-size: 0.78rem;
    flex-shrink: 0;
  }

  .tablet-slide {
    padding: 1.75rem 1.25rem;
  }

  .ratio-bar-track {
    height: 40px;
    font-size: 0.75rem;
  }

  .ratio-text-desktop {
    display: none;
  }

  .ratio-text-mobile {
    display: inline;
  }

  .why-stage-footer {
    padding: 1rem 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .stage-progress-info {
    order: -1;
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
`;

fs.writeFileSync(path.resolve(__dirname, '../components/why-miracle-it/why-miracle-it.css'), cssContent, 'utf8');
console.log('Saved new spacious why-miracle-it.css');
