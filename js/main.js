/* ============================================
   SYNTH PORTFOLIO — Interactivity
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const closeMobileMenu = () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        closeMobileMenu();
      }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Reset mobile menu on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 600 && navMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Scroll Reveal Animation
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Skill Bar Animation
  const skillBars = document.querySelectorAll('.skill-fill');

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.style.width;
        bar.style.width = '0';
        requestAnimationFrame(() => {
          setTimeout(() => {
            bar.style.width = width;
          }, 100);
        });
        skillsObserver.unobserve(bar);
      }
    });
  }, {
    threshold: 0.5
  });

  skillBars.forEach(bar => skillsObserver.observe(bar));

  // Smooth Scroll for Anchor Links (fallback)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Live GitHub Stats Fetch
  const fetchGitHubStats = async () => {
    const liveNote = document.getElementById('github-live-note');
    const liveCards = document.querySelectorAll('.stat-card[data-stat]');

    if (!liveCards.length) return;

    try {
      if (liveNote) liveNote.classList.add('loading');
      const resp = await fetch('https://api.github.com/users/synthalorian', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });

      if (!resp.ok) throw new Error('GitHub API error');

      const data = await resp.json();

      liveCards.forEach(card => {
        const stat = card.dataset.stat;
        const el = card.querySelector('.stat-number[data-live]');
        const fallback = card.dataset.fallback;
        if (!el) return;

        let value;
        switch (stat) {
          case 'repos': value = data.public_repos; break;
          case 'followers': value = data.followers; break;
          case 'following': value = data.following; break;
          case 'projects': value = 10; break;
          default: value = fallback || '—';
        }

        if (value !== undefined && value !== null) {
          el.dataset.counterTarget = value;
          el.dataset.counterSuffix = '';
          el.textContent = String(value);
        } else {
          el.textContent = fallback || '—';
        }
      });

      if (liveNote) {
        liveNote.classList.remove('loading');
        liveNote.querySelector('span:last-child').innerHTML = 'Stats synced from <a href="https://github.com/synthalorian" target="_blank" rel="noopener">GitHub API</a>';
      }
    } catch (err) {
      console.warn('GitHub stats fetch failed:', err);
      if (liveNote) {
        liveNote.classList.remove('loading');
        liveNote.classList.add('error');
        liveNote.querySelector('span:last-child').textContent = 'Stats shown are cached — live sync unavailable';
      }
      liveCards.forEach(card => {
        const el = card.querySelector('.stat-number[data-live]');
        const fallback = card.dataset.fallback;
        if (el && fallback) el.textContent = fallback;
      });
    }
  };

  fetchGitHubStats();

  // Counter Animation for Stats
  const statNumbers = document.querySelectorAll('.stat-number');

  const animateCounter = (el, target, suffix = '') => {
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * easeOut);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Read target from data attribute if already set, otherwise parse once
        let target = parseInt(el.dataset.counterTarget, 10);
        let suffix = el.dataset.counterSuffix || '';

        if (isNaN(target)) {
          const text = el.textContent.trim();
          const numMatch = text.match(/(\d+)/);
          suffix = text.replace(/\d+/, '');
          if (numMatch) {
            target = parseInt(numMatch[1], 10);
          }
          el.dataset.counterTarget = target;
          el.dataset.counterSuffix = suffix;
        }

        if (!isNaN(target)) {
          el.textContent = '0' + suffix;
          animateCounter(el, target, suffix);
        }

        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => statsObserver.observe(stat));
});
