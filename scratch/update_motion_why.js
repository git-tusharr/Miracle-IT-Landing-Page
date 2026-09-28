const fs = require('fs');
const path = require('path');

const motionPath = path.resolve(__dirname, '..', 'js', 'motion.js');
let motionContent = fs.readFileSync(motionPath, 'utf8');

const targetFunctionRegex = /initWhyMiracleItTabletStory\(\)\s*\{[\s\S]*?\}\s*,\s*\/\*\*\s*\*\s*Backward-compatibility alias/m;

if (!targetFunctionRegex.test(motionContent)) {
  console.error('Could not match initWhyMiracleItTabletStory in motion.js');
  process.exit(1);
}

const newFunction = `initWhyMiracleItTabletStory() {
      const section = document.querySelector('#why-miracle-it');
      if (!section) return;

      const stageCard = section.querySelector('.why-stage-card') || section.querySelector('.why-showcase-container');
      const chapterNav = section.querySelector('.why-chapter-nav');
      const codingBar = section.querySelector('.ratio-coding');

      // Initialize component interactive controller
      if (typeof window.initWhyMiracleIt === 'function') {
        window.initWhyMiracleIt(section);
      }

      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' || this.isReducedMotion) {
        if (codingBar) codingBar.style.width = '70%';
        return;
      }

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Smooth Section Entrance Reveal
      if (stageCard) {
        gsap.fromTo(stageCard,
          { y: 30, opacity: 0.85 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      }

      if (chapterNav) {
        gsap.fromTo(chapterNav,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      }

      // Coding bar fill animation when entering view
      if (codingBar) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          once: true,
          onEnter: () => {
            gsap.fromTo(codingBar, { width: '0%' }, { width: '70%', duration: 0.9, ease: "power2.out" });
          }
        });
      }
    },

    /**
     * Backward-compatibility alias`;

motionContent = motionContent.replace(targetFunctionRegex, newFunction);
fs.writeFileSync(motionPath, motionContent, 'utf8');
console.log('Successfully updated initWhyMiracleItTabletStory in motion.js');
