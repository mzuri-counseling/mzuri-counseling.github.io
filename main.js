/* ==========================================
   Mzuri Counseling & Wellness — main.js
   Multi-page version
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

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
     landing on the target page with offset
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
     5. SERVICE CARD stagger
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
     6. CONTACT FORM — validation + submit
  ------------------------------------------ */
  const form        = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn   = form.querySelector('button[type="submit"]');
      const origText = btn.textContent;
      const name  = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();

      if (!name) { shakeField('#name'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        shakeField('#email');
        showFieldError('#email', 'Please enter a valid email address.');
        return;
      }

      btn.textContent = 'Sending...';
      btn.disabled = true;

      // Replace the timeout below with real EmailJS or fetch call
      await new Promise(r => setTimeout(r, 1200));

      form.style.display = 'none';
      formSuccess.style.display = 'block';
      form.reset();
      btn.textContent = origText;
      btn.disabled = false;
    });
  }

  function shakeField(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
    el.focus();
  }

  function showFieldError(selector, msg) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.parentElement.querySelector('.field-error')?.remove();
    const err = Object.assign(document.createElement('span'), {
      className: 'field-error',
      textContent: msg
    });
    err.style.cssText = 'font-size:0.75rem;color:#c0392b;margin-top:0.25rem;display:block;';
    el.parentElement.appendChild(err);
    el.addEventListener('input', () => err.remove(), { once: true });
  }

  // Inject utility keyframes
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
