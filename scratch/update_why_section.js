const fs = require('fs');
const path = require('path');

const whyHtml = `<!-- ==========================================================================
     WHY MIRACLE IT — NEXT-GEN INTERACTIVE ARCHITECTURE SHOWCASE
     A Practical, Honest Approach to Tech Education
     ========================================================================== -->
<link rel="stylesheet" href="./components/why-miracle-it/why-miracle-it.css?v=6.0">
<section class="section why-section" id="why-miracle-it">
  <div class="container why-container">
    
    <!-- Section Header -->
    <div class="section-header why-header">
      <span class="section-tag">The Miracle IT Difference</span>
      <h2>A Practical, Honest Approach to Tech Education</h2>
      <p class="text-lead">
        We replaced traditional slide lecturing with hands-on system building, small cohorts, and daily 1-on-1 code reviews in M.P. Nagar, Bhopal.
      </p>
    </div>

    <!-- Spacious Interactive Architecture Showcase -->
    <div class="why-showcase-container">

      <!-- Interactive Chapter Navigation Bar (Better UI Feature) -->
      <div class="why-chapter-nav" role="tablist" aria-label="Why Miracle IT Architecture Chapters">
        <button type="button" class="chapter-tab story-dot is-active" data-slide-target="0" role="tab" aria-selected="true">
          <span class="chapter-num">01</span>
          <span class="chapter-label">70/30 Formula</span>
        </button>
        <button type="button" class="chapter-tab story-dot" data-slide-target="1" role="tab" aria-selected="false">
          <span class="chapter-num">02</span>
          <span class="chapter-label">Production Capstones</span>
        </button>
        <button type="button" class="chapter-tab story-dot" data-slide-target="2" role="tab" aria-selected="false">
          <span class="chapter-num">03</span>
          <span class="chapter-label">1-on-1 Code Audits</span>
        </button>
        <button type="button" class="chapter-tab story-dot" data-slide-target="3" role="tab" aria-selected="false">
          <span class="chapter-num">04</span>
          <span class="chapter-label">Bhopal Comparison</span>
        </button>
        <button type="button" class="chapter-tab story-dot" data-slide-target="4" role="tab" aria-selected="false">
          <span class="chapter-num">05</span>
          <span class="chapter-label">Ethical Pledge</span>
        </button>
      </div>

      <!-- Spacious Architecture Card Stage -->
      <div class="why-stage-card" id="whyTabletDevice">
        
        <div class="tablet-story-viewport" id="tabletStoryViewport">
          <div class="tablet-story-track" id="tabletStoryTrack">
            
            <!-- SLIDE 01: The Classroom Formula -->
            <article class="tablet-slide slide-formula" data-slide-index="0" aria-label="Chapter 1: The Classroom Formula">
              <div class="slide-content-wrap">
                <div class="slide-kicker-row">
                  <span class="slide-tag">Chapter 01 • The Classroom Formula</span>
                  <span class="slide-badge-meta">Every Single Class in Bhopal</span>
                </div>
                <h3 class="slide-title">
                  70% Hands-on Lab Coding vs 30% Architecture Theory
                </h3>
                <p class="slide-sub">
                  Every session balances deep conceptual system architecture with intensive lab execution and line-by-line debugging on your workstation.
                </p>

                <!-- Visual Ratio Bar -->
                <div class="ratio-bar-track">
                  <div class="ratio-segment ratio-coding" style="width: 70%;">
                    <span class="ratio-text-desktop">70% Hands-on Live Coding &amp; Debugging</span>
                    <span class="ratio-text-mobile">70% Coding</span>
                  </div>
                  <div class="ratio-segment ratio-theory" style="width: 30%;">
                    <span class="ratio-text-desktop">30% System Architecture</span>
                    <span class="ratio-text-mobile">30% Theory</span>
                  </div>
                </div>

                <!-- 3-Phase Daily Routine Grid (Spacious & Clean) -->
                <div class="daily-routine-grid">
                  <div class="routine-phase">
                    <span class="phase-time">First 30 Mins</span>
                    <strong>System Concept Breakdown</strong>
                    <p>Whiteboard architecture, algorithm design, relational schemas, and data flow modeling.</p>
                  </div>
                  <div class="routine-phase phase-active">
                    <span class="phase-time">Next 90 Mins</span>
                    <strong>Live Coding in Lab</strong>
                    <p>Writing and executing real code on dedicated lab machines with instant instructor unblocking.</p>
                  </div>
                  <div class="routine-phase">
                    <span class="phase-time">Final 30 Mins</span>
                    <strong>1-on-1 Code Review &amp; Git Push</strong>
                    <p>Line-by-line review of clean code practices, committing changes directly to GitHub.</p>
                  </div>
                </div>
              </div>
            </article>

            <!-- SLIDE 02: Real Capstones & Practitioner Mentors -->
            <article class="tablet-slide slide-pillars-1" data-slide-index="1" aria-label="Chapter 2: Production Capstones & Practitioner Mentors">
              <div class="slide-content-wrap">
                <div class="slide-kicker-row">
                  <span class="slide-tag">Chapter 02 • Production Standards</span>
                  <span class="slide-badge-meta">Pillars 01 &amp; 02</span>
                </div>
                <h3 class="slide-title">Production Capstones &amp; Real Industry Mentors</h3>
                <p class="slide-sub">
                  Learn software engineering from professionals who build scalable systems, not slide lecturers reading manuals.
                </p>

                <div class="pillars-slide-grid">
                  <!-- Pillar 1 -->
                  <div class="pillar-story-card">
                    <div class="pillar-icon-box blue-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    </div>
                    <h4 class="pillar-heading">Production Capstones vs Toy Projects</h4>
                    <p class="pillar-sub">
                      Recruiters reject basic calculators and todo lists. We teach you to engineer multi-tier web applications with database indexes, JWT authentication, and live cloud deployment links.
                    </p>
                    <div class="pillar-footer-tag">
                      <span>✔ Real Git Repositories</span>
                      <span>✔ Live Cloud URLs</span>
                    </div>
                  </div>

                  <!-- Pillar 2 -->
                  <div class="pillar-story-card">
                    <div class="pillar-icon-box emerald-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <h4 class="pillar-heading">Practitioner Mentors, Not Lecturers</h4>
                    <p class="pillar-sub">
                      Learn from trainers who have designed production backend APIs and datasets in real industry environments, bringing pragmatic debugging habits directly into the classroom.
                    </p>
                    <div class="pillar-footer-tag">
                      <span>✔ Direct Faculty Access</span>
                      <span>✔ No Theory Rote</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <!-- SLIDE 03: 1-on-1 Code Review & Verified Credentials -->
            <article class="tablet-slide slide-pillars-2" data-slide-index="2" aria-label="Chapter 3: Code Review & Certification">
              <div class="slide-content-wrap">
                <div class="slide-kicker-row">
                  <span class="slide-tag">Chapter 03 • Accountability</span>
                  <span class="slide-badge-meta">Pillars 03 &amp; 04</span>
                </div>
                <h3 class="slide-title">Line-by-Line Mentorship &amp; Verified Credentials</h3>
                <p class="slide-sub">
                  Debugging is where real engineering happens. We inspect your logic line-by-line and validate your practical competency.
                </p>

                <div class="pillars-slide-grid">
                  <!-- Pillar 3 -->
                  <div class="pillar-story-card">
                    <div class="pillar-icon-box amber-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                    </div>
                    <h4 class="pillar-heading">1-on-1 Daily Code Review in Bhopal</h4>
                    <p class="pillar-sub">
                      Getting stuck on an error is a normal part of learning to code. Our faculty reviews your specific code line-by-line so you understand root causes rather than copy-pasting code.
                    </p>
                    <div class="pillar-footer-tag">
                      <span>✔ Personal Debugging</span>
                      <span>✔ Small Cohorts (15–20)</span>
                    </div>
                  </div>

                  <!-- Pillar 4 -->
                  <div class="pillar-story-card">
                    <div class="pillar-icon-box purple-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                    </div>
                    <h4 class="pillar-heading">Verified Skill Certification</h4>
                    <p class="pillar-sub">
                      Earn a recognized credential from Miracle IT documenting evaluated competencies, practical project hours, and verified GitHub links to validate your capabilities.
                    </p>
                    <div class="pillar-footer-tag">
                      <span>✔ Evaluated Project Hours</span>
                      <span>✔ Verified Credentials</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <!-- SLIDE 04: The Transparency Comparison Matrix -->
            <article class="tablet-slide slide-matrix" data-slide-index="3" aria-label="Chapter 4: The Transparency Matrix">
              <div class="slide-content-wrap">
                <div class="slide-kicker-row">
                  <span class="slide-tag">Chapter 04 • Honest Comparison</span>
                  <span class="slide-badge-meta">M.P. Nagar Feedback</span>
                </div>
                <h3 class="slide-title">How Miracle IT Compares to Traditional Institutes</h3>
                <p class="slide-sub">
                  A side-by-side transparent assessment against standard commercial coaching centers in Bhopal.
                </p>

                <div class="comp-matrix-dashboard">
                  <div class="comp-row">
                    <span class="comp-factor">Batch Size</span>
                    <span class="comp-trad">50 to 100+ students crowded</span>
                    <span class="comp-miracle">Strictly 15 to 20 students per batch</span>
                  </div>
                  <div class="comp-row">
                    <span class="comp-factor">Teaching Focus</span>
                    <span class="comp-trad">Heavy slide presentations &amp; theory notes</span>
                    <span class="comp-miracle">70% Hands-on coding on lab machines</span>
                  </div>
                  <div class="comp-row">
                    <span class="comp-factor">Code Debugging</span>
                    <span class="comp-trad">Zero personal review; students figure it alone</span>
                    <span class="comp-miracle">Daily 1-on-1 code audit with senior mentor</span>
                  </div>
                  <div class="comp-row">
                    <span class="comp-factor">Project Quality</span>
                    <span class="comp-trad">Copy-paste sample apps (todo list, calc)</span>
                    <span class="comp-miracle">Multi-tier production capstones with Git commits</span>
                  </div>
                  <div class="comp-row">
                    <span class="comp-factor">Admission Ethics</span>
                    <span class="comp-trad">Pushy sales calls &amp; fake guarantees</span>
                    <span class="comp-miracle">Free 30-min visit first • Zero false promises</span>
                  </div>
                </div>
              </div>
            </article>

            <!-- SLIDE 05: The Ethical Transparency Pledge -->
            <article class="tablet-slide slide-pledge" data-slide-index="4" aria-label="Chapter 5: Transparency Pledge">
              <div class="slide-content-wrap">
                <div class="slide-kicker-row">
                  <span class="slide-tag">Chapter 05 • Ethical Promise</span>
                  <span class="slide-badge-meta">Our Institutional Guarantee</span>
                </div>
                <h3 class="slide-title">Our Transparency Pledge to Every Bhopal Student</h3>

                <div class="pledge-card-wrap">
                  <div class="pledge-seal" aria-hidden="true">
                    <svg viewBox="0 0 120 120" role="presentation" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="sealBrandWhy" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stop-color="#FF9433"/>
                          <stop offset="100%" stop-color="#EA580C"/>
                        </linearGradient>
                        <path id="sealArcWhy" d="M60 60 m-42 0 a42 42 0 1 1 84 0 a42 42 0 1 1 -84 0"/>
                      </defs>
                      <circle class="seal-ring-outer" cx="60" cy="60" r="52"/>
                      <circle class="seal-ring-dash" cx="60" cy="60" r="46"/>
                      <circle class="seal-disc" cx="60" cy="60" r="33" fill="url(#sealBrandWhy)"/>
                      <path class="seal-tick" d="M46 61l10 10 20-22"/>
                      <text class="seal-caption">
                        <textPath href="#sealArcWhy" startOffset="50%" text-anchor="middle">
                          VERIFIED • HONEST COUNSELLING • BHOPAL •
                        </textPath>
                      </text>
                    </svg>
                  </div>

                  <p class="pledge-quote-text">
                    “We will never sell you a course that does not fit your academic background. We will never make fake 100% job guarantee promises. We invite you to visit our M.P. Nagar center, inspect our classrooms, and talk directly to current students before making any payment.”
                  </p>

                  <div class="pledge-trust-row">
                    <span class="pledge-pill">✔ No Day-1 Payment Pressure</span>
                    <span class="pledge-pill">✔ Inspect Student Code &amp; Lab</span>
                    <span class="pledge-pill">✔ Talk to Current Batches</span>
                    <span class="pledge-pill">✔ Free Faculty Consultation</span>
                  </div>

                  <div class="pledge-actions-row">
                    <a href="#counselling-form" class="btn btn-primary btn-md btn-magnetic" data-track-cta="why_pledge_cta_visit">
                      Schedule Free Campus Visit →
                    </a>
                    <a href="tel:+917880003127" class="btn btn-secondary btn-md btn-magnetic" data-config-phone>
                      Call Course Advisor
                    </a>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </div>

        <!-- Chapter Navigation Footer -->
        <div class="why-stage-footer">
          <button type="button" class="stage-nav-btn" id="btnHudPrev" aria-label="Previous Chapter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <span>Previous</span>
          </button>

          <div class="stage-progress-info">
            <span class="stage-chapter-indicator" id="tabletChapterText">Chapter 1 of 5 • Classroom Formula</span>
            <div class="stage-progress-bar-wrap">
              <div class="stage-progress-bar-fill" id="tabletProgressBar" style="width: 20%;"></div>
            </div>
          </div>

          <button type="button" class="stage-nav-btn" id="btnHudNext" aria-label="Next Chapter">
            <span>Next</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

      </div>

    </div>

  </div>
</section>
`;
fs.writeFileSync(path.resolve(__dirname, '../components/why-miracle-it/why-miracle-it.html'), whyHtml, 'utf8');
console.log('Saved new why-miracle-it.html');

// Sync to index.html
let indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const whySectionRegex = /(<!-- 5\. Why Miracle IT — Value Proposition Section -->[\s\S]*?<div data-component="why-miracle-it">[\s\S]*?)(<link rel="stylesheet" href="\.\/components\/why-miracle-it\/why-miracle-it\.css[^>]*>[\s\S]*?<\/section>)(\s*<\/div>)/;

if (whySectionRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(whySectionRegex, `$1${whyHtml}$3`);
  fs.writeFileSync(path.resolve(__dirname, '../index.html'), indexHtml, 'utf8');
  console.log('Synced why-miracle-it to index.html');
} else {
  console.warn('Could not match why-miracle-it section in index.html');
}
