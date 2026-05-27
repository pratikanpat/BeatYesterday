/**
 * BeatYesterday — Premium Motion System
 * Lenis smooth scroll · GSAP ScrollTrigger parallax
 * Cinematic reveals · Magnetic hover · Custom cursor
 */

(function () {
  'use strict';

  /* ─── Wait for GSAP + Lenis to load ─── */
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
      setTimeout(init, 50);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    bootstrap();
  }

  function bootstrap() {

    /* ═══════════════════════════════════════════════════
       1. LENIS SMOOTH SCROLL
    ═══════════════════════════════════════════════════ */
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ═══════════════════════════════════════════════════
       2. SCROLL PROGRESS BAR
    ═══════════════════════════════════════════════════ */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
        },
      });
    }

    /* ═══════════════════════════════════════════════════
       3. CUSTOM CURSOR
    ═══════════════════════════════════════════════════ */
    const cursor     = document.getElementById('cursor');
    const cursorDot  = document.getElementById('cursor-dot');

    if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('has-custom-cursor');

      let mx = 0, my = 0, cx = 0, cy = 0;

      window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        gsap.to(cursorDot, { x: mx, y: my, duration: 0.08, ease: 'power2.out' });
      });

      gsap.ticker.add(() => {
        cx += (mx - cx) * 0.1;
        cy += (my - cy) * 0.1;
        gsap.set(cursor, { x: cx, y: cy });
      });

      /* Cursor grow on interactive elements */
      const interactives = document.querySelectorAll('a, button, .culture__item, .identity__item');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          gsap.to(cursor, { scale: 2.2, opacity: 0.6, duration: 0.35, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
        });
      });
    }

    /* ═══════════════════════════════════════════════════
       4. HERO — CINEMATIC ENTRANCE
    ═══════════════════════════════════════════════════ */
    const heroLines = document.querySelectorAll('.hero__line');
    const heroTagline = document.querySelector('.hero__tagline');
    const heroCta     = document.querySelector('.hero__cta');
    const heroScroll  = document.querySelector('.hero__scroll-hint');
    const heroBg      = document.querySelector('.hero__bg-image');

    /* Background zoom-in on load */
    if (heroBg) {
      gsap.fromTo(heroBg,
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.2, ease: 'power3.out' }
      );
    }

    /* Staggered word reveal */
    const heroTl = gsap.timeline({ delay: 0.3 });

    heroLines.forEach((line, i) => {
      heroTl.fromTo(line,
        { y: 80, opacity: 0, skewY: 3 },
        { y: 0, opacity: 1, skewY: 0, duration: 1.1, ease: 'power4.out' },
        i * 0.15
      );
    });

    if (heroTagline) {
      heroTl.fromTo(heroTagline,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
        0.5
      );
    }
    if (heroCta) {
      heroTl.fromTo(heroCta,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        0.65
      );
    }
    if (heroScroll) {
      heroTl.fromTo(heroScroll,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        1.0
      );
    }

    /* ═══════════════════════════════════════════════════
       5. HERO — SCROLL PARALLAX
    ═══════════════════════════════════════════════════ */
    const heroContent = document.querySelector('.hero__content');
    const heroGlow    = document.querySelector('.hero__glow');

    if (heroBg) {
      gsap.to(heroBg, {
        y: '18%',
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    if (heroContent) {
      gsap.to(heroContent, {
        y: 120,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true },
      });
    }

    if (heroGlow) {
      gsap.to(heroGlow, {
        scale: 1.5,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '50% top', scrub: true },
      });
    }

    /* ═══════════════════════════════════════════════════
       6. PROBLEM SECTION — SPLIT REVEAL
    ═══════════════════════════════════════════════════ */
    const problemText = document.querySelector('.problem__text');
    const problemVisual = document.querySelector('.problem__visual');

    if (problemText) {
      gsap.fromTo(problemText,
        { x: -80, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--problem', start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
    }

    if (problemVisual) {
      gsap.fromTo(problemVisual,
        { x: 80, opacity: 0, scale: 0.96 },
        {
          x: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--problem', start: 'top 70%', toggleActions: 'play none none none' },
        }
      );

      /* Subtle parallax on the image itself */
      const problemImg = problemVisual.querySelector('img');
      if (problemImg) {
        gsap.to(problemImg, {
          y: '-8%',
          ease: 'none',
          scrollTrigger: { trigger: '.section--problem', start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    }

    /* ═══════════════════════════════════════════════════
       7. PHILOSOPHY — KINETIC WORD REVEAL
    ═══════════════════════════════════════════════════ */
    const philosophyHeads = document.querySelectorAll('.section--philosophy .mega-text');
    philosophyHeads.forEach((el, i) => {
      gsap.fromTo(el,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.0, ease: 'power4.out',
          scrollTrigger: { trigger: '.section--philosophy', start: 'top 70%', toggleActions: 'play none none none' },
          delay: i * 0.18,
        }
      );
    });

    /* Philosophy text scrub (slow rise as scrolled into) */
    gsap.to('.philosophy__glow', {
      scale: 1.4,
      opacity: 0.8,
      ease: 'none',
      scrollTrigger: { trigger: '.section--philosophy', start: 'top bottom', end: 'bottom top', scrub: true },
    });

    /* ═══════════════════════════════════════════════════
       8. IDENTITY SECTION — STAGGER CASCADE
    ═══════════════════════════════════════════════════ */
    const identityItems = document.querySelectorAll('.identity__item');

    identityItems.forEach((item, i) => {
      gsap.fromTo(item,
        { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--identity', start: 'top 75%', toggleActions: 'play none none none' },
          delay: i * 0.1,
        }
      );

      /* Hover: dim siblings */
      item.addEventListener('mouseenter', () => {
        identityItems.forEach((other) => {
          if (other !== item) gsap.to(other, { opacity: 0.18, duration: 0.3 });
        });
        gsap.to(item, { color: 'var(--color-accent)', textShadow: '0 0 60px rgba(230,57,70,0.3)', duration: 0.3 });
      });
      item.addEventListener('mouseleave', () => {
        identityItems.forEach((other) => gsap.to(other, { opacity: 1, duration: 0.3 }));
        gsap.to(item, { color: 'var(--color-text-primary)', textShadow: 'none', duration: 0.3 });
      });
    });

    /* ═══════════════════════════════════════════════════
       9. PRODUCT SECTION — SLIDE + FLOAT MOCKUP
    ═══════════════════════════════════════════════════ */
    const productInfo   = document.querySelector('.product__info');
    const productVisual = document.querySelector('.product__visual');

    if (productInfo) {
      gsap.fromTo(productInfo,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--product', start: 'top 70%', toggleActions: 'play none none none' },
        }
      );
    }

    if (productVisual) {
      gsap.fromTo(productVisual,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--product', start: 'top 65%', toggleActions: 'play none none none' },
        }
      );

      /* Floating animation on mockup */
      gsap.to('.product__mockup-placeholder', {
        y: -14,
        duration: 3.2,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
      });
    }

    /* ═══════════════════════════════════════════════════
       10. CULTURE GRID — STAGGER + PARALLAX
    ═══════════════════════════════════════════════════ */
    const cultureItems = document.querySelectorAll('.culture__item');

    cultureItems.forEach((item, i) => {
      gsap.fromTo(item,
        { y: 60, opacity: 0, scale: 0.96 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.culture__grid', start: 'top 80%', toggleActions: 'play none none none' },
          delay: i * 0.1,
        }
      );

      /* Subtle image parallax inside each cell */
      const img = item.querySelector('.culture__img');
      if (img) {
        gsap.to(img, {
          y: '-10%',
          ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    });

    /* ═══════════════════════════════════════════════════
       11. CTA SECTION — SCALE + FADE
    ═══════════════════════════════════════════════════ */
    const ctaTitle = document.querySelector('.cta__title');
    if (ctaTitle) {
      gsap.fromTo(ctaTitle,
        { scale: 0.85, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--cta', start: 'top 70%', toggleActions: 'play none none none' },
        }
      );
    }

    /* ═══════════════════════════════════════════════════
       12. MAGNETIC HOVER ON CTA BUTTONS
    ═══════════════════════════════════════════════════ */
    const magnetBtns = document.querySelectorAll('.hero__cta, .cta__button');

    magnetBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.28;
        const dy = (e.clientY - cy) * 0.28;
        gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });

    /* ═══════════════════════════════════════════════════
       13. NAV SCROLL BEHAVIOR
    ═══════════════════════════════════════════════════ */
    const nav = document.getElementById('nav');
    lenis.on('scroll', ({ scroll }) => {
      if (scroll > 80) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');
    });

    /* ═══════════════════════════════════════════════════
       14. INSTALL PROMPT (PWA)
    ═══════════════════════════════════════════════════ */
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

    /* ═══════════════════════════════════════════════════
       15. HORIZONTAL TICKER (stats bar)
    ═══════════════════════════════════════════════════ */
    const ticker = document.querySelector('.stats-ticker__inner');
    if (ticker) {
      /* Duplicate content so the loop is seamless */
      const clone = ticker.cloneNode(true);
      ticker.parentNode.appendChild(clone);
      /* CSS animation handles the loop — see style.css */
      ticker.classList.add('ticker--running');
      clone.classList.add('ticker--running');
    }
  }

  init();

})();
