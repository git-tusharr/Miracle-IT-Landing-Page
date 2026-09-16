/**
 * COUNSELLING FORM CONTROLLER (v2.0 OPTIMIZED)
 * Comprehensive form validation, chip selectors, live phone status tick,
 * double-submit guard, and analytics tracking.
 */

function initCounsellingForm(container = document) {
  const form = container.querySelector('#counsellingForm') || document.querySelector('#counsellingForm');
  const successBox = container.querySelector('#formSuccessState') || document.querySelector('#formSuccessState');
  const submitBtn = container.querySelector('#submitBtn') || document.querySelector('#submitBtn');

  if (!form) return;

  let formStarted = false;
  let isSubmitting = false;

  // Track form_start on first interaction
  const handleFormStart = () => {
    if (!formStarted) {
      formStarted = true;
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('form_start', {
          form_name: 'counselling_visit_booking'
        });
      }
    }
  };

  form.querySelectorAll('input, select').forEach(field => {
    field.addEventListener('focus', handleFormStart, { once: true });
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group) group.classList.remove('has-error');
    });
  });

  // Real-time Phone Number Validation & Green Tick
  const phoneInput = form.querySelector('#phoneNumber');
  const phoneWrap = phoneInput?.closest('.phone-input-wrap');

  if (phoneInput && phoneWrap) {
    phoneInput.addEventListener('input', () => {
      const cleanPhone = phoneInput.value.replace(/[^0-9]/g, '');
      if (/^[6-9]\d{9}$/.test(cleanPhone)) {
        phoneWrap.classList.add('is-valid');
      } else {
        phoneWrap.classList.remove('is-valid');
      }
    });
  }

  // Interactive Visit Day Chips Sync
  const dayChips = form.querySelectorAll('.day-chip');
  const visitDaySelect = form.querySelector('#visitDay');

  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      handleFormStart();
      dayChips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');

      const selectedDay = chip.getAttribute('data-day');
      if (visitDaySelect) {
        visitDaySelect.value = selectedDay;
        visitDaySelect.closest('.visit-day-section')?.classList.remove('has-error');
      }
    });
  });

  // Interactive Course Chips Sync
  const courseChips = form.querySelectorAll('.form-course-chip');
  const courseSelect = form.querySelector('#courseInterest');
  if (courseChips.length && courseSelect) {
    courseChips.forEach(chip => {
      chip.addEventListener('click', () => {
        handleFormStart();
        courseChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const val = chip.getAttribute('data-val');
        courseSelect.value = val;
        courseSelect.dispatchEvent(new Event('change'));
        const group = courseSelect.closest('.form-group');
        if (group) group.classList.remove('has-error');
      });
    });

    courseSelect.addEventListener('change', () => {
      courseChips.forEach(c => {
        c.classList.toggle('is-active', c.getAttribute('data-val') === courseSelect.value);
      });
    });
  }

  // Validation function
  function validateField(inputEl, condition) {
    const group = inputEl.closest('.form-group, .visit-day-section');
    if (!condition) {
      if (group) group.classList.add('has-error');
      return false;
    } else {
      if (group) group.classList.remove('has-error');
      return true;
    }
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Check Honeypot for spam bots
    const honeypot = form.querySelector('input[name="_hp_security_check"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('[Form] Honeypot triggered.');
      return;
    }

    const nameInput = form.querySelector('#fullName');
    const courseSelect = form.querySelector('#courseInterest');
    const eduSelect = form.querySelector('#currentEducation');
    const daySelect = form.querySelector('#visitDay');
    const timeSelect = form.querySelector('#visitTime');

    // Validation checks
    const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
    const cleanPhone = phoneInput.value.replace(/[^0-9]/g, '');
    const isPhoneValid = validateField(phoneInput, /^[6-9]\d{9}$/.test(cleanPhone));
    const isCourseValid = validateField(courseSelect, Boolean(courseSelect.value));
    const isEduValid = validateField(eduSelect, Boolean(eduSelect.value));
    const isDayValid = validateField(daySelect, Boolean(daySelect.value));

    const isFormValid = isNameValid && isPhoneValid && isCourseValid && isEduValid && isDayValid;

    if (!isFormValid) {
      const firstError = form.querySelector('.has-error input, .has-error select, .has-error button');
      if (firstError) firstError.focus();
      return;
    }

    // Prepare Lead Payload
    const attribution = typeof window.getStoredAttribution === 'function' ? window.getStoredAttribution() : {};
    const leadPayload = {
      fullName: nameInput.value.trim(),
      phone: `+91${cleanPhone}`,
      courseInterest: courseSelect.value,
      currentEducation: eduSelect.value,
      preferredVisitDay: daySelect.value,
      preferredVisitTime: timeSelect ? timeSelect.value : 'Flexible',
      submissionTime: new Date().toISOString(),
      city: 'Bhopal',
      attribution
    };

    // Enter Loading State
    isSubmitting = true;
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      const response = await window.submitCounsellingForm(leadPayload);

      if (response && response.success) {
        // Analytics Events
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('form_submit', {
            course: leadPayload.courseInterest,
            education: leadPayload.currentEducation,
            visit_day: leadPayload.preferredVisitDay
          });
          window.trackEvent('visit_confirmed', {
            lead_id: response.leadId
          });
        }

        // Show Success UI
        form.hidden = true;
        if (successBox) {
          successBox.hidden = false;
          if (typeof window.applySiteConfig === 'function') {
            window.applySiteConfig(successBox);
          }
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        throw new Error(response?.message || 'Submission error');
      }
    } catch (err) {
      console.error('[Form Submit Error]:', err);
      alert('We could not record your request. Please call or WhatsApp our M.P. Nagar center directly.');
    } finally {
      isSubmitting = false;
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
}

if (typeof window !== 'undefined') {
  window.initCounsellingForm = initCounsellingForm;
}
