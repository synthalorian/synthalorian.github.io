/* ============================================
   SYNTH PORTFOLIO — BLACKSHIELD INTERACTIVITY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // =====================================================
  // THEME TOGGLE — Blackshield (default) ↔ Ironlight
  // =====================================================
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const STORAGE_KEY = 'synth-theme';

  const normalizeTheme = (theme) => {
    if (theme === 'ironlight' || theme === 'cyberlight') return 'ironlight';
    return 'blackshield';
  };

  const applyTheme = (theme) => {
    const normalized = normalizeTheme(theme);
    html.setAttribute('data-theme', normalized);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', normalized === 'ironlight' ? '#eeebe3' : '#07080a');
    }
  };

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  applyTheme(savedTheme || 'blackshield');
  html.classList.add('reveal-ready');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = normalizeTheme(html.getAttribute('data-theme'));
      const next = current === 'blackshield' ? 'ironlight' : 'blackshield';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // =====================================================
  // GITHUB API — shared repo payload
  // =====================================================
  const repoFetchHeaders = { Accept: 'application/vnd.github.v3+json' };
  let repoCachePromise = null;

  const fetchRepos = async () => {
    if (!repoCachePromise) {
      repoCachePromise = fetch('https://api.github.com/users/synthalorian/repos?per_page=100&sort=updated', {
        headers: repoFetchHeaders
      }).then((resp) => {
        if (!resp.ok) throw new Error('GitHub repos API error');
        return resp.json();
      });
    }
    return repoCachePromise;
  };

  const formatCount = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  };

  const timeAgo = (iso) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'today';
    if (diffDays === 1) return '1d';
    if (diffDays < 30) return `${diffDays}d`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
    return `${Math.floor(diffDays / 365)}y`;
  };

  // =====================================================
  // PER-REPO STATS
  // =====================================================
  const fetchRepoStats = async () => {
    const repoCards = document.querySelectorAll('[data-repo-stats]');
    if (!repoCards.length) return;

    try {
      const repos = await fetchRepos();
      const repoMap = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo]));

      repoCards.forEach((card) => {
        const repoName = card.dataset.repoStats;
        const statsContainer = card.classList.contains('project-stats') ? card : card.querySelector('.project-stats');
        const repo = repoName ? repoMap.get(repoName.toLowerCase()) : null;
        if (!statsContainer || !repo) return;

        const stars = statsContainer.querySelector('[data-stat="stars"]');
        const forks = statsContainer.querySelector('[data-stat="forks"]');
        const lang = statsContainer.querySelector('[data-stat="lang"]');
        const updated = statsContainer.querySelector('[data-stat="updated"]');

        if (stars) stars.textContent = formatCount(repo.stargazers_count);
        if (forks) forks.textContent = formatCount(repo.forks_count);
        if (lang) lang.textContent = repo.language || '—';
        if (updated) updated.textContent = timeAgo(repo.pushed_at);
      });
    } catch (err) {
      console.warn('Repo stats fetch failed:', err);
    }
  };

  setTimeout(fetchRepoStats, 650);

  // =====================================================
  // GLOBAL GITHUB STATS
  // =====================================================
  const fetchGitHubStats = async () => {
    const liveNote = document.getElementById('github-live-note');
    const liveCards = document.querySelectorAll('.stat-card[data-stat]');
    if (!liveCards.length) return;

    try {
      if (liveNote) liveNote.classList.add('loading');

      const [userResp, repos] = await Promise.all([
        fetch('https://api.github.com/users/synthalorian', { headers: repoFetchHeaders }),
        fetchRepos()
      ]);

      if (!userResp.ok) throw new Error('GitHub user API error');
      const user = await userResp.json();
      const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      const projectCount = document.querySelectorAll('.project-card').length;

      liveCards.forEach((card) => {
        const stat = card.dataset.stat;
        const el = card.querySelector('.stat-number[data-live]');
        const fallback = card.dataset.fallback;
        if (!el) return;

        let value;
        switch (stat) {
          case 'repos':
            value = user.public_repos;
            break;
          case 'stars':
            value = totalStars;
            break;
          case 'projects':
            value = projectCount;
            break;
          default:
            value = fallback || '—';
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
        const noteText = liveNote.querySelector('span:last-child');
        if (noteText) {
          noteText.innerHTML = 'Stats synced from <a href="https://github.com/synthalorian" target="_blank" rel="noopener">GitHub API</a>';
        }
      }
    } catch (err) {
      console.warn('GitHub stats fetch failed:', err);
      if (liveNote) {
        liveNote.classList.remove('loading');
        liveNote.classList.add('error');
        const noteText = liveNote.querySelector('span:last-child');
        if (noteText) noteText.textContent = 'Stats shown are cached — live sync unavailable';
      }
      liveCards.forEach((card) => {
        const el = card.querySelector('.stat-number[data-live]');
        const fallback = card.dataset.fallback;
        if (el && fallback) el.textContent = fallback;
      });
    }
  };

  fetchGitHubStats();

  // =====================================================
  // MOBILE NAVIGATION
  // =====================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const closeMobileMenu = () => {
    if (!navToggle || !navMenu) return;
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

    navLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 640 && navMenu.classList.contains('open')) closeMobileMenu();
    });
  }

  // =====================================================
  // NAVBAR SCROLL STATE
  // =====================================================
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.pageYOffset > 40);
  }, { passive: true });

  // =====================================================
  // SCROLL REVEAL
  // =====================================================
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px'
  });

  revealElements.forEach((el) => revealObserver.observe(el));

  // =====================================================
  // SKILL BARS
  // =====================================================
  const skillBars = document.querySelectorAll('.skill-fill');
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const width = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.width = width;
        }, 90);
      });
      skillsObserver.unobserve(bar);
    });
  }, { threshold: 0.45 });

  skillBars.forEach((bar) => skillsObserver.observe(bar));

  // =====================================================
  // STAT COUNTERS
  // =====================================================
  const statNumbers = document.querySelectorAll('.stat-number');

  const animateCounter = (el, target, suffix = '') => {
    const duration = 1300;
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
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      let target = parseInt(el.dataset.counterTarget, 10);
      let suffix = el.dataset.counterSuffix || '';

      if (Number.isNaN(target)) {
        const text = el.textContent.trim();
        const numMatch = text.match(/(\d+)/);
        suffix = text.replace(/\d+/, '');
        if (numMatch) target = parseInt(numMatch[1], 10);
        el.dataset.counterTarget = target;
        el.dataset.counterSuffix = suffix;
      }

      if (!Number.isNaN(target)) {
        el.textContent = `0${suffix}`;
        animateCounter(el, target, suffix);
      }

      statsObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach((stat) => statsObserver.observe(stat));

  // =====================================================
  // SMOOTH ANCHOR FALLBACK
  // =====================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (event) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
