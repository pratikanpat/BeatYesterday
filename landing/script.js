/**
 * BeatYesterday — Landing Page Script
 *
 * Cinematic scroll reveals, parallax depth, nav behavior,
 * identity hover interactions, PWA install prompt.
 * Vanilla JS. No GSAP. No jQuery. No 37 libraries.
 */

(function () {
  'use strict';

  // ═══ SCROLL REVEAL (IntersectionObserver) ═══
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ═══ NAV SCROLL BEHAVIOR ═══
  const nav = document.getElementById('nav');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ═══ HERO PARALLAX ═══
  const heroContent = document.querySelector('.hero__content');
  const heroGlow = document.querySelector('.hero__glow');
  const heroVideoWrap = document.querySelector('.hero__video-wrap');

  let parallaxTicking = false;

  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        if (scrollY < windowHeight) {
          const progress = scrollY / windowHeight;
          const translateY = scrollY * 0.35;
          const opacity = 1 - progress * 1.3;

          if (heroContent) {
            heroContent.style.transform = `translateY(${translateY}px)`;
            heroContent.style.opacity = Math.max(0, opacity);
          }

          if (heroGlow) {
            heroGlow.style.transform = `translate(-50%, -50%) scale(${1 + progress * 0.35})`;
            heroGlow.style.opacity = Math.max(0, 1 - progress);
          }

          // Subtle parallax on background
          if (heroVideoWrap) {
            heroVideoWrap.style.transform = `translateY(${scrollY * 0.15}px)`;
          }
        }

        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  }, { passive: true });

  // ═══ IDENTITY ITEMS — STAGGER ON HOVER ═══
  const identityItems = document.querySelectorAll('.identity__item');
  identityItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      identityItems.forEach((other) => {
        if (other !== item) {
          other.style.opacity = '0.25';
          other.style.transition = 'opacity 0.3s ease';
        }
      });
    });

    item.addEventListener('mouseleave', () => {
      identityItems.forEach((other) => {
        other.style.opacity = '1';
      });
    });
  });

  // ═══ CULTURE GRID — HOVER DEPTH ═══
  const cultureItems = document.querySelectorAll('.culture__item');
  cultureItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'scale(1.02)';
      item.style.transition = 'transform 0.4s cubic-bezier(0, 0, 0.2, 1)';
      item.style.zIndex = '2';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'scale(1)';
      item.style.zIndex = '1';
    });
  });

  // ═══ INSTALL BUTTON — PWA INSTALL PROMPT ═══
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
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[Install] User ${outcome}`);
        deferredPrompt = null;
      }
      // If no deferred prompt, let the href="/app" navigate naturally
    });
  }

  // ═══ SMOOTH SCROLL FOR ANCHOR LINKS ═══
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ═══ INITIAL HERO REVEAL ═══
  // Cinematic stagger: reveal hero elements after short delay
  setTimeout(() => {
    const heroReveals = document.querySelectorAll('.hero [data-reveal]');
    heroReveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), i * 180);
    });
  }, 300);

})();
