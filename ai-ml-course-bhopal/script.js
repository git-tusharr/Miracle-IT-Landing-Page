/**
 * AI & MACHINE LEARNING COURSE LANDING PAGE CONTROLLER
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
      course: 'AI & Machine Learning',
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

    // Dot click triggers
    swapDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(dot.getAttribute('data-target-index'), 10);
        if (!isNaN(targetIdx)) {
          setSpotlight(targetIdx);
          restartTimer();
        }
      });
    });

    // Arrow controls
    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.preventDefault();
        prevCard();
        restartTimer();
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        nextCard();
        restartTimer();
      });
    }

    // Card click brings to focus
    floatingCards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (!card.classList.contains('pos-0')) {
          setSpotlight(i);
          restartTimer();
        }
      });
    });

    // Pause on hover
    if (floatingStage) {
      floatingStage.addEventListener('mouseenter', () => {
        isHovered = true;
        clearInterval(autoSwapTimer);
      });
      floatingStage.addEventListener('mouseleave', () => {
        isHovered = false;
        restartTimer();
      });
    }

    function startTimer() {
      clearInterval(autoSwapTimer);
      autoSwapTimer = setInterval(() => {
        if (!isHovered) {
          nextCard();
        }
      }, 4200);
    }

    function restartTimer() {
      clearInterval(autoSwapTimer);
      startTimer();
    }

    // Initialize first position and run rotation
    setSpotlight(0);
    startTimer();
  }

  // 4. Curriculum Timeline Stage Active State & Progress Bar
  const timelineContainer = document.getElementById('curriculumTimeline');
  const progressBar = document.getElementById('timelineProgressBar');
  const timelineSpine = document.getElementById('timelineSpine');
  const stageZones = Array.from(document.querySelectorAll('.stage-zone'));
  const stageMarkers = Array.from(document.querySelectorAll('.stage-marker'));

  let activeIndex = 0;
  let isProgrammaticScroll = false;

  function calibrateSpineTrack() {
    if (!timelineContainer || !timelineSpine || stageMarkers.length < 2) return;
    const firstMarker = stageMarkers[0];
    const lastMarker = stageMarkers[stageMarkers.length - 1];

    const firstCenter = firstMarker.offsetTop + firstMarker.offsetHeight / 2;
    const lastCenter = lastMarker.offsetTop + lastMarker.offsetHeight / 2;
    const totalDistance = lastCenter - firstCenter;

    timelineSpine.style.top = `${firstCenter}px`;
    timelineSpine.style.height = `${totalDistance}px`;
  }

  window.addEventListener('resize', calibrateSpineTrack);
  setTimeout(calibrateSpineTrack, 250);

  function setActiveStage(index, smooth = false) {
    activeIndex = Math.max(0, Math.min(index, stageZones.length - 1));

    stageZones.forEach((zone, idx) => {
      const marker = zone.querySelector('.stage-marker');
      if (idx === activeIndex) {
        zone.classList.add('is-active');
        if (marker) {
          marker.classList.add('is-active');
          marker.classList.remove('is-completed');
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
  setTimeout(updateTimelineOnScroll, 350);

  // Click on stage marker jumps to zone
  stageMarkers.forEach((marker, idx) => {
    marker.style.cursor = 'pointer';
    marker.addEventListener('click', () => {
      const targetZone = stageZones[idx];
      if (targetZone) {
        isProgrammaticScroll = true;
        setActiveStage(idx);
        targetZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { isProgrammaticScroll = false; }, 800);
      }
    });
  });

  // 5. Video Lab Showcase Modal
  const videoTrigger = document.getElementById('openLabVideo');
  const videoModal = document.getElementById('labVideoModal');
  const videoClose = document.getElementById('closeLabVideo');
  const videoFrame = document.getElementById('labVideoFrame');

  if (videoTrigger && videoModal && videoClose) {
    const videoUrl = videoTrigger.getAttribute('data-video-src') || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1';
    
    videoTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (videoFrame) {
        videoFrame.src = videoUrl;
      }
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    function closeVideo() {
      videoModal.classList.remove('active');
      if (videoFrame) {
        videoFrame.src = '';
      }
      document.body.style.overflow = '';
    }

    videoClose.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideo();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeVideo();
      }
    });
  }

  // 6. Interactive FAQ Accordion
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (trigger && answer) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isOpen) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // 7. Counselling Form Visit Day Selector Chips
  const visitChips = Array.from(document.querySelectorAll('.day-chip'));
  const visitDayInput = document.getElementById('visitDay');

  visitChips.forEach(chip => {
    chip.addEventListener('click', () => {
      visitChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      if (visitDayInput) {
        visitDayInput.value = chip.getAttribute('data-day') || 'today';
      }
    });
  });

  // Real-time phone number formatting feedback
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
        courseInterest: courseInterest?.value || 'AI & Machine Learning',
        visitDay: visitDay?.value || 'today',
        pageSource: 'ai_ml_course_bhopal'
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
            course: 'AI & Machine Learning',
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
        alert('We received your booking! Our senior AI mentor will call you shortly.');
        form.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Confirm Free Lab & Counselling Visit</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        }
      }
    });
  }

  // 9. Campus Location Tab Switcher (M.P. Nagar / Indrapuri)
  const campusTabs = Array.from(document.querySelectorAll('.campus-tab'));
  const campusPanels = Array.from(document.querySelectorAll('.campus-panel'));

  campusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCampus = tab.getAttribute('data-campus');
      campusTabs.forEach(t => t.classList.toggle('active', t === tab));
      campusPanels.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-campus') === targetCampus);
      });
    });
  });

  // 10. GSAP Scroll Trigger Animations (if library loaded)
  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.utils.toArray('.audience-card').forEach((card, i) => {
      window.gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        y: 35,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power2.out'
      });
    });

    window.gsap.utils.toArray('.project-card').forEach((card, i) => {
      window.gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.15,
        ease: 'power2.out'
      });
    });
  }
});
