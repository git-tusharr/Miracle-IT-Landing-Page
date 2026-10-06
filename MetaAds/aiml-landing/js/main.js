/* ==========================================================================
   Miracle IT Career Academy | AI & Machine Learning Course
   Plain JavaScript, zero dependencies.
   ========================================================================== */
(() => {
  'use strict';

  const CONFIG = {
    leadEndpoint: '',          // Google Apps Script Web App URL or CRM webhook
    metaPixelId: '',           // Meta Pixel ID

    phone: '+917880003127',
    whatsapp: '917880003127',
    whatsappText: 'Hi Miracle IT, I want to book a free counselling & demo class for the AI & Machine Learning course.',
    course: 'AI & Machine Learning Course'
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Meta Pixel (loads only when an ID is set) ---------- */
  function loadPixel(id) {
    if (!id) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }
  const track = (name, data, opts) => {
    if (typeof window.fbq === 'function') window.fbq('track', name, data || {}, opts || {});
  };
  loadPixel(CONFIG.metaPixelId);

  /* ---------- Campaign attribution (UTMs, fbclid, Meta cookies) ---------- */
  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid'];
  const cookie = (n) => (document.cookie.match('(?:^|; )' + n + '=([^;]*)') || [])[1] || '';

  function captureAttribution() {
    try {
      const q = new URLSearchParams(location.search);
      ATTR_KEYS.forEach(k => { const v = q.get(k); if (v) sessionStorage.setItem('mi_' + k, v); });
      if (!sessionStorage.getItem('mi_landing')) {
        sessionStorage.setItem('mi_landing', location.href);
        sessionStorage.setItem('mi_referrer', document.referrer || 'direct');
      }
    } catch (_) { /* storage fallback */ }
  }
  function getAttribution() {
    const out = {};
    try {
      ATTR_KEYS.forEach(k => { out[k] = sessionStorage.getItem('mi_' + k) || ''; });
      out.landing_url = sessionStorage.getItem('mi_landing') || location.href;
      out.referrer = sessionStorage.getItem('mi_referrer') || document.referrer || 'direct';
    } catch (_) { out.landing_url = location.href; }
    out.fbp = cookie('_fbp');
    out.fbc = cookie('_fbc') || (out.fbclid ? 'fb.1.' + Date.now() + '.' + out.fbclid : '');
    return out;
  }
  captureAttribution();

  /* ---------- WhatsApp & Call Link Handling ---------- */
  const waLink = (name) => {
    let text = CONFIG.whatsappText;
    if (name) text += ' My name is ' + name + '.';
    return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text);
  };
  $$('[data-wa]').forEach(a => {
    a.href = waLink();
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-phone], a[data-wa]');
    if (!a) return;
    track('Contact', { content_name: a.hasAttribute('data-wa') ? 'WhatsApp' : 'Call', content_category: CONFIG.course });
  });

  /* ---------- Mobile Drawer Navigation ---------- */
  const menuToggle = $('#menuToggle');
  const mobileDrawer = $('#mobileDrawer');
  const drawerClose = $('#drawerClose');
  const drawerBackdrop = $('#drawerBackdrop');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (menuToggle) {
      menuToggle.classList.add('is-active');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close menu');
    }
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (menuToggle) {
      menuToggle.classList.remove('is-active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
    }
    document.body.classList.remove('drawer-open');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer && mobileDrawer.classList.contains('is-open');
      if (isOpen) closeDrawer();
      else openDrawer();
    });
  }
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  $$('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  /* ---------- "Book free seat" smooth scroll to form ---------- */
  const card = $('#lead-form');
  const nameInput = $('#f-name');
  $$('[data-book]').forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    closeDrawer();
    if (card) {
      card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => { if (nameInput) nameInput.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
    }
  }));

  /* ---------- Header Shadow & Sticky Dock Visibility ---------- */
  const header = $('.site-header');
  const dock = $('#dock');
  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
  }, { passive: true });

  if (dock && card && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      // Hide dock when form card is in view
      dock.classList.toggle('is-hidden', entry.isIntersecting);
    }, { threshold: 0.25 });
    observer.observe(card);
  }

  /* ---------- Lead Form Validation & Submission ---------- */
  const form = $('#leadForm');
  const submitBtn = $('#submitBtn');
  const formBody = $('#formBody');
  const formDone = $('#formDone');

  const normalisePhone = (v) => {
    let d = v.replace(/\D/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
    return d;
  };

  const rules = {
    name:   (v) => (v.trim().length >= 2 && /[A-Za-z\u0900-\u097F]/.test(v)) ? '' : 'Please enter your full name.',
    phone:  (v) => /^[6-9]\d{9}$/.test(normalisePhone(v)) ? '' : 'Please enter a valid 10-digit mobile number.',
    email:  (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) ? '' : 'Please enter a valid email address.',
    status: (v) => v ? '' : 'Please choose your current background.'
  };

  const fieldOf = (el) => el.closest('.form-field') || el.parentElement;
  const errOf = (key) => $('#e-' + key);

  function setError(key, msg) {
    const input = form.elements[key];
    if (!input) return;
    const box = errOf(key);
    const parent = fieldOf(input);
    if (parent) parent.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) {
      box.textContent = msg;
      box.hidden = !msg;
    }
  }

  const check = (key) => {
    if (!rules[key] || !form.elements[key]) return true;
    const msg = rules[key](form.elements[key].value);
    setError(key, msg);
    return !msg;
  };

  if (form) {
    Object.keys(rules).forEach(key => {
      const el = form.elements[key];
      if (!el) return;
      el.addEventListener('blur', () => { if (el.value) check(key); });
      el.addEventListener('input', () => {
        const parent = fieldOf(el);
        if (parent && parent.classList.contains('has-error')) check(key);
      });
      el.addEventListener('change', () => { if (key === 'status') check(key); });
    });

    if (form.elements.phone) {
      form.elements.phone.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d\s]/g, '');
      });
    }

    async function sendLead(payload) {
      if (CONFIG.leadEndpoint) {
        await fetch(CONFIG.leadEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } else {
        try {
          const list = JSON.parse(localStorage.getItem('miracle_test_leads') || '[]');
          list.push(payload);
          localStorage.setItem('miracle_test_leads', JSON.stringify(list));
        } catch (_) {}
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honey pot anti-bot check
      if (form.elements.company_site && form.elements.company_site.value) return;

      const keys = ['name', 'phone', 'status'];
      if (form.elements.email && form.elements.email.value.trim()) keys.push('email');
      const ok = keys.map(check).every(Boolean);
      if (!ok) {
        const firstBad = keys.find(k => !check(k));
        if (firstBad && form.elements[firstBad]) form.elements[firstBad].focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('is-busy');

      const nameVal = form.elements.name.value.trim();
      const phoneVal = normalisePhone(form.elements.phone.value);
      const emailVal = form.elements.email ? form.elements.email.value.trim() : '';
      const statusVal = form.elements.status.value;
      const batchVal = form.elements.batch ? form.elements.batch.value : 'Flexible';

      const payload = {
        name: nameVal,
        phone: phoneVal,
        email: emailVal,
        status: statusVal,
        batch: batchVal,
        course: CONFIG.course,
        submitted_at: new Date().toISOString(),
        ...getAttribution()
      };

      try {
        await sendLead(payload);
        track('Lead', {
          content_name: CONFIG.course,
          status: statusVal,
          currency: 'INR',
          value: 0
        });

        // Show success state
        if (formBody) formBody.hidden = true;
        if (formDone) {
          formDone.hidden = false;
          const waBtn = formDone.querySelector('[data-wa-name]');
          if (waBtn) waBtn.href = waLink(nameVal);
          formDone.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        }
      } catch (err) {
        const formErr = $('#e-form');
        if (formErr) {
          formErr.textContent = 'Could not send request. Please call or WhatsApp us directly.';
          formErr.hidden = false;
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-busy');
      }
    });
  }

})();
