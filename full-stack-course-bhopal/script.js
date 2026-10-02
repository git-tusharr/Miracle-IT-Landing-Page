/**
 * FULL STACK COURSE LANDING PAGE CONTROLLER
 * Miracle IT Career Academy • Bhopal
 * Vanilla JS (ES6+) with GSAP 3.12.5 & ScrollTrigger Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Central Site Config & Analytics Initialization
  if (typeof window.applySiteConfig === 'function') {
    window.applySiteConfig(document);
  }
  if (typeof window.Analytics?.initCTATracking === 'function') {
    window.Analytics.initCTATracking(document);
  }
  if (typeof window.trackEvent === 'function') {
    window.trackEvent('view_course', { 
      course: 'Full Stack Web Development',
      city: 'Bhopal',
      campus: 'M.P. Nagar'
    });
  }

  // 2. Initialize Shared Components (Homepage Header & Footer)
  if (typeof window.initHeader === 'function') {
    window.initHeader(document);
  }
  if (typeof window.initFooter === 'function') {
    window.initFooter(document);
  }

  // 3. Hero Layered System Micro Interactions
  const heroCards = document.querySelectorAll('.hero-layer-card');
  heroCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      heroCards.forEach(c => {
        if (c !== card) c.style.opacity = '0.75';
      });
    });
    card.addEventListener('mouseleave', () => {
      heroCards.forEach(c => {
        c.style.opacity = '';
      });
    });
  });

  // 4. Structured 5-Stage Mastery Flow (Alternating Timeline Scroll & Hover Controller)
  const timelineContainer = document.getElementById('curriculumTimeline');
  const stageZones = Array.from(document.querySelectorAll('.timeline-stage-zone'));
  const nodeMarkers = Array.from(document.querySelectorAll('.timeline-node-marker'));
  const progressBar = document.getElementById('timelineProgressBar');

  let activeIndex = 0;
  let isProgrammaticScroll = false;

  function setActiveStage(index, triggerAnimation = true) {
    if (index < 0 || index >= stageZones.length) return;
    if (activeIndex === index && stageZones[index].classList.contains('is-active')) return;
    
    activeIndex = index;

    stageZones.forEach((zone, idx) => {
      const marker = zone.querySelector('.timeline-node-marker');
      if (idx === index) {
        zone.classList.add('is-active');
        if (marker) {
          marker.classList.add('is-active');
          marker.classList.remove('is-completed');
        }

        // Trigger subtle animation if GSAP is available
        if (triggerAnimation && typeof gsap !== 'undefined') {
          const isOdd = (idx + 1) % 2 !== 0;
          const textCard = zone.querySelector('.stage-text-card');
          const visualCard = zone.querySelector('.stage-visual-card');

          if (textCard && visualCard) {
            const textFromX = isOdd ? -20 : 20;
            const visualFromX = isOdd ? 20 : -20;

            gsap.fromTo(textCard,
              { x: textFromX, opacity: 0.7 },
              { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' }
            );

            gsap.fromTo(visualCard,
              { x: visualFromX, scale: 0.98 },
              { x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.2)', overwrite: 'auto' }
            );
          }
        }
      } else {
        zone.classList.remove('is-active');
        if (marker) {
          marker.classList.remove('is-active');
          if (idx < index) {
            marker.classList.add('is-completed');
          } else {
            marker.classList.remove('is-completed');
          }
        }
      }
    });
  }

  // Calculate viewport center alignment to highlight whichever stage is in view
  function updateTimelineOnScroll() {
    if (isProgrammaticScroll || !timelineContainer || stageZones.length === 0) return;

    const timelineRect = timelineContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    // Check if timeline is in viewport
    if (timelineRect.bottom < 100 || timelineRect.top > viewportHeight - 100) {
      return;
    }

    // 1. Calculate Progress Bar Fill Height along the spine
    const firstZone = stageZones[0];
    const lastZone = stageZones[stageZones.length - 1];
    const firstRect = firstZone.getBoundingClientRect();
    const lastRect = lastZone.getBoundingClientRect();
    const timelineTop = firstRect.top + firstRect.height / 2;
    const timelineBottom = lastRect.top + lastRect.height / 2;
    const totalDistance = timelineBottom - timelineTop;

    if (totalDistance > 0) {
      const scrolled = viewportCenter - timelineTop;
      const progress = Math.min(1, Math.max(0, scrolled / totalDistance));
      if (progressBar) {
        progressBar.style.height = `${(progress * 100).toFixed(1)}%`;
      }
    }

    // 2. Determine which stage is closest to viewport center
    let closestIndex = 0;
    let minDistance = Infinity;

    stageZones.forEach((zone, idx) => {
      const rect = zone.getBoundingClientRect();
      const zoneCenter = rect.top + rect.height / 2;
      const distance = Math.abs(zoneCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveStage(closestIndex, true);
    }
  }

  // Bind scroll and resize with passive listener for butter-smooth 60-120fps response
  window.addEventListener('scroll', updateTimelineOnScroll, { passive: true });
  window.addEventListener('resize', updateTimelineOnScroll, { passive: true });

  // Initial call on load
  updateTimelineOnScroll();

  // Hover highlighting: Hovering over any stage zone immediately highlights it
  stageZones.forEach((zone, idx) => {
    zone.addEventListener('mouseenter', () => {
      setActiveStage(idx, true);
    });
  });

  // Secondary interaction: Click node to smoothly scroll to that stage zone
  nodeMarkers.forEach(marker => {
    marker.addEventListener('click', (e) => {
      e.preventDefault();
      const targetStage = marker.getAttribute('data-target-stage');
      const targetIdx = parseInt(targetStage, 10) - 1;
      const targetZone = document.getElementById(`stage-zone-${targetStage}`);

      if (targetZone) {
        isProgrammaticScroll = true;
        setActiveStage(targetIdx, true);
        targetZone.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          isProgrammaticScroll = false;
        }, 800);
      }
    });
  });

  // GSAP Entrance for Section Header
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '.curriculum-section',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.fromTo('.curriculum-section-head',
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }
        );
      }
    });
  }

  // 5. Accessible FAQ Accordion Controller
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-question-btn, .faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isCurrentlyOpen = item.classList.contains('is-open');

        // Close other FAQ items for a clean single-open accordion feel
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-open');
            const otherTrigger = otherItem.querySelector('.faq-question-btn, .faq-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        if (isCurrentlyOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 6. Visit Day Selection Chips
  const dayChips = document.querySelectorAll('.day-chip-btn');
  const visitDayInput = document.getElementById('visitDay');
  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dayChips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      if (visitDayInput) {
        visitDayInput.value = chip.getAttribute('data-day') || 'today';
      }
    });
  });

  // 7. Live 10-Digit Indian Phone Number Feedback
  const phoneInput = document.getElementById('phoneNumber');
  const phoneWrap = phoneInput?.closest('.phone-input-wrap');
  if (phoneInput && phoneWrap) {
    phoneInput.addEventListener('input', () => {
      const clean = phoneInput.value.replace(/\D/g, '');
      if (/^[6-9]\d{9}$/.test(clean)) {
        phoneWrap.style.borderColor = '#10B981';
      } else {
        phoneWrap.style.borderColor = '';
      }
    });
  }

  // 8. Lead Capture Form Submission with Validation
  const form = document.getElementById('counsellingForm');
  const successState = document.getElementById('formSuccessState');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      const fullName = document.getElementById('fullName');
      const phoneNumber = document.getElementById('phoneNumber');
      const educationBackground = document.getElementById('educationBackground');
      const preferredTiming = document.getElementById('preferredTiming');
      const courseInterest = document.getElementById('courseInterest');
      const visitDay = document.getElementById('visitDay');

      // Validate Name
      const nameVal = fullName?.value.trim() || '';
      if (nameVal.length < 2) {
        isValid = false;
        fullName?.closest('.form-group')?.classList.add('has-error');
      } else {
        fullName?.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate Phone
      const rawPhone = phoneNumber?.value.replace(/\D/g, '') || '';
      if (!/^[6-9]\d{9}$/.test(rawPhone)) {
        isValid = false;
        phoneNumber?.closest('.form-group')?.classList.add('has-error');
      } else {
        phoneNumber?.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate Educational Background
      const eduVal = educationBackground?.value || '';
      if (!eduVal) {
        isValid = false;
        educationBackground?.closest('.form-group')?.classList.add('has-error');
      } else {
        educationBackground?.closest('.form-group')?.classList.remove('has-error');
      }

      if (!isValid) {
        const firstError = form.querySelector('.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Submit payload via LeadService
      const payload = {
        fullName: nameVal,
        phoneNumber: rawPhone,
        educationBackground: eduVal,
        preferredTiming: preferredTiming?.value || 'morning_slot',
        courseInterest: courseInterest?.value || 'Full Stack Web Development',
        visitDay: visitDay?.value || 'today',
        pageSource: 'full_stack_course_bhopal'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Securing Your Counselling Slot...</span>`;
      }

      try {
        if (typeof window.LeadService?.submitCounsellingForm === 'function') {
          await window.LeadService.submitCounsellingForm(payload);
        } else {
          await new Promise(r => setTimeout(r, 600));
        }

        if (typeof window.trackEvent === 'function') {
          window.trackEvent('lead_submitted', {
            course: 'Full Stack Web Development',
            profile: eduVal
          });
        }

        form.hidden = true;
        if (successState) {
          successState.hidden = false;
          successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        console.error('[Counselling Form Error]:', err);
        alert(err.message || 'There was an error saving your request. Please contact us directly via WhatsApp or phone.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Confirm Free Counselling Visit</span>`;
        }
      }
    });
  }

  // 9. Location Media Tab Switcher (Google Map vs Campus Lab Photo) & Copy Address
  const locationSection = document.getElementById('location');
  if (locationSection) {
    const mediaTabs = locationSection.querySelectorAll('.media-tab');
    const mediaPanels = locationSection.querySelectorAll('.media-view-panel');

    mediaTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-view');

        mediaTabs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        mediaPanels.forEach(panel => {
          if (panel.id === `view-${targetView}`) {
            panel.classList.add('is-active');
            panel.hidden = false;
          } else {
            panel.classList.remove('is-active');
            panel.hidden = true;
          }
        });
      });
    });
  }

  const btnCopyAddress = document.getElementById('btn-copy-address');
  const copyBtnText = document.getElementById('copy-btn-text');
  if (btnCopyAddress) {
    btnCopyAddress.addEventListener('click', () => {
      const addressElem = document.getElementById('campus-full-address');
      const addressText = addressElem ? addressElem.textContent.trim() : "Plot No.80, 3rd Floor, Aakriti Complex, Zone-2, M.P. Nagar, Bhopal, M.P.";
      navigator.clipboard.writeText(addressText).then(() => {
        if (copyBtnText) copyBtnText.textContent = "Address Copied!";
        btnCopyAddress.classList.add('is-copied');
        btnCopyAddress.style.borderColor = "#10B981";
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = "Copy Address";
          btnCopyAddress.classList.remove('is-copied');
          btnCopyAddress.style.borderColor = "";
        }, 2000);
      }).catch(err => {
        console.warn('Clipboard copy error:', err);
      });
    });
  }

  // 10. Hero 19 Staggered Entrance & Spring-Damped Parallax (Hero Section)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && window.gsap) {
    // A. Left Column Copy Staggered Entrance
    window.gsap.from('.course-hero-left .hero-tag, .course-hero-title, .course-hero-subtitle, .course-hero-desc, .course-hero-cta-group, .hero-stats-row', {
      duration: 0.85,
      y: 24,
      opacity: 0,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'opacity,transform'
    });

    // B. Flow Connector Pill Entrance
    window.gsap.from('.hero-flow-pill', {
      duration: 0.85,
      y: -15,
      opacity: 0,
      delay: 0.2,
      ease: 'power3.out',
      clearProps: 'opacity'
    });

    // C. Layered Panels Cinematic Entrance with Distinct Initial Offsets & Rotations
    const panelConfigs = [
      { sel: '.panel-frontend', y: 35, x: -25, rot: -6, scale: 0.94, delay: 0.12 },
      { sel: '.panel-backend',  y: 45, x: 28,  rot: 7,  scale: 0.93, delay: 0.22 },
      { sel: '.panel-database', y: 40, x: -18, rot: -5, scale: 0.92, delay: 0.32 },
      { sel: '.panel-projects', y: 50, x: 20,  rot: 4,  scale: 0.95, delay: 0.42 }
    ];

    panelConfigs.forEach(cfg => {
      window.gsap.from(cfg.sel, {
        duration: 1.0,
        y: cfg.y,
        x: cfg.x,
        rotation: cfg.rot,
        scale: cfg.scale,
        opacity: 0,
        delay: cfg.delay,
        ease: 'power3.out',
        clearProps: 'opacity'
      });
    });

    // D. Spring-Damped Mouse Parallax on Desktop (>= 1024px)
    const heroSection = document.getElementById('overview');
    const heroPanels = document.querySelectorAll('.hero-layer-card');

    if (heroSection && heroPanels.length && window.innerWidth >= 1024) {
      let rect = heroSection.getBoundingClientRect();
      const onResize = () => { rect = heroSection.getBoundingClientRect(); };
      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('scroll', onResize, { passive: true });

      heroSection.addEventListener('mousemove', (e) => {
        const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        heroPanels.forEach(panel => {
          const depth = parseFloat(panel.getAttribute('data-depth')) || 0.035;
          const moveX = relX * (depth * 450);
          const moveY = relY * (depth * 350);

          window.gsap.to(panel, {
            x: moveX,
            y: moveY,
            duration: 1.2,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        heroPanels.forEach(panel => {
          window.gsap.to(panel, {
            x: 0,
            y: 0,
            duration: 1.4,
            ease: 'elastic.out(1, 0.75)',
            overwrite: 'auto'
          });
        });
      });
    }

    // E. Scroll-Based Parallax Depth with ScrollTrigger on Desktop
    if (window.ScrollTrigger && window.innerWidth >= 1024) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      window.gsap.to('.panel-frontend', {
        y: -30,
        scrollTrigger: {
          trigger: '.course-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      window.gsap.to('.panel-backend', {
        y: -20,
        scrollTrigger: {
          trigger: '.course-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      window.gsap.to('.panel-database', {
        y: 25,
        scrollTrigger: {
          trigger: '.course-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      window.gsap.to('.panel-projects', {
        y: -40,
        scrollTrigger: {
          trigger: '.course-hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      // 11. Staggered Entrance for Stacked Feature Cards (How You'll Learn)
      window.gsap.from('.method-sticky-hero', {
        scrollTrigger: {
          trigger: '.learning-method-section',
          start: 'top 82%',
          once: true
        },
        duration: 0.85,
        y: 28,
        opacity: 0,
        ease: 'power3.out',
        clearProps: 'opacity,transform'
      });

      window.gsap.from('.stacked-card', {
        scrollTrigger: {
          trigger: '.stacked-cards-column',
          start: 'top 85%',
          once: true
        },
        duration: 0.75,
        y: 35,
        opacity: 0,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'opacity,transform'
      });
    }
  }
});

