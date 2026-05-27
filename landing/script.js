/**
 * BeatYesterday — Motion System
 * Clean, single-source-of-truth. No patch layers.
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

  /* ════════════════════════════════════════
     HELPER — split text into char spans
  ════════════════════════════════════════ */
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

  /* ════════════════════════════════════════
     CANVAS — Stars + Speed Streaks
  ════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;
    let scrollVel = 0;
    let lastBurstVel = 0;
    const mouse = { x: -9999, y: -9999 };

    /* Arrays */
    let stars   = [];
    let streaks = [];
    let pulses  = [];

    /* ── Resize ── */
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    /* ── Create one star ── */
    function makeStar() {
      const isRed = Math.random() < 0.12;
      return {
        x:           Math.random() * W,
        y:           Math.random() * H,
        vx:          (Math.random() - 0.5) * 0.45,
        vy:          (Math.random() - 0.5) * 0.35 - 0.05,
        size:        Math.random() * 2.2 + 0.8,
        baseOpacity: Math.random() * 0.55 + 0.15,
        opacity:     0,
        r:           isRed ? 230 : 240,
        g:           isRed ? 57  : 240,
        b:           isRed ? 70  : 255,
        phase:       Math.random() * Math.PI * 2,
        phaseSpeed:  0.02 + Math.random() * 0.04,
        glow:        Math.random() * 5 + 2,
      };
    }

    /* ── Create stars array ── */
    function initStars() {
      stars = [];
      for (let i = 0; i < 90; i++) stars.push(makeStar());
    }

    /* ── Spawn a speed streak ── */
    function spawnStreak() {
      if (!W) return;
      const goRight = Math.random() > 0.25;
      const speed   = 9 + Math.random() * 14;
      const length  = 35 + Math.random() * 90;
      const isRed   = Math.random() < 0.1;
      streaks.push({
        x:      goRight ? -length : W + length,
        y:      Math.random() * H,
        vx:     goRight ? speed : -speed,
        length: length,
        alpha:  0.45 + Math.random() * 0.45,
        width:  0.4 + Math.random() * 0.9,
        col:    isRed ? '230,57,70' : '240,240,255',
      });
    }

    /* ── Streak scheduler ── */
    (function scheduleStreak() {
      spawnStreak();
      setTimeout(scheduleStreak, 900 + Math.random() * 1800);
    })();

    /* ── Burst streaks on fast scroll ── */
    function maybeSpeedBurst(vel) {
      if (Math.abs(vel) > 8 && Math.abs(vel - lastBurstVel) > 3) {
        for (let i = 0; i < 4; i++) setTimeout(spawnStreak, i * 55);
        lastBurstVel = vel;
      }
    }

    /* ── Pulse ring ── */
    function spawnPulse() {
      if (!W) return;
      pulses.push({ x: Math.random() * W, y: Math.random() * H, r: 0, alpha: 0.18 });
    }
    setInterval(spawnPulse, 3500 + Math.random() * 2000);

    /* ── Main render loop ── */
    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* Connection lines between nearby stars */
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(230,57,70,${(1 - d / 100) * 0.07})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      /* Speed streaks */
      streaks = streaks.filter((s) => s.x > -300 && s.x < W + 300);
      streaks.forEach((s) => {
        s.x += s.vx;
        const x0   = s.vx > 0 ? s.x - s.length : s.x + s.length;
        const grad = ctx.createLinearGradient(x0, s.y, s.x, s.y);
        grad.addColorStop(0, `rgba(${s.col},0)`);
        grad.addColorStop(1, `rgba(${s.col},${s.alpha})`);
        ctx.beginPath();
        ctx.moveTo(x0, s.y);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = s.width;
        ctx.stroke();
      });

      /* Pulse rings */
      pulses = pulses.filter((p) => p.alpha > 0.005);
      pulses.forEach((p) => {
        p.r    += 1.8;
        p.alpha *= 0.972;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(230,57,70,${p.alpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      });

      /* Stars */
      stars.forEach((s) => {
        /* Twinkle */
        s.phase  += s.phaseSpeed;
        s.opacity = s.baseOpacity + Math.sin(s.phase) * 0.25;

        /* Drift */
        s.x += s.vx;
        s.y += s.vy - scrollVel * 0.1;

        /* Cursor repulsion */
        const dx   = s.x - mouse.x;
        const dy   = s.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) {
          const f = (130 - dist) / 130;
          s.x += (dx / dist) * f * 2.0;
          s.y += (dy / dist) * f * 2.0;
        }

        /* Wrap */
        if (s.x < -5)  s.x = W + 5;
        if (s.x > W + 5) s.x = -5;
        if (s.y < -5)  s.y = H + 5;
        if (s.y > H + 5) s.y = -5;

        /* Draw with glow */
        const ao = Math.max(0, Math.min(1, s.opacity));
        ctx.shadowBlur  = s.glow;
        ctx.shadowColor = `rgba(${s.r},${s.g},${s.b},${ao})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${ao})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      scrollVel *= 0.88;
      requestAnimationFrame(draw);
    }

    /* ── Events ── */
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('resize', () => { resize(); initStars(); });

    /* ── Boot ── */
    resize();
    initStars();
    requestAnimationFrame(draw);

    /* Return setter for scroll velocity */
    return (vel) => {
      scrollVel = vel;
      maybeSpeedBurst(vel);
    };
  }

  /* ════════════════════════════════════════
     CURSOR LIGHT ORBS
  ════════════════════════════════════════ */
  function initLightOrb() {
    const orb1 = document.getElementById('light-orb');
    const orb2 = document.getElementById('light-orb-2');
    if (!orb1) return;

    let cx = window.innerWidth / 2,  cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    let angle = 0;

    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });

    (function tick() {
      /* Orb 1 — follows cursor */
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      orb1.style.left = cx + 'px';
      orb1.style.top  = cy + 'px';

      /* Orb 2 — autonomous Lissajous figure-8 */
      if (orb2) {
        angle += 0.004;
        const ox = window.innerWidth  * 0.5 + Math.sin(angle)        * window.innerWidth  * 0.28;
        const oy = window.innerHeight * 0.5 + Math.sin(angle * 1.65) * window.innerHeight * 0.22;
        orb2.style.left = ox + 'px';
        orb2.style.top  = oy + 'px';
      }

      requestAnimationFrame(tick);
    })();
  }

  /* ════════════════════════════════════════
     CUSTOM CURSOR
  ════════════════════════════════════════ */
  function initCursor() {
    const ring = document.getElementById('cursor');
    const dot  = document.getElementById('cursor-dot');
    if (!ring || !dot || !window.matchMedia('(pointer: fine)').matches) return;

    document.body.classList.add('has-custom-cursor');
    let mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
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

  /* ════════════════════════════════════════
     BOOTSTRAP
  ════════════════════════════════════════ */
  function bootstrap() {

    const setScrollVel = initParticles();
    initLightOrb();
    initCursor();

    /* Scroll progress bar */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
      gsap.to(progressBar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 },
      });
    }

    /* ── Lenis smooth scroll ── */
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', ({ velocity }) => {
      if (setScrollVel) setScrollVel(velocity);

      /* Hero bg velocity skew */
      const skew = Math.min(Math.max(velocity * -0.25, -5), 5);
      gsap.to('#hero-bg', { skewX: skew, duration: 0.4, overwrite: 'auto' });

      /* Fast-scroll class */
      document.body.classList.toggle('is-fast-scroll', Math.abs(velocity) > 12);

      /* Nav scroll state */
      const nav = document.getElementById('nav');
      if (nav) nav.classList.toggle('nav--scrolled', lenis.scroll > 80);
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* ─────────────────────────────────────
       HERO — cinematic character entrance
    ───────────────────────────────────── */
    const heroBg      = document.getElementById('hero-bg');
    const heroEyebrow = document.getElementById('hero-eyebrow');
    const line1El     = document.getElementById('hero-line-1');
    const line2El     = document.getElementById('hero-line-2');
    const heroTagline = document.getElementById('hero-tagline');
    const heroCta     = document.getElementById('hero-cta');
    const heroScroll  = document.getElementById('hero-scroll');
    const heroContent = document.getElementById('hero-content');

    if (heroBg) {
      gsap.fromTo(heroBg,
        { scale: 1.14, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.4, ease: 'power3.out' }
      );
    }

    const tl = gsap.timeline({ delay: 0.15 });

    if (heroEyebrow) {
      tl.fromTo(heroEyebrow,
        { y: 20, opacity: 0, letterSpacing: '0.4em' },
        { y: 0, opacity: 1, letterSpacing: '0.22em', duration: 1.0, ease: 'power3.out' }, 0
      );
    }

    if (line1El) {
      const chars = splitChars(line1El);
      tl.fromTo(chars,
        { y: '115%', rotate: 6, opacity: 0 },
        { y: '0%', rotate: 0, opacity: 1, duration: 1.0, ease: 'power4.out', stagger: 0.065 }, 0.25
      );
    }

    if (line2El) {
      const chars = splitChars(line2El);
      tl.fromTo(chars,
        { y: '115%', rotate: -4, opacity: 0 },
        { y: '0%', rotate: 0, opacity: 1, duration: 1.0, ease: 'power4.out', stagger: 0.045 }, 0.45
      );
    }

    if (heroTagline) {
      tl.fromTo(heroTagline, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.85);
    }

    if (heroCta) {
      tl.fromTo(heroCta, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 1.05);
    }

    if (heroScroll) {
      tl.fromTo(heroScroll, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 1.4);
    }

    /* Hero parallax */
    if (heroBg) {
      gsap.to(heroBg, {
        y: '20%', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    if (heroContent) {
      gsap.to(heroContent, {
        y: 130, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '65% top', scrub: true },
      });
    }

    /* ─────────────────────────────────────
       PROBLEM — directional clip reveal
    ───────────────────────────────────── */
    const problemText    = document.getElementById('problem-text');
    const problemImgClip = document.querySelector('.problem__img-clip');
    const problemImg     = document.querySelector('.problem__image');

    if (problemText) {
      gsap.fromTo(problemText,
        { x: -90, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--problem', start: 'top 72%', toggleActions: 'play none none none' } }
      );
    }

    if (problemImgClip) {
      gsap.to(problemImgClip, {
        clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power4.out',
        scrollTrigger: { trigger: '.section--problem', start: 'top 68%', toggleActions: 'play none none none' },
      });
    }

    if (problemImg) {
      gsap.to(problemImg, {
        y: '-10%', ease: 'none',
        scrollTrigger: { trigger: '.section--problem', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }

    /* ─────────────────────────────────────
       PHILOSOPHY — horizontal scroll pin
    ───────────────────────────────────── */
    const philoSection = document.getElementById('philosophy');
    const philoInner   = document.getElementById('philosophy-inner');

    if (philoSection && philoInner && window.innerWidth > 768) {
      const travel = () => philoInner.scrollWidth - window.innerWidth;

      gsap.to(philoInner, {
        x: () => -travel(), ease: 'none',
        scrollTrigger: {
          trigger: philoSection,
          start: 'top top',
          end: () => `+=${travel()}`,
          pin: true, anticipatePin: 1,
          scrub: 1.2, invalidateOnRefresh: true,
        },
      });
    }

    /* ─────────────────────────────────────
       IDENTITY — alternating cascade
    ───────────────────────────────────── */
    const identityItems = document.querySelectorAll('.identity__item');
    identityItems.forEach((item, i) => {
      gsap.fromTo(item,
        { x: i % 2 === 0 ? -70 : 70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
          delay: i * 0.09,
          scrollTrigger: { trigger: '.section--identity', start: 'top 78%', toggleActions: 'play none none none' },
        }
      );

      item.addEventListener('mouseenter', () =>
        identityItems.forEach((o) => { if (o !== item) gsap.to(o, { opacity: 0.12, duration: 0.3 }); })
      );
      item.addEventListener('mouseleave', () =>
        identityItems.forEach((o) => gsap.to(o, { opacity: 1, duration: 0.4 }))
      );
    });

    /* ─────────────────────────────────────
       PRODUCT — float mockup
    ───────────────────────────────────── */
    const productInfo   = document.getElementById('product-info');
    const productMockup = document.getElementById('product-mockup');

    if (productInfo) {
      gsap.fromTo(productInfo,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--product', start: 'top 72%', toggleActions: 'play none none none' } }
      );
    }

    if (productMockup) {
      gsap.fromTo(productMockup,
        { y: 90, opacity: 0, rotateX: 8 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--product', start: 'top 65%', toggleActions: 'play none none none' } }
      );
      gsap.to(productMockup, { y: -18, duration: 3.5, ease: 'power1.inOut', yoyo: true, repeat: -1 });
    }

    /* ─────────────────────────────────────
       CULTURE — directional clip reveals
    ───────────────────────────────────── */
    const clipMap = {
      bottom: ['inset(100% 0 0 0)',   'inset(0% 0 0 0)'],
      left:   ['inset(0 0 0 100%)',   'inset(0 0 0 0%)'],
      right:  ['inset(0 100% 0 0)',   'inset(0 0% 0 0)'],
      top:    ['inset(0 0 100% 0)',   'inset(0 0 0% 0)'],
    };

    document.querySelectorAll('.culture__item[data-clip]').forEach((item, i) => {
      const [from, to] = clipMap[item.dataset.clip] || clipMap.bottom;
      gsap.fromTo(item, { clipPath: from }, {
        clipPath: to, duration: 1.2, ease: 'power4.out', delay: i * 0.14,
        scrollTrigger: { trigger: '#culture-grid', start: 'top 80%', toggleActions: 'play none none none' },
      });

      const img = item.querySelector('.culture__img');
      if (img) {
        gsap.to(img, {
          y: '-10%', ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    });

    /* ─────────────────────────────────────
       CTA — scale reveal
    ───────────────────────────────────── */
    const ctaTitle = document.getElementById('cta-title');
    const ctaSub   = document.getElementById('cta-sub');
    const ctaNote  = document.getElementById('cta-note');

    if (ctaTitle) {
      gsap.fromTo(ctaTitle,
        { scale: 0.82, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.section--cta', start: 'top 72%', toggleActions: 'play none none none' } }
      );
    }

    [ctaSub, ctaNote].forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        delay: 0.15 + i * 0.1,
        scrollTrigger: { trigger: '.section--cta', start: 'top 68%', toggleActions: 'play none none none' },
      });
    });

    /* ─────────────────────────────────────
       MAGNETIC BUTTONS
    ───────────────────────────────────── */
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.3;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.3;
        gsap.to(btn, { x: dx, y: dy, duration: 0.45, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () =>
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' })
      );
    });

    /* ─────────────────────────────────────
       STATS TICKER — seamless duplicate
    ───────────────────────────────────── */
    const ticker = document.getElementById('ticker');
    if (ticker) {
      const clone = ticker.cloneNode(true);
      clone.removeAttribute('id');
      ticker.parentNode.appendChild(clone);
    }

    /* ─────────────────────────────────────
       SECTION TEXT — fade-up
    ───────────────────────────────────── */
    document.querySelectorAll('.section__label, .section__body').forEach((el) => {
      gsap.fromTo(el, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      });
    });

    document.querySelectorAll('.mega-text').forEach((el) => {
      gsap.fromTo(el, { y: 55, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      });
    });

    /* ─────────────────────────────────────
       STATEMENT — line mask reveals
    ───────────────────────────────────── */
    const statementLines = document.querySelectorAll('.statement__line');
    if (statementLines.length) {
      gsap.fromTo(statementLines,
        { y: '105%', opacity: 0 },
        {
          y: '0%', opacity: 1,
          duration: 1.1, ease: 'power4.out',
          stagger: { each: 0.12, from: 'start' },
          scrollTrigger: { trigger: '#statement', start: 'top 70%', toggleActions: 'play none none none' },
        }
      );
    }

    /* ─────────────────────────────────────
       METRICS — animated counters
    ───────────────────────────────────── */
    const metricValues = document.querySelectorAll('.metrics__value[data-target]');
    if (metricValues.length) {
      ScrollTrigger.create({
        trigger: '#metrics-grid',
        start: 'top 75%',
        once: true,
        onEnter: () => {
          metricValues.forEach((el) => {
            const target  = parseInt(el.dataset.target, 10);
            const prefix  = el.dataset.prefix  || '';
            const suffix  = el.dataset.suffix  || '';
            const obj     = { val: 0 };
            gsap.to(obj, {
              val: target, duration: 1.8, ease: 'power3.out',
              onUpdate() { el.textContent = prefix + Math.round(obj.val) + suffix; },
            });
            /* Animate progress bar */
            const item = el.closest('.metrics__item');
            if (item) item.classList.add('is-counted');
          });
        },
      });
    }

    /* ─────────────────────────────────────
       FOOTER — statement reveal
    ───────────────────────────────────── */
    const footerStatement = document.getElementById('footer-statement');
    if (footerStatement) {
      gsap.fromTo(footerStatement,
        { y: 80, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.3, ease: 'power3.out',
          scrollTrigger: { trigger: '.footer__cta-wrap', start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
    }

    /* ─────────────────────────────────────
       PWA INSTALL PROMPT
    ───────────────────────────────────── */
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
