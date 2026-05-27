/**
 * BeatYesterday — God-Level Motion System
 *
 * Layers:
 *  0. Canvas particle atmosphere (cursor-reactive)
 *  1. Cursor light orb (warm reactive glow)
 *  2. Lenis smooth scroll + GSAP ScrollTrigger
 *  3. Character-level hero cinematic entrance
 *  4. Horizontal philosophy scroll journey
 *  5. Directional clip-path image reveals
 *  6. Scroll velocity effects
 *  7. Magnetic button physics
 *  8. Custom cursor + scroll progress
 */

(function () {
  'use strict';

  /* ── Wait for GSAP / Lenis ── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
      return setTimeout(init, 40);
    }
    gsap.registerPlugin(ScrollTrigger);
    bootstrap();
  }

  /* ════════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════════ */
  function splitChars(el) {
    const text = el.textContent.trim();
    el.textContent = '';
    el.classList.add('is-split');

    const chars = [];
    text.split('').forEach((ch) => {
      const outer = document.createElement('span');
      outer.className = 'char-outer';

      const inner = document.createElement('span');
      inner.className = 'char';
      inner.textContent = ch === ' ' ? '\u00a0' : ch;

      outer.appendChild(inner);
      el.appendChild(outer);
      chars.push(inner);
    });
    return chars;
  }

  /* ════════════════════════════════════════════════════
     CANVAS PARTICLE ATMOSPHERE
  ════════════════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];
    const PARTICLE_COUNT = 65;
    const mouse = { x: -1000, y: -1000 };
    let scrollVel = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createParticle() {
      const isRed = Math.random() < 0.08;
      return {
        x: Math.random() * (W || window.innerWidth),
        y: Math.random() * (H || window.innerHeight),
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35 - 0.06,
        size: Math.random() * 1.4 + 0.3,
        opacity: Math.random() * 0.35 + 0.04,
        r: isRed ? 230 : 220,
        g: isRed ? 57  : 220,
        b: isRed ? 70  : 220,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.01,
      };
    }

    function reset() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function updateAndDraw(ts) {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        /* Pulse opacity */
        p.pulse += p.pulseSpeed;
        const ao = p.opacity + Math.sin(p.pulse) * 0.06;

        /* Drift */
        p.x += p.vx;
        p.y += p.vy - scrollVel * 0.12;

        /* Mouse repulsion */
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) {
          const force = (130 - dist) / 130;
          p.x += (dx / dist) * force * 1.8;
          p.y += (dy / dist) * force * 1.8;
        }

        /* Wrap */
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;

        /* Draw */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${Math.max(0, ao)})`;
        ctx.fill();
      });

      scrollVel *= 0.92; /* Decay */
      requestAnimationFrame(updateAndDraw);
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('resize', resize);

    reset();
    requestAnimationFrame(updateAndDraw);

    /* Expose scrollVel setter */
    return (v) => { scrollVel = v; };
  }

  /* ════════════════════════════════════════════════════
     CURSOR LIGHT ORB
  ════════════════════════════════════════════════════ */
  function initLightOrb() {
    const orb = document.getElementById('light-orb');
    if (!orb) return;

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = cx, ty = cy;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });

    (function trackOrb() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      orb.style.left = cx + 'px';
      orb.style.top  = cy + 'px';
      requestAnimationFrame(trackOrb);
    })();
  }

  /* ════════════════════════════════════════════════════
     CUSTOM CURSOR
  ════════════════════════════════════════════════════ */
  function initCursor() {
    const ring = document.getElementById('cursor');
    const dot  = document.getElementById('cursor-dot');
    if (!ring || !dot || !window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('has-custom-cursor');

    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.to(dot, { x: mx, y: my, duration: 0.07, ease: 'power2.out' });
    });

    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      gsap.set(ring, { x: rx, y: ry });
    });

    document.querySelectorAll('a, button, .culture__item, .identity__item').forEach((el) => {
      el.addEventListener('mouseenter', () => gsap.to(ring, { scale: 2.4, opacity: 0.5, duration: 0.3 }));
      el.addEventListener('mouseleave', () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 }));
    });
  }

  /* ════════════════════════════════════════════════════
     BOOTSTRAP ALL SYSTEMS
  ════════════════════════════════════════════════════ */
  function bootstrap() {

    /* ── Particles ── */
    const setScrollVel = initParticles();

    /* ── Light orb ── */
    initLightOrb();

    /* ── Cursor ── */
    initCursor();

    /* ── Scroll progress ── */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
      });
    }

    /* ══════════════════════════════════════════════
       LENIS SMOOTH SCROLL
    ══════════════════════════════════════════════ */
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', ({ velocity }) => {
      if (setScrollVel) setScrollVel(velocity);

      /* Velocity skew on hero background */
      const skew = Math.min(Math.max(velocity * -0.25, -5), 5);
      gsap.to('#hero-bg', { skewX: skew, duration: 0.4, overwrite: 'auto' });

      /* Fast-scroll state */
      if (Math.abs(velocity) > 12) document.body.classList.add('is-fast-scroll');
      else document.body.classList.remove('is-fast-scroll');

      /* Nav */
      const nav = document.getElementById('nav');
      if (nav) {
        if (lenis.scroll > 80) nav.classList.add('nav--scrolled');
        else nav.classList.remove('nav--scrolled');
      }
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ══════════════════════════════════════════════
       HERO — CHARACTER CINEMATIC ENTRANCE
    ══════════════════════════════════════════════ */
    const line1El = document.getElementById('hero-line-1');
    const line2El = document.getElementById('hero-line-2');
    const heroEyebrow = document.getElementById('hero-eyebrow');
    const heroTagline = document.getElementById('hero-tagline');
    const heroCta     = document.getElementById('hero-cta');
    const heroScroll  = document.getElementById('hero-scroll');
    const heroBg      = document.getElementById('hero-bg');

    /* Background cinematic zoom-in */
    if (heroBg) {
      gsap.fromTo(heroBg,
        { scale: 1.14, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.4, ease: 'power3.out' }
      );
    }

    const tl = gsap.timeline({ delay: 0.15 });

    /* Eyebrow */
    if (heroEyebrow) {
      tl.fromTo(heroEyebrow,
        { y: 20, opacity: 0, letterSpacing: '0.4em' },
        { y: 0, opacity: 1, letterSpacing: '0.22em', duration: 1.0, ease: 'power3.out' },
        0
      );
    }

    /* Character split — BEAT */
    if (line1El) {
      const chars = splitChars(line1El);
      tl.fromTo(chars,
        { y: '115%', rotate: 6, opacity: 0 },
        { y: '0%', rotate: 0, opacity: 1, duration: 1.0, ease: 'power4.out', stagger: 0.065 },
        0.25
      );
    }

    /* Character split — YESTERDAY. */
    if (line2El) {
      const chars = splitChars(line2El);
      tl.fromTo(chars,
        { y: '115%', rotate: -4, opacity: 0 },
        { y: '0%', rotate: 0, opacity: 1, duration: 1.0, ease: 'power4.out', stagger: 0.045 },
        0.45
      );
    }

    if (heroTagline) {
      tl.fromTo(heroTagline,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        0.85
      );
    }

    if (heroCta) {
      tl.fromTo(heroCta,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        1.05
      );
    }

    if (heroScroll) {
      tl.fromTo(heroScroll,
        { opacity: 0 },
        { opacity: 1, duration: 0.7, ease: 'power2.out' },
        1.4
      );
    }

    /* ── Hero scroll parallax ── */
    const heroContent = document.getElementById('hero-content');
    if (heroBg) {
      gsap.to(heroBg, {
        y: '20%',
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (heroContent) {
      gsap.to(heroContent, {
        y: 130,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '65% top', scrub: true },
      });
    }

    /* ══════════════════════════════════════════════
       PROBLEM — SPLIT DIRECTIONAL REVEAL
    ══════════════════════════════════════════════ */
    const problemText   = document.getElementById('problem-text');
    const problemVisual = document.getElementById('problem-visual');
    const problemImgClip = document.querySelector('.problem__img-clip');
    const problemImg     = document.querySelector('.problem__image');

    if (problemText) {
      gsap.fromTo(problemText,
        { x: -90, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--problem', start: 'top 72%', toggleActions: 'play none none none' },
        }
      );
    }

    if (problemImgClip) {
      gsap.to(problemImgClip, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.4,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.section--problem', start: 'top 68%', toggleActions: 'play none none none' },
      });
    }

    if (problemImg) {
      gsap.to(problemImg, {
        y: '-10%',
        ease: 'none',
        scrollTrigger: { trigger: '.section--problem', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    /* ══════════════════════════════════════════════
       PHILOSOPHY — HORIZONTAL SCROLL JOURNEY
    ══════════════════════════════════════════════ */
    const philoSection = document.getElementById('philosophy');
    const philoInner   = document.getElementById('philosophy-inner');

    if (philoSection && philoInner && window.innerWidth > 768) {
      const getTravel = () => philoInner.scrollWidth - window.innerWidth;

      gsap.to(philoInner, {
        x: () => -getTravel(),
        ease: 'none',
        scrollTrigger: {
          trigger: philoSection,
          start: 'top top',
          end: () => `+=${getTravel()}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });

      /* Fade in panel headings as they enter */
      const philoH1 = document.getElementById('philo-h1');
      const philoH2 = document.getElementById('philo-h2');
      const philoPanels = document.querySelectorAll('.philosophy__panel');

      philoPanels.forEach((panel, i) => {
        gsap.fromTo(panel.querySelectorAll('.mega-text, .philosophy__quote-text, .section__label, .philosophy__quote-bar'),
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12,
            scrollTrigger: {
              trigger: philoSection,
              start: () => `top+=${i * getTravel() / 2} top`,
              end: () => `top+=${i * getTravel() / 2 + 200} top`,
              scrub: 0.5,
              containerAnimation: undefined,
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }

    /* ══════════════════════════════════════════════
       IDENTITY — ALTERNATING CASCADE
    ══════════════════════════════════════════════ */
    const identityItems = document.querySelectorAll('.identity__item');

    identityItems.forEach((item, i) => {
      gsap.fromTo(item,
        { x: i % 2 === 0 ? -70 : 70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--identity', start: 'top 78%', toggleActions: 'play none none none' },
          delay: i * 0.09,
        }
      );

      item.addEventListener('mouseenter', () => {
        identityItems.forEach((other) => {
          if (other !== item) gsap.to(other, { opacity: 0.12, duration: 0.3, ease: 'power2.out' });
        });
      });
      item.addEventListener('mouseleave', () => {
        identityItems.forEach((other) => gsap.to(other, { opacity: 1, duration: 0.4, ease: 'power2.out' }));
      });
    });

    /* ══════════════════════════════════════════════
       PRODUCT — FLOAT + SLIDE
    ══════════════════════════════════════════════ */
    const productInfo   = document.getElementById('product-info');
    const productMockup = document.getElementById('product-mockup');

    if (productInfo) {
      gsap.fromTo(productInfo,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--product', start: 'top 72%', toggleActions: 'play none none none' },
        }
      );
    }

    if (productMockup) {
      gsap.fromTo(productMockup,
        { y: 90, opacity: 0, rotateX: 8 },
        {
          y: 0, opacity: 1, rotateX: 0, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--product', start: 'top 65%', toggleActions: 'play none none none' },
        }
      );

      /* Continuous float */
      gsap.to(productMockup, {
        y: -18,
        duration: 3.5,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    /* ══════════════════════════════════════════════
       CULTURE GRID — DIRECTIONAL CLIP REVEALS
    ══════════════════════════════════════════════ */
    const clipMap = {
      bottom: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      left:   ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'],
      right:  ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
      top:    ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'],
    };

    document.querySelectorAll('.culture__item[data-clip]').forEach((item, i) => {
      const dir = item.dataset.clip;
      const [from, to] = clipMap[dir] || clipMap.bottom;

      gsap.fromTo(item,
        { clipPath: from },
        {
          clipPath: to,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: { trigger: '#culture-grid', start: 'top 80%', toggleActions: 'play none none none' },
          delay: i * 0.14,
        }
      );

      /* Image parallax within cell */
      const img = item.querySelector('.culture__img');
      if (img) {
        gsap.to(img, {
          y: '-10%',
          ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    });

    /* ══════════════════════════════════════════════
       CTA — SCALE REVEAL
    ══════════════════════════════════════════════ */
    const ctaTitle = document.getElementById('cta-title');
    const ctaSub   = document.getElementById('cta-sub');
    const ctaNote  = document.getElementById('cta-note');

    if (ctaTitle) {
      gsap.fromTo(ctaTitle,
        { scale: 0.82, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--cta', start: 'top 72%', toggleActions: 'play none none none' },
        }
      );
    }

    [ctaSub, ctaNote].forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--cta', start: 'top 68%', toggleActions: 'play none none none' },
          delay: 0.15 + i * 0.1,
        }
      );
    });

    /* ══════════════════════════════════════════════
       MAGNETIC BUTTONS — PHYSICS
    ══════════════════════════════════════════════ */
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.3;
        gsap.to(btn, { x: dx, y: dy, duration: 0.45, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });
      });
    });

    /* ══════════════════════════════════════════════
       STATS TICKER — Seamless duplicate
    ══════════════════════════════════════════════ */
    const ticker = document.getElementById('ticker');
    if (ticker) {
      const clone = ticker.cloneNode(true);
      clone.removeAttribute('id');
      ticker.parentNode.appendChild(clone);
      /* CSS animation handles both via the shared class */
    }

    /* ══════════════════════════════════════════════
       SECTION BODY TEXT — soft fade-up
    ══════════════════════════════════════════════ */
    document.querySelectorAll('.section__label, .section__body').forEach((el) => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });

    /* ══════════════════════════════════════════════
       MEGA-TEXT REVEALS
    ══════════════════════════════════════════════ */
    document.querySelectorAll('.mega-text').forEach((el) => {
      gsap.fromTo(el,
        { y: 55, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });

    /* ══════════════════════════════════════════════
       PWA INSTALL PROMPT
    ══════════════════════════════════════════════ */
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', async (e) => {
        if (deferredPrompt) {
          e.preventDefault();
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        }
      });
    }

  } /* end bootstrap */

  init();

})();
