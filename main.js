/* ==========================================
   Mzuri Counseling & Wellness — main.js
   Multi-page version with EmailJS
   ========================================== */

/* ------------------------------------------
   EmailJS Configuration
------------------------------------------ */
const EMAILJS_SERVICE_ID  = 'service_qfdhaoh';
const EMAILJS_TEMPLATE_ID = 'template_xab225g';
const EMAILJS_PUBLIC_KEY  = 'zv9CrvYeZuuOaISzD';

// Initialise EmailJS as soon as the script loads
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

document.addEventListener('DOMContentLoaded', () => {

  // Initialise again inside DOMContentLoaded as a safety net
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  /* ------------------------------------------
     1. HEADER scroll shadow
  ------------------------------------------ */
  const header = document.getElementById('site-header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });


  /* ------------------------------------------
     2. MOBILE NAV toggle
  ------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });


  /* ------------------------------------------
     3. SMOOTH SCROLL for same-page anchors
  ------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ------------------------------------------
     3b. Cross-page anchor scroll
     Handles links like "index.html#contact"
     arriving on the page with the hash
  ------------------------------------------ */
  const hash = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 16);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 120);
  }


  /* ------------------------------------------
     4. INTERSECTION OBSERVER: fade-in
  ------------------------------------------ */
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));


  /* ------------------------------------------
     5. SERVICE CARD stagger on scroll
  ------------------------------------------ */
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'),
          (parseInt(entry.target.dataset.stagger) || 0) * 80);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.service-card, .approach-detail-card, .emdr-card').forEach((card, i) => {
    card.dataset.stagger = i % 3;
    card.classList.add('fade-in');
    cardObserver.observe(card);
  });


  /* ------------------------------------------
     6. CONTACT FORM — EmailJS submission
  ------------------------------------------ */
  const form        = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn      = form.querySelector('button[type="submit"]');
      const origText = btn.textContent;

      // --- Grab field values ---
      const name    = form.querySelector('#name').value.trim();
      const email   = form.querySelector('#email').value.trim();
      const phone   = form.querySelector('#phone').value.trim();
      const service = form.querySelector('#service').value;
      const message = form.querySelector('#message').value.trim();

      // --- Client-side validation ---
      if (!name) {
        shakeField('#name');
        showFieldError('#name', 'Please enter your name.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        shakeField('#email');
        showFieldError('#email', 'Please enter a valid email address.');
        return;
      }

      // --- UI: loading state ---
      btn.textContent = 'Sending...';
      btn.disabled    = true;

      // --- Build the template parameters ---
      // These variable names must match your EmailJS template exactly.
      const templateParams = {
        from_name : name,
        from_email: email,
        phone     : phone   || 'Not provided',
        service   : service || 'Not specified',
        message   : message || 'No message provided',
        reply_to  : email,
      };

      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );

        // --- Success ---
        form.style.display        = 'none';
        formSuccess.style.display = 'block';
        form.reset();

      } catch (error) {
        // --- Error: show inline message, re-enable button ---
        console.error('EmailJS error:', error);
        showFormError('Something went wrong. Please try emailing mae@mzuricounseling.com directly or calling 908-800-2061.');
        btn.textContent = origText;
        btn.disabled    = false;
      }
    });
  }


  /* ------------------------------------------
     Helper: shake an invalid field
  ------------------------------------------ */
  function shakeField(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // force reflow
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
    el.focus();
  }

  /* ------------------------------------------
     Helper: show a field-level error message
  ------------------------------------------ */
  function showFieldError(selector, msg) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.parentElement.querySelector('.field-error')?.remove();
    const err = Object.assign(document.createElement('span'), {
      className  : 'field-error',
      textContent: msg,
    });
    err.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:0.25rem;display:block;';
    el.parentElement.appendChild(err);
    el.addEventListener('input', () => err.remove(), { once: true });
  }

  /* ------------------------------------------
     Helper: show a form-level error banner
  ------------------------------------------ */
  function showFormError(msg) {
    form.querySelector('.form-error-banner')?.remove();
    const banner = Object.assign(document.createElement('div'), {
      className  : 'form-error-banner',
      textContent: msg,
    });
    banner.style.cssText = `
      background: #fdf2f2;
      border: 1px solid #f5c6c6;
      border-radius: 6px;
      color: #c0392b;
      font-size: 0.85rem;
      line-height: 1.5;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    `;
    form.insertBefore(banner, form.firstChild);
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ------------------------------------------
     Inject keyframes
  ------------------------------------------ */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);

});
