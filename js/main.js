/* ============================================
   V&T CELEBRATIONS — FINAL JS
   Canvas VR lens mask, parallax, 3D tilt,
   contact form, playful animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initHeroParallax();
  initImmersiveLens();
  initVideoCinematic();
  init3DTilt();
  initHorizontalDrag();
  initTestimonials();
  initFAQ();
  initGalleryDuplicate();
  initSmoothScroll();
  initContactForm();
});

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const links = document.querySelector('.nav__links');
  const allLinks = document.querySelectorAll('.nav__link, .nav__cta');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    allLinks.forEach(l => l.addEventListener('click', () => {
      burger.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
}

/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal, .reveal-scale').forEach(el => obs.observe(el));
}

/* ============================================
   HERO PARALLAX
   ============================================ */
function initHeroParallax() {
  const hero = document.querySelector('.hero');
  const bgLayer = document.querySelector('.hero__bg-layer');
  const floats = document.querySelectorAll('.hero__float');
  if (!hero || !bgLayer) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    bgLayer.style.transform = `translate(${x * -20}px, ${y * -15}px) scale(1.08)`;
    floats.forEach((f, i) => {
      const d = (i + 1) * 14;
      f.style.transform = `translate(${x * d}px, ${y * d}px)`;
    });
  });

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroH = hero.offsetHeight;
    if (scrollY > heroH) return;
    const p = scrollY / heroH;
    bgLayer.style.transform = `translateY(${p * 70}px) scale(${1.08 + p * 0.04})`;
    floats.forEach((f, i) => {
      f.style.transform = `translateY(${p * (i + 1) * -35}px)`;
      f.style.opacity = Math.max(0, 1 - p * 1.8);
    });
  }, { passive: true });
}

/* ============================================
   IMMERSIVE VR LENS EFFECT — Canvas mask
   Simulates putting on a headset:
   Phase 1: Headset SVG visible, dark bg
   Phase 2: Two lens circles appear + expand
   Phase 3: Lenses merge into full screen
   Phase 4: Full world revealed, text appears
   Phase 5: Feature pills
   ============================================ */
function initImmersiveLens() {
  const section = document.querySelector('.immersive');
  if (!section) return;

  const canvas = document.querySelector('.immersive__mask canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const headset = document.querySelector('.immersive__headset-frame');
  const world = document.querySelector('.immersive__world');
  const textIntro = document.querySelector('.immersive__text--intro');
  const textReveal = document.querySelector('.immersive__text--reveal');
  const features = document.querySelector('.immersive__features');

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawLensMask(progress) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Phase: lenses visible (0.15 to 0.65)
    if (progress < 0.12 || progress > 0.72) {
      if (progress <= 0.12) {
        // Fully dark
        ctx.fillStyle = '#0e0e1a';
        ctx.fillRect(0, 0, w, h);
      }
      // After 0.72: fully transparent (world visible)
      return;
    }

    // Lens parameters
    const lensProgress = (progress - 0.12) / 0.6; // 0 → 1

    const cx = w / 2;
    const cy = h / 2;

    // Lens separation: starts wide, comes together
    const maxSep = Math.min(w * 0.18, 160);
    const separation = maxSep * Math.max(0, 1 - lensProgress * 2.2);

    // Lens radius: starts small, grows to cover screen
    const minR = Math.min(w, h) * 0.08;
    const maxR = Math.sqrt(w * w + h * h); // diagonal
    const radius = minR + (maxR - minR) * easeInOutCubic(Math.min(1, lensProgress * 1.3));

    // Draw dark background with two circular cutouts
    ctx.fillStyle = '#0e0e1a';
    ctx.fillRect(0, 0, w, h);

    // Cut out lens circles
    ctx.globalCompositeOperation = 'destination-out';

    // Left lens
    ctx.beginPath();
    ctx.arc(cx - separation, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Right lens
    ctx.beginPath();
    ctx.arc(cx + separation, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    // Subtle lens edge glow when lenses are small/medium
    if (lensProgress < 0.6) {
      const glowAlpha = 0.12 * (1 - lensProgress / 0.6);
      // Left glow
      const grd1 = ctx.createRadialGradient(cx - separation, cy, radius * 0.9, cx - separation, cy, radius * 1.02);
      grd1.addColorStop(0, 'transparent');
      grd1.addColorStop(1, `rgba(251,163,161,${glowAlpha})`);
      ctx.fillStyle = grd1;
      ctx.fillRect(0, 0, w, h);
      // Right glow
      const grd2 = ctx.createRadialGradient(cx + separation, cy, radius * 0.9, cx + separation, cy, radius * 1.02);
      grd2.addColorStop(0, 'transparent');
      grd2.addColorStop(1, `rgba(251,163,161,${glowAlpha})`);
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);
    }

    // Nose bridge shadow between lenses when close together
    if (separation > 5 && separation < maxSep * 0.6 && lensProgress < 0.5) {
      const bridgeAlpha = 0.3 * (1 - lensProgress * 2);
      ctx.fillStyle = `rgba(14,14,26,${Math.max(0, bridgeAlpha)})`;
      ctx.fillRect(cx - 3, cy - radius * 0.4, 6, radius * 0.8);
    }
  }

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const viewH = window.innerHeight;
    const scrolled = -rect.top;
    const totalScroll = sectionH - viewH;
    const progress = Math.max(0, Math.min(1, scrolled / totalScroll));

    // --- WORLD VIDEO ---
    if (world) {
      const vid = world.querySelector("video");
    if (vid && vid.paused && progress > 0.05) vid.play().catch(()=>{});
    world.style.opacity = progress > 0.08 ? 1 : 0;
    }

    // --- CANVAS LENS MASK ---
    drawLensMask(progress);

    // --- HEADSET FRAME ---
    if (headset) {
      let hOpacity, hScale;
      if (progress < 0.08) {
        hOpacity = Math.min(1, progress / 0.05);
        hScale = 0.85 + 0.15 * (progress / 0.08);
      } else if (progress < 0.22) {
        const p = (progress - 0.08) / 0.14;
        hOpacity = 1 - easeInOutCubic(p);
        hScale = 1 + p * 1.5;
      } else {
        hOpacity = 0;
        hScale = 2.5;
      }
      headset.style.opacity = hOpacity;
      headset.style.transform = `translate(-50%,-50%) scale(${hScale})`;
    }

    // --- INTRO TEXT ---
    if (textIntro) {
      if (progress < 0.06) {
        textIntro.style.opacity = easeInOutCubic(progress / 0.06);
        textIntro.style.transform = `translateY(${(1 - progress / 0.06) * 30}px)`;
      } else if (progress < 0.15) {
        const p = (progress - 0.06) / 0.09;
        textIntro.style.opacity = 1 - p;
        textIntro.style.transform = `translateY(${-p * 40}px)`;
      } else {
        textIntro.style.opacity = 0;
      }
    }

    // --- REVEAL TEXT (inside the world) ---
    if (textReveal) {
      if (progress > 0.55 && progress < 0.82) {
        const p = Math.min(1, (progress - 0.55) / 0.12);
        textReveal.style.opacity = easeInOutCubic(p);
        textReveal.style.transform = `translateY(${(1 - p) * 25}px)`;
      } else if (progress >= 0.82) {
        const p = (progress - 0.82) / 0.1;
        textReveal.style.opacity = Math.max(0, 1 - p);
        textReveal.style.transform = `translateY(${-p * 25}px)`;
      } else {
        textReveal.style.opacity = 0;
      }
    }

    // --- FEATURES ---
    if (features) {
      if (progress > 0.78) {
        const p = Math.min(1, (progress - 0.78) / 0.12);
        features.style.opacity = easeInOutCubic(p);
        // Stagger children
        features.querySelectorAll('.immersive__feature-pill').forEach((pill, i) => {
          pill.style.animationDelay = `${i * 0.1}s`;
        });
      } else {
        features.style.opacity = 0;
      }
    }
  }, { passive: true });
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ============================================
   VIDEO CINEMATIC
   ============================================ */
function initVideoCinematic() {
  const section = document.querySelector('.video-cinematic');
  if (!section) return;
  const frame = section.querySelector('.video-cinematic__frame');
  const iframe = frame ? frame.querySelector('iframe[data-src]') : null;
  let loaded = false;

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const sH = section.offsetHeight;
    const vH = window.innerHeight;
    const scrolled = -rect.top;
    const total = sH - vH;
    const progress = Math.max(0, Math.min(1, scrolled / total));

    if (!frame) return;
    if (!loaded && progress > 0.03 && iframe) {
      iframe.src = iframe.dataset.src;
      iframe.removeAttribute('data-src');
      loaded = true;
    }
    const w = 75 + progress * 25;
    const r = Math.max(0, 28 - progress * 28);
    frame.style.width = `${w}%`;
    frame.style.borderRadius = `${r}px`;
  }, { passive: true });
}

/* ============================================
   3D TILT
   ============================================ */
function init3DTilt() {
  document.querySelectorAll('.service-card, .package-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ============================================
   HORIZONTAL DRAG
   ============================================ */
function initHorizontalDrag() {
  const track = document.querySelector('.games__track');
  if (!track) return;
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', (e) => {
    isDown = true; track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; e.preventDefault();
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    track.scrollLeft = scrollLeft - ((e.pageX - track.offsetLeft) - startX) * 1.8;
  });
}

/* ============================================
   TESTIMONIALS
   ============================================ */
function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonials__dot');
  let current = 0, interval;
  if (!slides.length) return;

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = i;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  function start() { interval = setInterval(() => goTo((current + 1) % slides.length), 5000); }
  function stop() { clearInterval(interval); }

  dots.forEach((d, i) => d.addEventListener('click', () => { stop(); goTo(i); start(); }));

  const slider = document.querySelector('.testimonials__slider');
  if (slider) {
    let sx = 0;
    slider.addEventListener('touchstart', e => { sx = e.changedTouches[0].screenX; stop(); }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = sx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? (current + 1) % slides.length : (current - 1 + slides.length) % slides.length);
      start();
    }, { passive: true });
  }
  start();
}

/* ============================================
   FAQ
   ============================================ */
function initFAQ() {
  document.querySelectorAll('.faq__item').forEach(item => {
    item.querySelector('.faq__question').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* ============================================
   GALLERY
   ============================================ */
function initGalleryDuplicate() {
  const track = document.querySelector('.gallery__track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
    });
  });
}

/* ============================================
   CONTACT FORM — Formspree
   ============================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Zeitstempel: wann wurde das Formular das erste Mal berührt
  let formTouchedAt = null;
  form.addEventListener('focusin', () => {
    if (!formTouchedAt) formTouchedAt = Date.now();
  }, { once: true });
  // Fallback: Zeitstempel ab Seitenload
  const pageLoadedAt = Date.now();

  function showError(textSpan, arrowSpan, btn, msg) {
    if (textSpan) textSpan.textContent = msg;
    if (arrowSpan) arrowSpan.style.display = '';
    btn.disabled = false;
    setTimeout(() => {
      if (textSpan) textSpan.textContent = 'Anfrage senden';
    }, 4000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form__submit');
    const textSpan = btn.querySelector('.form__submit-text');
    const arrowSpan = btn.querySelector('.form__submit-arrow');

    // ── Schutz 1: Honeypot ──────────────────────────────
    // Bots füllen das versteckte botcheck-Feld aus
    const honeypot = form.querySelector('input[name="botcheck"]');
    if (honeypot && honeypot.checked) return; // still — kein Feedback an den Bot

    // ── Schutz 2: Zeitcheck ──────────────────────────────
    // Echte Menschen brauchen mindestens 4 Sekunden zum Ausfüllen
    const elapsed = Date.now() - (formTouchedAt || pageLoadedAt);
    if (elapsed < 4000) return; // still abbrechen

    // ── Schutz 3: Rate Limiting ──────────────────────────
    // Max. 3 Anfragen pro Stunde pro Browser
    const RL_KEY = 'vt_form_submissions';
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    let submissions = [];
    try {
      submissions = JSON.parse(localStorage.getItem(RL_KEY) || '[]');
    } catch (_) {}
    // Einträge älter als 1 Stunde entfernen
    submissions = submissions.filter(t => now - t < HOUR);
    if (submissions.length >= 3) {
      showError(textSpan, arrowSpan, btn, 'Zu viele Anfragen — bitte später versuchen');
      return;
    }

    if (textSpan) textSpan.textContent = 'Wird gesendet…';
    if (arrowSpan) arrowSpan.style.display = 'none';
    btn.disabled = true;

    const data = new FormData(form);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      const json = await res.json();

      if (res.ok && json.success) {
        // Erfolgreiche Übertragung im Rate-Limit speichern
        submissions.push(now);
        try { localStorage.setItem(RL_KEY, JSON.stringify(submissions)); } catch (_) {}
        form.style.display = 'none';
        document.querySelector('.form__success').classList.add('show');
      } else {
        const msg = json.message || 'Fehler — bitte nochmal versuchen';
        showError(textSpan, arrowSpan, btn, msg);
      }
    } catch (err) {
      // Netzwerkfehler — Fallback mailto
      const name = data.get('name') || '';
      const email = data.get('email') || '';
      const message = data.get('message') || '';
      const eventType = data.get('event_type') || 'Anfrage';
      window.location.href = `mailto:info@vt-celebrations.com?subject=${encodeURIComponent(eventType)}&body=${encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\n${message}`)}`;
      if (textSpan) textSpan.textContent = 'Anfrage senden';
      if (arrowSpan) arrowSpan.style.display = '';
      btn.disabled = false;
    }
  });
}

/* ============================================
   VIDEO SHOWCASE — Play/Pause on click
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-showcase__item').forEach(item => {
    item.addEventListener('click', () => {
      const video = item.querySelector('video');
      if (!video) return;
      if (video.paused) {
        // Pause all others first
        document.querySelectorAll('.video-showcase__item video').forEach(v => {
          v.pause();
          v.closest('.video-showcase__item').classList.remove('playing');
        });
        video.play();
        item.classList.add('playing');
      } else {
        video.pause();
        item.classList.remove('playing');
      }
    });
  });
});

/* ============================================
   COOKIE BANNER
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  const declineBtn = document.getElementById('cookieDecline');
  if (!banner) return;

  // Check if already answered
  const consent = getCookie('vt_cookie_consent');
  if (!consent) {
    setTimeout(() => banner.classList.add('show'), 1500);
  }

  acceptBtn.addEventListener('click', () => {
    setCookie('vt_cookie_consent', 'all', 365);
    banner.classList.remove('show');
  });

  declineBtn.addEventListener('click', () => {
    setCookie('vt_cookie_consent', 'essential', 365);
    banner.classList.remove('show');
  });

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '=([^;]*)');
    return v ? v[2] : null;
  }
});
