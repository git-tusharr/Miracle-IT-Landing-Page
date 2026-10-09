/**
 * CYBER SECURITY COURSE LANDING PAGE CONTROLLER
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
      course: 'Cyber Security & Ethical Hacking',
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

  // 3. Floating & Swapping Technology Cards Controller
  const floatingStage = document.getElementById('heroFloatingStage');
  const floatingCards = Array.from(document.querySelectorAll('.floating-card'));
  const swapDots = Array.from(document.querySelectorAll('.swap-dot'));
  const btnPrev = document.getElementById('heroSwapPrev');
  const btnNext = document.getElementById('heroSwapNext');

  if (floatingCards.length === 5) {
    let activeCardIndex = 0;
    let autoSwapTimer = null;
    let isHovered = false;

    function setSpotlight(index) {
      activeCardIndex = (index + 5) % 5;
      
      floatingCards.forEach((card, i) => {
        const pos = (i - activeCardIndex + 5) % 5;
        card.classList.remove('pos-0', 'pos-1', 'pos-2', 'pos-3', 'pos-4');
        card.classList.add(`pos-${pos}`);
      });

      // Update indicator dots
      swapDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeCardIndex);
      });
    }

    function nextCard() {
      setSpotlight(activeCardIndex + 1);
    }

    function prevCard() {
      setSpotlight(activeCardIndex - 1);
    }

    function startAutoSwap() {
      stopAutoSwap();
      autoSwapTimer = setInterval(() => {
        if (!isHovered) {
          nextCard();
        }
      }, 3400);
    }

    function stopAutoSwap() {
      if (autoSwapTimer) {
        clearInterval(autoSwapTimer);
        autoSwapTimer = null;
      }
    }

    // Click on any card to bring to center spotlight
    floatingCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        setSpotlight(index);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSpotlight(index);
        }
      });
    });

    // Control buttons
    if (btnNext) btnNext.addEventListener('click', () => { nextCard(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { prevCard(); });

    // Indicator dots
    swapDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        setSpotlight(i);
      });
    });

    // Pause on hover
    if (floatingStage) {
      floatingStage.addEventListener('mouseenter', () => { isHovered = true; });
      floatingStage.addEventListener('mouseleave', () => { isHovered = false; });
    }

    // Start auto swap loop
    startAutoSwap();
  }

  // 4. Structured 5-Stage Mastery Flow (Alternating Timeline Scroll Controller)
  const timelineContainer = document.getElementById('curriculumTimeline');
  const stageZones = Array.from(document.querySelectorAll('.timeline-stage-zone'));
  const nodeMarkers = Array.from(document.querySelectorAll('.timeline-node-checkpoint'));
  const progressBar = document.getElementById('timelineProgressBar');
  const timelineSpine = document.querySelector('.timeline-spine');
  const firstStageNode = document.querySelector('#stage-zone-1 .timeline-node-checkpoint') || (nodeMarkers.length > 0 ? nodeMarkers[0] : null);
  const endNode = document.querySelector('.timeline-end-node');

  let activeIndex = 0;
  let isProgrammaticScroll = false;

  function calibrateSpineTrack() {
    if (!timelineContainer || !timelineSpine || !firstStageNode || !endNode) return;

    const containerRect = timelineContainer.getBoundingClientRect();
    const firstNodeRect = firstStageNode.getBoundingClientRect();
    const endNodeRect = endNode.getBoundingClientRect();

    const startY = (firstNodeRect.top + firstNodeRect.height / 2) - containerRect.top;
    const endY = (endNodeRect.top + endNodeRect.height / 2) - containerRect.top;
    const totalSpineHeight = Math.max(0, endY - startY);

    timelineSpine.style.top = `${startY}px`;
    timelineSpine.style.height = `${totalSpineHeight}px`;
    timelineSpine.style.bottom = 'auto';
  }

  function setActiveStage(index, triggerAnimation = true) {
    if (index < 0 || index >= stageZones.length) return;
    if (activeIndex === index && stageZones[index].classList.contains('is-active')) return;
    
    activeIndex = index;

    stageZones.forEach((zone, idx) => {
      const marker = zone.querySelector('.timeline-node-checkpoint');
      if (idx === index) {
        zone.classList.add('is-active');
        if (marker) {
          marker.classList.add('is-active');
          marker.classList.remove('is-completed');
        }

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

  function updateTimelineOnScroll() {
    if (!timelineContainer || stageZones.length === 0 || !timelineSpine) return;

    const timelineRect = timelineContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight * 0.48;

    if (timelineRect.bottom < -100 || timelineRect.top > viewportHeight + 100) {
      return;
    }

    if (!timelineSpine.style.height || timelineSpine.offsetHeight === 0) {
      calibrateSpineTrack();
    }

    const spineRect = timelineSpine.getBoundingClientRect();

    if (spineRect.height > 0) {
      const currentScrollPastSpine = viewportCenter - spineRect.top;
      const progressRatio = Math.min(1, Math.max(0, currentScrollPastSpine / spineRect.height));
      if (progressBar) {
        progressBar.style.height = `${(progressRatio * 100).toFixed(1)}%`;
      }
    }

    if (isProgrammaticScroll) return;

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

  let scrollTicking = false;
  function onTimelineScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateTimelineOnScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onTimelineScroll, { passive: true });
  window.addEventListener('resize', () => {
    calibrateSpineTrack();
    updateTimelineOnScroll();
  }, { passive: true });
  window.addEventListener('load', () => {
    calibrateSpineTrack();
    updateTimelineOnScroll();
  });

  if (timelineContainer) {
    const curriculumImgs = timelineContainer.querySelectorAll('img');
    curriculumImgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => {
          calibrateSpineTrack();
          updateTimelineOnScroll();
        }, { once: true });
      }
    });
  }

  calibrateSpineTrack();
  updateTimelineOnScroll();
  setTimeout(calibrateSpineTrack, 250);
  setTimeout(calibrateSpineTrack, 750);

  stageZones.forEach((zone, idx) => {
    zone.addEventListener('mouseenter', () => {
      setActiveStage(idx, true);
    });
  });

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
          updateTimelineOnScroll();
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

        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-open');
            const otherTrigger = otherItem.querySelector('.faq-question-btn, .faq-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

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
        courseInterest: courseInterest?.value || 'Cyber Security & Ethical Hacking',
        visitDay: visitDay?.value || 'today',
        pageSource: 'cybersecurity_course_bhopal'
      };

      if (submitBtn) {
        if (typeof window.LeadService?.setButtonLoading === 'function') {
          window.LeadService.setButtonLoading(submitBtn, 'Securing Your Counselling Slot...');
        } else {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Securing Your Counselling Slot...</span>`;
        }
      }

      try {
        let res = null;
        if (typeof window.LeadService?.submitCounsellingForm === 'function') {
          res = await window.LeadService.submitCounsellingForm(payload);
        } else {
          throw new Error('Lead service is unavailable. Please call us directly.');
        }

        form.hidden = true;
        if (successState) {
          successState.hidden = false;
        }

        // Redirect to dedicated thank-you page (loader stays active until page transition)
        if (typeof window.LeadService?.redirectToThankYou === 'function') {
          window.LeadService.redirectToThankYou(payload);
        } else if (res?.thankYouUrl) {
          setTimeout(() => {
            window.location.href = res.thankYouUrl;
          }, 200);
        }
      } catch (err) {
        console.error('[Counselling Form Error]:', err);
        alert(err.message || 'There was an error saving your request. Please contact us directly via WhatsApp or phone.');
        if (submitBtn) {
          if (typeof window.LeadService?.resetButton === 'function') {
            window.LeadService.resetButton(submitBtn);
          } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Confirm Free Counselling Visit</span>`;
          }
        }
      }
    });
  }

  // 9. Location Media Tab Switcher & Copy Address
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

  // 10. GSAP Staggered Entrance
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && window.gsap) {
    window.gsap.from('.course-hero-left .hero-tag, .course-hero-title, .course-hero-subtitle, .course-hero-desc, .course-hero-cta-group, .hero-stats-row', {
      duration: 0.85,
      y: 24,
      opacity: 0,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'opacity,transform'
    });

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
});
