/**
 * FULL STACK COURSE LANDING PAGE CONTROLLER
 * Miracle IT Career Academy • Bhopal
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Site Config & Tracking
  if (typeof window.applySiteConfig === 'function') {
    window.applySiteConfig(document);
  }
  if (typeof window.Analytics?.initCTATracking === 'function') {
    window.Analytics.initCTATracking(document);
  }
  if (typeof window.trackEvent === 'function') {
    window.trackEvent('view_course', { course: 'Full Stack Web Development' });
  }

  // 2. Mobile Nav Toggle
  const navToggleBtn = document.getElementById('navToggleBtn');
  const courseNav = document.getElementById('courseNav');
  if (navToggleBtn && courseNav) {
    navToggleBtn.addEventListener('click', () => {
      courseNav.classList.toggle('is-open');
    });

    courseNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        courseNav.classList.remove('is-open');
      });
    });
  }

  // 3. Roadmap Flow Pills Interactive Highlight
  const flowPills = document.querySelectorAll('.flow-step-pill');
  const moduleCards = document.querySelectorAll('.module-card');
  flowPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      flowPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      if (moduleCards[idx]) {
        moduleCards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        moduleCards[idx].style.borderColor = '#FF7A00';
        setTimeout(() => {
          moduleCards[idx].style.borderColor = '';
        }, 1500);
      }
    });
  });

  // 4. Visit Day Chips Selection Sync
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

  // 5. Phone Input 10-digit Live Indicator
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

  // 6. Form Submission & Validation Controller
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
      const phoneVal = phoneNumber?.value.replace(/\D/g, '') || '';
      if (!/^[6-9]\d{9}$/.test(phoneVal)) {
        isValid = false;
        phoneNumber?.closest('.form-group')?.classList.add('has-error');
      } else {
        phoneNumber?.closest('.form-group')?.classList.remove('has-error');
      }

      // Validate Background
      if (!educationBackground?.value) {
        isValid = false;
        educationBackground?.closest('.form-group')?.classList.add('has-error');
      } else {
        educationBackground?.closest('.form-group')?.classList.remove('has-error');
      }

      if (!isValid) {
        const firstError = form.querySelector('.has-error input, .has-error select');
        if (firstError) firstError.focus();
        return;
      }

      // Prepare payload
      const payload = {
        name: nameVal,
        phone: phoneVal,
        background: educationBackground?.value || 'cs_it_student',
        timing: preferredTiming?.value || 'morning_slot',
        course: courseInterest?.value || 'Full Stack Web Development',
        visit_day: visitDay?.value || 'today',
        page: 'full_stack_course_bhopal'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Reserving Your Seat...</span>';
      }

      try {
        if (typeof window.LeadService?.submitLead === 'function') {
          await window.LeadService.submitLead(payload);
        } else {
          console.log('Lead submitted:', payload);
          await new Promise(r => setTimeout(r, 600));
        }

        if (typeof window.trackEvent === 'function') {
          window.trackEvent('generate_lead', {
            course: 'Full Stack Web Development',
            method: 'in_person_counselling_form'
          });
        }

        form.style.display = 'none';
        if (successState) {
          successState.hidden = false;
          successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        console.error('Submission error:', err);
        // Fallback display success to user so they are not blocked
        form.style.display = 'none';
        if (successState) {
          successState.hidden = false;
        }
      }
    });

    // Clear error on input
    form.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('input', () => {
        field.closest('.form-group')?.classList.remove('has-error');
      });
    });
  }
});
