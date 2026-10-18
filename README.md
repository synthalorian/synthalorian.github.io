![synthalorian.github.io](.github/preview.png)

# synthalorian.github.io

Personal site of synth, the synthalorian. Synthwave '84: deep purple night, magenta and cyan neon, a striped sunset, and a grid rolling to the horizon.

**Live:** https://synthalorian.github.io

## What it is

Static portfolio on GitHub Pages. Single page, live GitHub stats, featured projects, and the synthwave visual system. The pixel synthalorian rides in the bottom-left corner at every width (32px on narrow screens, 64px in the wide gutter from 1360px) — idle by default, he walks on hover or focus, and each click (Enter/Space too) plays his next move once: thinking, working, success, error, blaster, jetpack. The 404 page shows him mid-error. Under `prefers-reduced-motion` every sprite falls back to the static PNG and the grid and sun hold still.

Knight A, the Blackshield Company mascot, appears only beside the Blackshield Company studio card.

## Layout

- `index.html` — the page
- `404.html` — lost-signal page
- `css/style.css` — the only stylesheet (synthwave default theme + daybreak light theme)
- `js/main.js` — stats, theme toggle
- `js/sprite.js` — the corner synthalorian (idle, walk on hover/focus, click plays the next move)
- `fonts/3270-nerd-font.woff2` — self-hosted 3270 Nerd Font (Nerd Fonts v3.5.1, Latin subset), license in `fonts/3270-NERD-FONT-LICENSE.txt`
- `img/synthalorian-avatar-*.{webp,jpg}` — cockpit avatar, 460 and 920 px
- `img/og-synthalorian.jpg` — 1200×630 share card
- `img/sprite/` — pixel synthalorian: idle, walk and error GIFs, 6-frame move sheets (32/64px), static PNGs
- `img/knight/` — Knight A animated SVGs (Blackshield Company mascot)
- `favicon.svg` — pixel synthwave sunset (same art as the nav icon); `apple-touch-icon.png` — the cockpit avatar
