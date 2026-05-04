/* ============================================================
   Ottica Clienti — Landing JS
   - Scroll reveal (IntersectionObserver)
   - Form validation (inline errors, like Sold Out)
   - Smooth scroll for anchor links (handled by CSS, but offset for navbar)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Form validation ---------- */
  const form = document.getElementById('candForm');
  if (form) {
    const successMsg = document.getElementById('formSuccess');

    const showError = (input, message) => {
      input.classList.add('invalid');
      const msgEl = input.parentElement.querySelector('.error-msg');
      if (msgEl) {
        msgEl.textContent = message;
        msgEl.classList.add('show');
      }
    };

    const clearError = (input) => {
      input.classList.remove('invalid');
      const msgEl = input.parentElement.querySelector('.error-msg');
      if (msgEl) {
        msgEl.textContent = '';
        msgEl.classList.remove('show');
      }
    };

    const validateField = (input) => {
      const value = (input.value || '').trim();
      if (input.required && !value) {
        showError(input, 'Campo obbligatorio');
        return false;
      }
      if (input.type === 'email' && value) {
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!emailOk) {
          showError(input, 'Email non valida');
          return false;
        }
      }
      if (input.type === 'tel' && value) {
        const telOk = /^[+\d\s().-]{7,}$/.test(value);
        if (!telOk) {
          showError(input, 'Numero non valido');
          return false;
        }
      }
      clearError(input);
      return true;
    };

    // live validation on blur
    form.querySelectorAll('input[required]').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;

      form.querySelectorAll('input[required]').forEach((input) => {
        if (input.type === 'checkbox') {
          if (!input.checked) {
            allValid = false;
            input.parentElement.style.color = '#EF4444';
          } else {
            input.parentElement.style.color = '';
          }
        } else if (!validateField(input)) {
          allValid = false;
        }
      });

      if (!allValid) {
        const firstInvalid = form.querySelector('.invalid, input[type="checkbox"]:invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // TODO: integrare con endpoint reale (es. /api/lead, Formspree, Make.com webhook)
      // const data = Object.fromEntries(new FormData(form).entries());
      // fetch('/api/lead', { method: 'POST', body: JSON.stringify(data) })

      form.reset();
      if (successMsg) {
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* ---------- Inline YouTube playback (lite-embed pattern) ----------
     Click on a .yt-card swaps the thumbnail for an autoplaying iframe,
     so the video plays inside the page instead of opening youtube.com. */
  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url);
      // youtu.be/<id>
      if (u.hostname === 'youtu.be') return u.pathname.replace('/', '');
      // youtube.com/watch?v=<id>
      const v = u.searchParams.get('v');
      if (v) return v;
      // youtube.com/embed/<id> or /shorts/<id>
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1];
    } catch (e) {
      return null;
    }
  };

  document.querySelectorAll('.yt-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (card.dataset.played) return;
      const href = card.getAttribute('href');
      if (!href) return;
      const id = extractYouTubeId(href);
      if (!id) return; // fall back to normal navigation
      e.preventDefault();
      card.dataset.played = '1';

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('title', 'Testimonianza video');

      const thumb = card.querySelector('.yt-thumb');
      if (thumb) {
        thumb.innerHTML = '';
        thumb.appendChild(iframe);
      }
    });
  });

  /* ---------- Smooth scroll with navbar offset ---------- */
  const navbar = document.querySelector('.navbar');
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = (navbar ? navbar.offsetHeight : 0) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
