/**
 * MIRACLE IT CAREER ACADEMY — CENTRAL MOTION SYSTEM
 * 
 * High-performance, GPU-accelerated motion controller.
 * Features:
 *  - Fail-safe CSS reveal architecture (zero opacity flash)
 *  - Orchestrated page load entrance sequence (Header -> Hero Tag -> Title -> Subtitle -> CTAs -> Badges -> Terminal)
 *  - Centralized IntersectionObserver with automatic stagger delay injection
 *  - Subtle hero scroll parallax & desktop cursor tracking (requestAnimationFrame)
 *  - Progressive 5-step counselling timeline reveal
 *  - Interactive classroom ratio bar animation (Why Miracle IT)
 *  - Seamless FAQ accordion expansion with zero layout jumps
 *  - Full @media (prefers-reduced-motion: reduce) accessibility
 * 
 * Strictly zero external dependencies. Pure 60fps Vanilla JavaScript.
 */

(function (window, document) {
  'use strict';

  const MiracleMotion = {
    isReducedMotion: false,
    hasInitialized: false,
    observer: null,
    rafId: null,

    /**
     * Check user's OS preference for reduced motion
     */
    checkReducedMotion() {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
        if (this.isReducedMotion) {
          this.disableDynamicMotion();
        }
      });
      return this.isReducedMotion;
    },

    /**
     * Master Initialization
     */
    init() {
      if (this.hasInitialized) return;
      this.hasInitialized = true;

      this.checkReducedMotion();

      // Safe reveal architecture: activate motion-ready styles only after script runs
      document.documentElement.classList.add('motion-ready');

      if (this.isReducedMotion) {
        this.disableDynamicMotion();
        console.log('[MiracleMotion] prefers-reduced-motion active. High-accessibility mode enabled.');
        return;
      }

      this.initPageLoad();
      this.initScrollReveal();
      this.initHeroMotion();
      this.initCursorFollower();
      this.initBentoSpotlight();
      this.init3DTiltCards();
      this.initMagneticButtons();
      this.initNumberCounters();
      this.initDynamicIslandHeader();
      this.initThemeTransitions();

      // Pinned ScrollTriggers in strict top-to-bottom DOM order
      this.initRatioMotion(); // Section 5: Why Miracle IT (Tablet Story)
      if (typeof window.initWhoCanJoin === 'function') {
        window.initWhoCanJoin(); // Section 7: Who Can Join (Stacking Cards)
      }
      this.initCounsellingProcessTransition(); // Section 8: Counselling Process

      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.refresh();
      }

      this.initAnchorOffsetScroll();

      console.log('[MiracleMotion] Premium Skiper UI & Vengeance UI motion system initialized.');
    },

    /**
     * 1. Orchestrated Page Load Entrance Sequence (0–900ms)
     */
    initPageLoad() {
      const hero = document.querySelector('#hero');
      if (!hero) return;

      const header = document.querySelector('#siteHeader');
      const tag = hero.querySelector('.hero-tag');
      const title = hero.querySelector('.hero-title');
      const subtitle = hero.querySelector('.hero-subtitle');
      const ctas = hero.querySelector('.hero-cta-group');
      const badges = hero.querySelectorAll('.hero-trust-bar .trust-item');
      const visual = hero.querySelector('.hero-visual');

      // Helper to reveal an element smoothly
      const revealElement = (el, delay = 0, transformFrom = 'translateY(16px)', transformTo = 'translate(0, 0)') => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = transformFrom;
        el.style.transition = `opacity 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 650ms cubic-bezier(0.22, 1, 0.36, 1)`;

        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = transformTo;
        }, delay);
      };

      // Header entrance (120ms)
      if (header) {
        revealElement(header, 120, 'translateY(-14px)', 'translateY(0)');
      }

      // Hero Tag entrance (220ms)
      revealElement(tag, 220, 'translateY(14px)');

      // Hero Title entrance (320ms)
      revealElement(title, 320, 'translateY(18px)');

      // Hero Subtitle entrance (440ms)
      revealElement(subtitle, 440, 'translateY(16px)');

      // CTA Group entrance (560ms)
      revealElement(ctas, 560, 'translateY(14px)');

      // Trust Badges staggered entrance (660ms, 740ms, 820ms)
      badges.forEach((badge, index) => {
        revealElement(badge, 660 + (index * 80), 'translateY(12px)');
      });

      // Hero Developer Terminal entrance (380ms)
      if (visual) {
        revealElement(visual, 380, 'translateX(24px) scale(0.97)', 'translate(0, 0) scale(1)');
      }
    },

    /**
     * 2. Centralized Viewport Scroll Reveal & Stagger Engine
     */
    initScrollReveal() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers: show everything immediately
        document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .stagger-container, .fade-in-up')
          .forEach(el => el.classList.add('is-revealed', 'is-visible'));
        return;
      }

      // Auto-tag major section headers, card grids, and interactive containers
      document.querySelectorAll('.section-header').forEach(header => {
        header.classList.add('reveal-up');
      });

      document.querySelectorAll(
        '.problem-cards-grid, .courses-grid, .why-pillars-grid, .experience-grid, .who-grid, .proof-grid, .comparison-grid, .daily-routine-grid, .center-details-grid'
      ).forEach(grid => {
        grid.classList.add('stagger-container');
      });

      document.querySelectorAll(
        '.faq-accordion, .form-wrapper-card, .final-cta-content, .location-card, .ratio-breakdown-card, .proof-verification-notice, .courses-advisory-banner'
      ).forEach(block => {
        block.classList.add('reveal-up');
      });

      // Automatically configure stagger items inside stagger containers
      document.querySelectorAll('.stagger-container').forEach(container => {
        const items = container.querySelectorAll('.stagger-item, .card, .course-card, .who-card, .proof-card, .process-step-item, .routine-phase, .pillar-card');
        items.forEach((item, index) => {
          item.classList.add('stagger-item');
          item.style.setProperty('--stagger-delay', `${Math.min(index * 80, 480)}ms`);
        });
      });

      const observerOptions = {
        threshold: 0.14,
        rootMargin: '0px 0px -45px 0px'
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed', 'is-visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observe all motion targets
      const targets = document.querySelectorAll(
        '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .stagger-container, .section-header, .fade-in-up'
      );
      targets.forEach(target => this.observer.observe(target));
    },

    /**
     * 3. Hero Section Depth, Micro-Cards & Parallax Motion
     */
    initHeroMotion() {
      const hero = document.querySelector('#hero');
      if (!hero) return;

      const visual = hero.querySelector('.hero-visual');
      const terminal = hero.querySelector('.dev-terminal-window');
      const orbIndigo = hero.querySelector('.hero-orb-indigo');
      const orbCyan = hero.querySelector('.hero-orb-cyan');
      const heroContent = hero.querySelector('.hero-content');
      const floatCard1 = hero.querySelector('.float-card-1');
      const floatCard2 = hero.querySelector('.float-card-2');

      // A. Scroll-Based Subtle Parallax (RAF & Passive Listener)
      let ticking = false;

      const updateScrollParallax = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const heroHeight = hero.offsetHeight;

        // Run parallax calculations only while hero is in/near viewport
        if (scrollY <= heroHeight + 120 && window.innerWidth >= 768) {
          if (orbIndigo) {
            orbIndigo.style.transform = `translate3d(0, ${scrollY * 0.08}px, 0)`;
          }
          if (orbCyan) {
            orbCyan.style.transform = `translate3d(0, ${scrollY * 0.10}px, 0)`;
          }
          if (heroContent) {
            heroContent.style.transform = `translate3d(0, ${scrollY * 0.03}px, 0)`;
          }
          if (visual) {
            visual.style.transform = `translate3d(0, ${scrollY * -0.04}px, 0)`;
          }
        }
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking && !this.isReducedMotion) {
          window.requestAnimationFrame(updateScrollParallax);
          ticking = true;
        }
      }, { passive: true });

      // B. Subtle Desktop Mouse Tracking Parallax on Terminal Window
      if (window.innerWidth >= 992 && terminal) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let mouseTicking = false;

        const lerp = (start, end, factor) => start + (end - start) * factor;

        const updateMouseParallax = () => {
          currentX = lerp(currentX, mouseX, 0.08);
          currentY = lerp(currentY, mouseY, 0.08);

          terminal.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

          if (floatCard1) {
            floatCard1.style.transform = `translate3d(${(currentX * 1.5).toFixed(2)}px, ${(currentY * 1.5).toFixed(2)}px, 0)`;
          }
          if (floatCard2) {
            floatCard2.style.transform = `translate3d(${(currentX * -1.2).toFixed(2)}px, ${(currentY * -1.2).toFixed(2)}px, 0)`;
          }

          if (Math.abs(mouseX - currentX) > 0.05 || Math.abs(mouseY - currentY) > 0.05) {
            window.requestAnimationFrame(updateMouseParallax);
          } else {
            mouseTicking = false;
          }
        };

        hero.addEventListener('mousemove', (e) => {
          if (this.isReducedMotion) return;
          const rect = hero.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
          const relY = (e.clientY - rect.top) / rect.height - 0.5;

          // Clamped micro-movement: max -4px to +4px in X, -3px to +3px in Y
          mouseX = Math.max(-4, Math.min(4, relX * 8));
          mouseY = Math.max(-3, Math.min(3, relY * 6));

          if (!mouseTicking) {
            mouseTicking = true;
            window.requestAnimationFrame(updateMouseParallax);
          }
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
          mouseX = 0;
          mouseY = 0;
          if (!mouseTicking) {
            mouseTicking = true;
            window.requestAnimationFrame(updateMouseParallax);
          }
        });
      }
    },

    /**
     * 4. Skiper UI Dual-Ring Interactive Magnetic Cursor
     * Features:
     *  - Fast-reacting laser center dot
     *  - Smooth lagging outer halo ring with inertia lerp
     *  - Interactive mode changes (card spotlight halo, button magnet ring)
     *  - Contextual floating micro-badge ("EXPLORE", "SELECT", "PLAY")
     */
    initCursorFollower() {
      const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!isFinePointer || this.isReducedMotion) return;

      let dot = document.querySelector('#cursorDot');
      if (!dot) {
        dot = document.createElement('div');
        dot.id = 'cursorDot';
        dot.className = 'cursor-dot';
        dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dot);
      }

      let ring = document.querySelector('#cursorRing');
      if (!ring) {
        ring = document.createElement('div');
        ring.id = 'cursorRing';
        ring.className = 'cursor-ring';
        ring.setAttribute('aria-hidden', 'true');
        document.body.appendChild(ring);
      }

      let badge = document.querySelector('#cursorBadge');
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'cursorBadge';
        badge.className = 'cursor-badge';
        badge.setAttribute('aria-hidden', 'true');
        document.body.appendChild(badge);
      }

      let targetX = -100;
      let targetY = -100;
      let dotX = -100;
      let dotY = -100;
      let ringX = -100;
      let ringY = -100;
      let isVisible = false;
      let rafActive = false;

      const updateCursor = () => {
        // Fast tracking for center dot
        dotX += (targetX - dotX) * 0.45;
        dotY += (targetY - dotY) * 0.45;
        dot.style.transform = `translate3d(${dotX.toFixed(1)}px, ${dotY.toFixed(1)}px, 0)`;

        // Silky inertia lag for halo ring
        ringX += (targetX - ringX) * 0.16;
        ringY += (targetY - ringY) * 0.16;
        ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;

        // Badge floats slightly above ring
        badge.style.transform = `translate3d(${(ringX + 18).toFixed(1)}px, ${(ringY - 24).toFixed(1)}px, 0)`;

        if (isVisible) {
          window.requestAnimationFrame(updateCursor);
        } else {
          rafActive = false;
        }
      };

      window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;

        if (!isVisible) {
          isVisible = true;
          dot.classList.add('is-active');
          ring.classList.add('is-active');
          if (!rafActive) {
            rafActive = true;
            window.requestAnimationFrame(updateCursor);
          }
        }
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        isVisible = false;
        dot.classList.remove('is-active');
        ring.classList.remove('is-active');
        badge.classList.remove('is-visible');
      });

      // Interactive hover behaviors
      const cardSelector = '.card, .course-card, .who-card, .proof-card, .problem-card, .dev-terminal-window, .location-card';
      const actionSelector = 'a, button, input, select, textarea, [role="button"], [data-track-cta], .filter-tab, .dilemma-pill, .term-tab, .faq-trigger, .progress-pill, .matcher-chip';

      document.addEventListener('mouseover', (e) => {
        const cardTarget = e.target.closest(cardSelector);
        const actionTarget = e.target.closest(actionSelector);

        if (actionTarget) {
          ring.classList.add('cursor-hover');
          ring.classList.remove('cursor-card-hover');
          badge.classList.remove('is-visible');
        } else if (cardTarget) {
          ring.classList.add('cursor-card-hover');
          ring.classList.remove('cursor-hover');
          badge.textContent = 'EXPLORE';
          badge.classList.add('is-visible');
        }
      }, { passive: true });

      document.addEventListener('mouseout', (e) => {
        const cardTarget = e.target.closest(cardSelector);
        const actionTarget = e.target.closest(actionSelector);

        if (actionTarget) {
          ring.classList.remove('cursor-hover');
        }
        if (cardTarget) {
          ring.classList.remove('cursor-card-hover');
          badge.classList.remove('is-visible');
        }
      }, { passive: true });
    },

    /**
     * 5. Vengeance UI Bento Grid Dynamic Mouse Spotlight
     * Tracks cursor coordinates on all cards to create responsive radial illumination
     */
    initBentoSpotlight() {
      const cards = document.querySelectorAll(
        '.card, .course-card, .who-card, .proof-card, .pillar-card, .problem-card, .location-card, .form-wrapper-card, .faq-item, .routine-phase'
      );

      cards.forEach(card => {
        card.classList.add('bento-spotlight');

        card.addEventListener('mousemove', (e) => {
          if (this.isReducedMotion) return;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        }, { passive: true });
      });
    },

    /**
     * 6. Skiper UI 3D Perspective Tilt with Dynamic Specular Glare
     * Renders 3D physics tilt and moving light sheen on interactive cards
     */
    init3DTiltCards() {
      if (this.isReducedMotion || window.innerWidth < 992) return;

      const tiltTargets = document.querySelectorAll(
        '.tilt-card, .course-card, .dev-terminal-window, .hero-float-card, .proof-card, .who-card'
      );

      tiltTargets.forEach(el => {
        el.classList.add('tilt-card');
        
        // Ensure parent has perspective container class
        if (el.parentElement && !el.parentElement.classList.contains('tilt-card-container')) {
          el.parentElement.classList.add('tilt-card-container');
        }

        // Add specular glare overlay if not present
        if (!el.querySelector('.specular-glare')) {
          const glare = document.createElement('div');
          glare.className = 'specular-glare';
          glare.setAttribute('aria-hidden', 'true');
          el.appendChild(glare);
        }

        let isHovered = false;

        el.addEventListener('mouseenter', () => {
          isHovered = true;
          el.style.transition = 'transform 80ms ease-out, box-shadow 240ms ease';
        });

        el.addEventListener('mousemove', (e) => {
          if (!isHovered) return;
          const rect = el.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width;
          const relY = (e.clientY - rect.top) / rect.height;

          // Clamped tilt angles
          const rotX = ((relY - 0.5) * -12).toFixed(2);
          const rotY = ((relX - 0.5) * 12).toFixed(2);

          el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.018, 1.018, 1.018)`;
          el.style.setProperty('--glare-x', `${(relX * 100).toFixed(1)}%`);
          el.style.setProperty('--glare-y', `${(relY * 100).toFixed(1)}%`);
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
          isHovered = false;
          el.style.transition = 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms ease';
          el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
      });
    },

    /**
     * 7. Skiper UI Magnetic Physics Buttons
     * Elastic magnetic pull towards cursor within proximity radius
     */
    initMagneticButtons() {
      if (this.isReducedMotion || window.innerWidth < 992) return;

      const magneticTargets = document.querySelectorAll(
        '.btn-magnetic, .btn-primary, .hero-main-btn, .header-book-btn, .final-cta-btn, .nav-toggle'
      );

      magneticTargets.forEach(btn => {
        btn.classList.add('btn-magnetic');

        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;

          const pullX = (relX * 14).toFixed(1);
          const pullY = (relY * 12).toFixed(1);

          btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
        }, { passive: true });

        btn.addEventListener('mouseleave', () => {
          btn.style.transition = 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)';
          btn.style.transform = 'translate3d(0, 0, 0)';
          setTimeout(() => {
            btn.style.transition = '';
          }, 380);
        });
      });
    },

    /**
     * 8. GSAP Viewport Numerical Counter Engine
     * Automatically counts up numbers from 0 to target value on viewport scroll
     */
    initNumberCounters() {
      const counters = document.querySelectorAll('[data-counter-target], .ratio-stat-num');
      if (!counters.length) return;

      const animateCounter = (el) => {
        if (el.dataset.hasCounted) return;
        el.dataset.hasCounted = 'true';

        const rawText = el.textContent.trim();
        const target = parseFloat(el.getAttribute('data-counter-target') || rawText.replace(/[^0-9.]/g, ''));
        if (isNaN(target)) return;

        const prefix = rawText.match(/^[^0-9]*/) ? rawText.match(/^[^0-9]*/)[0] : '';
        const suffix = rawText.match(/[^0-9.]*$/) ? rawText.match(/[^0-9.]*$/)[0] : '';

        const duration = 1400;
        const startTime = performance.now();

        const step = (now) => {
          const progress = Math.min(1, (now - startTime) / duration);
          // Ease out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * easeOut);

          el.textContent = `${prefix}${current}${suffix}`;

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        };

        window.requestAnimationFrame(step);
      };

      if (!('IntersectionObserver' in window)) {
        counters.forEach(animateCounter);
        return;
      }

      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });

      counters.forEach(counter => counterObserver.observe(counter));
    },

    /**
     * 9. Skiper UI Dynamic Island Header Controller
     * Handles sticky glass morphing & gliding active pill navigation
     */
    initDynamicIslandHeader() {
      const header = document.querySelector('#siteHeader');
      if (!header) return;

      // Scroll morphing & top progress laser
      const progressBar = document.getElementById('scrollProgressBar');

      window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY > 30) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }

        if (progressBar) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
          progressBar.style.transform = `scaleX(${progress})`;
        }
      }, { passive: true });

      // Gliding pill navigation
      const navTrack = header.querySelector('.nav-pill-track');
      const glidingPill = header.querySelector('.nav-gliding-pill');
      const navLinks = header.querySelectorAll('.nav-pill-item, .nav-link');

      if (navTrack && glidingPill && navLinks.length) {
        const movePillTo = (target) => {
          const trackRect = navTrack.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const leftOffset = targetRect.left - trackRect.left;

          glidingPill.style.width = `${targetRect.width}px`;
          glidingPill.style.transform = `translateX(${leftOffset}px)`;
          glidingPill.classList.add('is-active');
        };

        navLinks.forEach(link => {
          link.addEventListener('mouseenter', () => movePillTo(link));
        });

        navTrack.addEventListener('mouseleave', () => {
          const currentLink = navTrack.querySelector('.nav-pill-item.is-current, .nav-link.is-current');
          if (currentLink) {
            movePillTo(currentLink);
          } else {
            glidingPill.classList.remove('is-active');
          }
        });
      }
    },

    /**
     * 5. Smooth Scroll-Based Theme Evolution (GSAP ScrollTrigger & IntersectionObserver)
     * Organically shifts canvas background and surface undertones smoothly as user scrolls.
     */
    initThemeTransitions() {
      const sections = document.querySelectorAll('section[data-theme], #hero, #final-cta');
      if (!sections.length) return;

      // Set baseline theme
      document.body.setAttribute('data-theme', 'obsidian');

      if (this.isReducedMotion) return;

      const applyTheme = (theme) => {
        if (!theme) return;
        document.body.setAttribute('data-theme', theme);
      };

      // Prefer GSAP ScrollTrigger for synchronous, silky 60fps theme transitions
      if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
        sections.forEach(section => {
          const theme = section.getAttribute('data-theme') || (section.id === 'hero' ? 'obsidian' : 'obsidian-glow');
          window.ScrollTrigger.create({
            trigger: section,
            start: 'top 75%',
            end: 'bottom 25%',
            onEnter: () => applyTheme(theme),
            onEnterBack: () => applyTheme(theme)
          });
        });
      } else if ('IntersectionObserver' in window) {
        const themeObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const theme = entry.target.getAttribute('data-theme') || 'obsidian';
              applyTheme(theme);
            }
          });
        }, {
          threshold: 0.2,
          rootMargin: '-10% 0px -30% 0px'
        });

        sections.forEach(section => themeObserver.observe(section));
      }
    },

    /**
    /**
     * 6. Cinematic Centered 5-Step Card Transitions on Scroll (Desktop >= 992px)
     * Cards stay centered; vertical scrolling smoothly transitions between the 5 cards.
     */
    initCounsellingProcessTransition() {
      const section = document.querySelector('#counselling-process');
      if (!section) return;

      const panels = Array.from(section.querySelectorAll('.counselling-step-panel'));
      if (!panels.length) return;

      // Guard: If GSAP or ScrollTrigger is not available or reduced motion is active
      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' || this.isReducedMotion) {
        panels.forEach(p => {
          p.classList.add('is-active');
          p.style.opacity = '1';
          p.style.visibility = 'visible';
          p.style.transform = 'none';
        });
        return;
      }

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.matchMedia({
        // DESKTOP / LARGE TABLET (>= 992px)
        "(min-width: 992px)": function() {
          // Reset initial states
          gsap.set(panels[0], { autoAlpha: 1, zIndex: 2 });
          const p0Outer = panels[0].querySelector('.step-outer');
          if (p0Outer) gsap.set(p0Outer, { y: 0, opacity: 1, scale: 1 });

          for (let i = 1; i < panels.length; i++) {
            gsap.set(panels[i], { autoAlpha: 0, zIndex: 1 });
            const outer = panels[i].querySelector('.step-outer');
            if (outer) gsap.set(outer, { y: 30, opacity: 0, scale: 0.98 });
          }

          // Master ScrollTrigger timeline pinned in place
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 76px",
              end: "+=2000",
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              scrub: true,
              invalidateOnRefresh: true
            }
          });

          // Sequence the transitions between the 5 panels
          for (let i = 0; i < panels.length - 1; i++) {
            const current = panels[i];
            const next = panels[i + 1];

            const curOuter = current.querySelector('.step-outer');
            const nextOuter = next.querySelector('.step-outer');

            const timePos = `step${i}`;
            tl.addLabel(timePos);

            // Outgoing panel gently fades & lifts up
            if (curOuter) {
              tl.to(curOuter, {
                y: -25,
                opacity: 0,
                scale: 0.97,
                ease: "power2.inOut",
                duration: 0.8
              }, timePos);
            }
            tl.set(current, { autoAlpha: 0, zIndex: 1 }, `${timePos}+=0.7`);

            // Incoming panel smoothly enters from below to center
            tl.set(next, { autoAlpha: 1, zIndex: i + 2 }, `${timePos}+=0.1`);
            if (nextOuter) {
              tl.fromTo(nextOuter,
                { y: 25, opacity: 0, scale: 0.97 },
                { y: 0, opacity: 1, scale: 1, ease: "power2.inOut", duration: 0.8 },
                `${timePos}+=0.1`
              );
            }
          }

          tl.addLabel("step4");

          return function() {
            tl.kill();
          };
        },

        // MOBILE & TABLET FALLBACK (< 992px)
        "(max-width: 991px)": function() {
          panels.forEach((p) => {
            gsap.set(p, { clearProps: "all" });
            const outer = p.querySelector('.step-outer');
            if (outer) gsap.set(outer, { clearProps: "all" });
          });
        }
      });

      // Ensure ScrollTriggers are sorted by true document order and refreshed
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    },

    /**
     * Backward-compatibility alias for existing caller points
     */
    initCounsellingHorizontalScroll() {
      this.initCounsellingProcessTransition();
    },

    /**
     * 5. The Miracle IT Difference — Realistic Tablet Device Frame & Horizontal Storytelling
     * Pinned desktop viewport: scrolling vertically slides content horizontally inside the tablet.
     */
    initWhyMiracleItTabletStory() {
      const section = document.querySelector('#why-miracle-it');
      if (!section) return;

      const track = section.querySelector('#tabletStoryTrack');
      const slides = Array.from(section.querySelectorAll('.tablet-slide'));
      const tabletDevice = section.querySelector('#whyTabletDevice');
      const stage = section.querySelector('.tablet-perspective-stage');
      if (!track || slides.length === 0) return;

      const dots = Array.from(section.querySelectorAll('.story-dot'));
      const chapterText = section.querySelector('#tabletChapterText');
      const progressBar = section.querySelector('#tabletProgressBar');
      const codingBar = section.querySelector('.ratio-coding');

      const chapterTitles = [
        'Chapter 1 of 5 • Classroom Formula',
        'Chapter 2 of 5 • Production Capstones',
        'Chapter 3 of 5 • 1-on-1 Code Audits',
        'Chapter 4 of 5 • Institution Matrix',
        'Chapter 5 of 5 • Transparency Pledge'
      ];

      // Guard: If GSAP or ScrollTrigger is not available or reduced motion is active
      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined' || this.isReducedMotion) {
        if (codingBar) codingBar.style.width = '70%';
        return;
      }

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // 1. Smooth Section Entrance: Tablet gently rises and scales into position as section nears viewport
      if (tabletDevice) {
        gsap.fromTo(tabletDevice,
          { y: 35, scale: 0.96, opacity: 0.85, rotateX: 2.5 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            rotateX: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 76px",
              scrub: 1
            }
          }
        );
      }

      // 2. Subtle Interactive 3D Mouse Parallax on Desktop
      if (stage && tabletDevice && window.innerWidth >= 992) {
        let isHovered = false;
        stage.addEventListener('mouseenter', () => { isHovered = true; });
        stage.addEventListener('mousemove', (e) => {
          if (!isHovered) return;
          const rect = stage.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(tabletDevice, {
            rotateY: x * 3.5,
            rotateX: -y * 3.5,
            duration: 0.6,
            ease: "power1.out",
            transformPerspective: 1400
          });
        });
        stage.addEventListener('mouseleave', () => {
          isHovered = false;
          gsap.to(tabletDevice, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.8,
            ease: "power2.out"
          });
        });
      }

      // Helper function to animate card contents on slide change
      let lastActiveSlide = -1;
      const animateSlideCards = (slideIdx) => {
        if (slideIdx === lastActiveSlide) return;
        lastActiveSlide = slideIdx;

        const currentSlide = slides[slideIdx];
        if (!currentSlide) return;

        if (slideIdx === 0) {
          // Slide 1: Routine phases stagger + coding bar fill
          const routinePhases = currentSlide.querySelectorAll('.routine-phase');
          const statPills = currentSlide.querySelectorAll('.stat-pill');
          if (routinePhases.length) {
            gsap.fromTo(routinePhases,
              { y: 16, opacity: 0.4 },
              { y: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: "power2.out" }
            );
          }
          if (statPills.length) {
            gsap.fromTo(statPills,
              { y: 12, opacity: 0.4 },
              { y: 0, opacity: 1, stagger: 0.06, duration: 0.4, ease: "power2.out" }
            );
          }
          if (codingBar) {
            gsap.fromTo(codingBar, { width: '0%' }, { width: '70%', duration: 0.7, ease: "power2.out" });
          }
        } else if (slideIdx === 1 || slideIdx === 2) {
          // Slide 2 & 3: Pillar cards float up smoothly
          const pillarCards = currentSlide.querySelectorAll('.pillar-story-card');
          if (pillarCards.length) {
            gsap.fromTo(pillarCards,
              { y: 20, opacity: 0.35, scale: 0.98 },
              { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.5, ease: "power2.out" }
            );
          }
        } else if (slideIdx === 3) {
          // Slide 4: Comparison rows cascade sequentially
          const compRows = currentSlide.querySelectorAll('.comp-row');
          if (compRows.length) {
            gsap.fromTo(compRows,
              { x: 22, opacity: 0.3 },
              { x: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: "power2.out" }
            );
          }
        } else if (slideIdx === 4) {
          // Slide 5: Transparency pledge card reveal
          const pledgeCard = currentSlide.querySelector('.pledge-card-wrap');
          const pledgePills = currentSlide.querySelectorAll('.pledge-pill');
          if (pledgeCard) {
            gsap.fromTo(pledgeCard,
              { scale: 0.96, opacity: 0.4, y: 12 },
              { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
          }
          if (pledgePills.length) {
            gsap.fromTo(pledgePills,
              { opacity: 0.3, y: 8 },
              { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: "power2.out" }
            );
          }
        }
      };

      ScrollTrigger.matchMedia({
        // DESKTOP (>= 992px)
        "(min-width: 992px)": function() {
          const maxPercent = -((slides.length - 1) * (100 / slides.length));

          // Set initial state
          gsap.set(track, { xPercent: 0 });
          if (progressBar) progressBar.style.width = '20%';

          // Trigger initial slide 1 animation
          animateSlideCards(0);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 76px",
              end: "+=3200",
              pin: true,
              anticipatePin: 1,
              scrub: 0.8,
              snap: {
                snapTo: [0, 0.25, 0.5, 0.75, 1.0],
                duration: { min: 0.3, max: 0.6 },
                delay: 0.05,
                ease: "power2.inOut"
              },
              onUpdate: (self) => {
                const p = self.progress; // 0 to 1
                
                // Progress bar fill inside tablet
                if (progressBar) {
                  const fillPct = 20 + p * 80;
                  progressBar.style.width = `${fillPct}%`;
                }

                // Active chapter index
                const activeIdx = Math.min(Math.floor(p * slides.length + 0.1), slides.length - 1);
                
                // Update dots
                dots.forEach((dot, idx) => {
                  dot.classList.toggle('is-active', idx === activeIdx);
                });

                // Update chapter text in OS bar
                if (chapterText && chapterTitles[activeIdx]) {
                  chapterText.textContent = chapterTitles[activeIdx];
                }

                // Trigger smooth card entrance for current slide
                animateSlideCards(activeIdx);
              }
            }
          });

          // Animate track horizontally from 0% to -80%
          tl.to(track, {
            xPercent: maxPercent,
            ease: "none",
            duration: 1
          });

          // Save globally so dot click handlers can reference
          window.whyTabletTimeline = tl;

          return function() {
            tl.kill();
            window.whyTabletTimeline = null;
          };
        },

        // MOBILE & TABLET FALLBACK (< 992px)
        "(max-width: 991px)": function() {
          gsap.set(track, { clearProps: "all" });
          if (codingBar) codingBar.style.width = '70%';
        }
      });
    },

    /**
     * Backward-compatibility alias
     */
    initRatioMotion() {
      this.initWhyMiracleItTabletStory();
    },

    /**
     * 6. Smooth Anchor Navigation with Sticky Header Offset
     */
    initAnchorOffsetScroll() {
      const headerHeight = 85;

      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (!href || href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();

            let targetScroll = 0;
            if (typeof window.ScrollTrigger !== 'undefined') {
              const allST = window.ScrollTrigger.getAll();
              const directST = allST.find(st => st.trigger === target || st.pin === target);
              if (directST) {
                targetScroll = directST.start + 2;
              } else {
                const tempST = window.ScrollTrigger.create({
                  trigger: target,
                  start: `top ${headerHeight}px`
                });
                targetScroll = tempST.start;
                tempST.kill();
              }
            } else {
              targetScroll = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            }

            window.scrollTo({
              top: Math.max(0, targetScroll),
              behavior: 'smooth'
            });

            // Close mobile navigation drawer if open
            const navMenu = document.querySelector('#navMenu');
            if (navMenu && navMenu.classList.contains('is-open')) {
              navMenu.classList.remove('is-open');
              const toggleBtn = document.querySelector('#navToggle');
              if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            }
          }
        });
      });
    },

    /**
     * Accessibility: Instantly reveal everything when reduced motion is preferred
     */
    disableDynamicMotion() {
      if (typeof window.ScrollTrigger !== 'undefined') {
        window.ScrollTrigger.getAll().forEach(t => t.kill());
      }
      document.querySelectorAll(
        '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .stagger-container, .stagger-item, .process-step-item, .fade-in-up, .counselling-step-panel'
      ).forEach(el => {
        el.classList.add('is-revealed', 'is-visible', 'step-visible', 'is-active');
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'none';
        el.style.filter = 'none';
        el.style.transition = 'none';
      });

      const codingSegment = document.querySelector('.ratio-coding');
      if (codingSegment) {
        codingSegment.style.width = '70%';
        codingSegment.style.transition = 'none';
      }
    }
  };

  // Expose globally
  window.MiracleMotion = MiracleMotion;

})(window, document);
