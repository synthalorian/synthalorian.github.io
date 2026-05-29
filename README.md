# Synthwave '84 — Retro-Futuristic Portfolio Theme

A custom-built, fully responsive portfolio theme inspired by 1980s neon aesthetics — sunset gradients, chrome reflections, and grid-lined horizons. Built with pure CSS, vanilla JavaScript, and zero frameworks.

## Features

- **Animated Hero Scene** — CSS-driven retro landscape with stars, sun, grid floor, and palm silhouettes
- **Dark / Light Theme Toggle** — instant switch via CSS custom properties, preference persisted to localStorage
- **Project Cards** — responsive grid with tech tags, status badges, version labels, and live GitHub stats
- **Scroll Reveal Animations** — IntersectionObserver-based entrance animations
- **GitHub API Integration** — auto-populates stars, forks, primary language, and last-updated date
- **Accessibility** — ARIA labels, skip links, keyboard-navigable, reduced-motion support
- **Zero Dependencies** — only a lightweight CSS reset (Picnic CSS). No build step. No bundler.

## Quick Start

1. Fork this repo
2. Rename it to `yourusername.github.io` for GitHub Pages hosting
3. Replace the demo projects in `index.html` with your own repos
4. Update `data-repo` attributes with your GitHub username/repo-name
5. Push — GitHub Pages will auto-deploy

## Customization

All colors are CSS custom properties in `:root`. Edit `css/style.css` to change the palette:

```css
:root {
  --bg-primary: #0d0221;
  --accent-purple: #8f00ff;
  --accent-pink: #ff00ff;
  --accent-cyan: #03edf9;
  /* ... */
}
```

## File Structure

```
.
├── index.html          # Main page — replace demo content with your own
├── css/
│   └── style.css       # All theme styles, animations, and responsive rules
├── js/
│   └── main.js         # Theme toggle, mobile nav, scroll reveal, GitHub stats
└── .nojekyll           # Required for GitHub Pages to serve CSS/JS properly
```

## License

MIT — free to use, fork, modify, and ship.

---

*This is the wave.*
