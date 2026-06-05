# Portfolio — Tobin Zolkowski

Personal site for Tobin Zolkowski: data analyst, reporting & BI, data journalism.
A **React + Vite + TypeScript** single-page app, styled with **Tailwind CSS**,
deployed to **GitHub Pages** via GitHub Actions.

**Live:** https://tzolkowski96.github.io/portfolio/

## Stack

- **React 18 + TypeScript** — component UI, type-safe content models
- **Vite 5** — dev server + production build (`base: /portfolio/`)
- **Tailwind CSS 3** — design tokens, the 8px spacing system, responsive utilities
- **GitHub Actions** — build + deploy to Pages on push and on a 6-hour schedule

## Structure

```
portfolio/
├── index.html                  Vite entry: SEO/OG meta, fonts, #root mount
├── src/
│   ├── main.tsx                React bootstrap
│   ├── App.tsx                 Page composition + scroll-spy
│   ├── index.css               Tailwind layers, focus ring, reduced-motion
│   ├── components/             One component per section + shared primitives/
│   ├── hooks/                  useFeed (live Medium feed), useScrollSpy
│   ├── lib/text.tsx            emphasizeFigures — bolds metrics for hierarchy
│   └── data/                   All content as typed modules (no copy in JSX)
├── public/
│   ├── og-image.png            Social share card
│   ├── feed.json               Generated at build time (gitignored)
│   └── .nojekyll
├── scripts/build_feed.py       Builds public/feed.json from the Medium RSS feed
├── .github/workflows/deploy.yml  Build + deploy to Pages (push + schedule)
├── tailwind.config.js          Design tokens (colors, type scale, tap targets)
└── vite.config.ts              base path, dev server, build options
```

Structure, style, and behavior are separated: content lives in `src/data/*` as
typed modules, presentation in `src/components/*`, behavior in `src/hooks/*`.

## Local development

```sh
npm install
npm run dev        # http://localhost:5173  (base "/" in dev)
npm run build      # production build to dist/ (base "/portfolio/")
npm run preview    # serve the production build locally
npm run typecheck  # tsc --noEmit
```

`base` is conditional in `vite.config.ts`: `/` for local dev so the root URL
works, `/portfolio/` for the production build so assets resolve under the Pages
subpath.

## Design system

Tokens live in `tailwind.config.js`. The palette preserves the editorial
"data-record" identity (cream / ink / red) but every text/background pair clears
**WCAG AA**: muted labels are `#565650` (5.96:1), the red is split into a
text-safe `signal` `#c41f00` (4.78:1) and a graphic-only `signal-graphic`
`#ff2d16` (≥24px only), and the focus ring is a distinct blue `#1d4ed8` so
keyboard focus is never confused with the accent. Spacing follows an 8px grid;
interactive targets are ≥48×48px; motion respects `prefers-reduced-motion`.

## The writing feed

The Writing section shows the latest Medium posts, kept current without manual
editing:

1. `scripts/build_feed.py` reads the Medium RSS feed, pulls a clean subtitle
   (`og:description`) for each post, drops anything on its `SKIP` list, and writes
   the six newest to `public/feed.json`.
2. `deploy.yml` runs that script during every build (on push and every 6 hours),
   so `feed.json` is baked fresh into each deploy — never committed by hand.
3. `useFeed()` fetches `feed.json` at runtime and hydrates the feed. Until it
   resolves, the fallback posts baked into `src/data/writing.ts` render, so the
   section is never empty and never shifts layout.

To change which posts are filtered out, edit the `SKIP` list in
`scripts/build_feed.py`.

## Deployment

GitHub Pages, **source = GitHub Actions** (Settings → Pages → Build and
deployment → Source: GitHub Actions). `deploy.yml` installs deps, generates the
feed, runs `vite build`, and publishes `dist/` with `actions/deploy-pages`.

If the repo is renamed or moved off `tzolkowski96.github.io/portfolio/`, update
`base` in `vite.config.ts` and the three absolute URLs in `index.html`'s `<head>`
(`canonical`, `og:url`, `og:image`).
