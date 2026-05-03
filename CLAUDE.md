# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static personal site for stand-up comedian Josef Anolin, rebuilt from a Carrd template (https://www.josefanolin.com). Single-page stacking-card layout: Hero → Shows (Dates + Notable) → Media (Videos + Pics) → Shop → Contact.

## Stack

- **Astro 5** (static output) with the Vercel adapter — see `astro.config.mjs`. Adapter is wired but the build emits static HTML; `vercel deploy` works without serverless functions.
- **Tailwind v4** via `@tailwindcss/vite`. There is no `tailwind.config.*` — design tokens (colors, fonts) live in the `@theme` block in `src/styles/global.css` and are referenced as `var(--color-accent)` / `font-[family-name:var(--font-display)]` etc.
- **Fonts:** Inter (body) + Anton (display) loaded from Google Fonts in `src/layouts/Base.astro`.

## Commands

```bash
npm run dev       # astro dev — http://localhost:4321
npm run build     # static build to dist/ + .vercel/output/
npm run preview   # serve the production build locally
```

There are no tests, linter, or formatter configured.

## Architecture

One page (`src/pages/index.astro`) composes section components from `src/components/` into a **stacking-cards scroll layout** (inspired by https://scroll-driven-animations.style/demos/stacking-cards/css/). Each card is a sticky, full-viewport `<article>` that stays pinned to the top while later cards slide up over it.

Cards (in DOM order):
1. Hero
2. Shows = Dates + Notable (`#shows`)
3. Media = Videos + Pics (`#media`)
4. Shop (`#shop`) — taller than 100dvh so the tee column scrolls fully off before Contact stacks
5. Contact (`#contact`)

Followed by a `.stack-tail` spacer that extends `.stack` so the Shop card stays pinned through the Contact handoff (sticky math unsticks Shop ~half a viewport early without it).

Snap behavior: `html { scroll-snap-type: y proximity }` with `.card { scroll-snap-align: start }` (no `scroll-snap-stop`). Soft snap rests cards cleanly at boundaries when the user stops near one, but gestures and anchor jumps cross multiple cards freely. Mandatory snap + `scroll-snap-stop: always` was tried and rejected — it blocked programmatic upward scrolls (back-to-top, header anchors going backward) at the first intermediate snap point.

Critical CSS gotcha: `.stack` must be `display: block`, **not** `display: grid`. With grid, each card's containing block becomes its own grid track, which kills the sticky stacking range — cards swap instead of stacking. Stick with block layout. Tested 2026-04-27.

`prefers-reduced-motion: reduce` falls back to a non-sticky linear scroll.

To edit content, edit the section file directly:

- `Hero.astro` — bio paragraph
- `Header.astro` — `links[]` (nav anchors) and `socials[]` (icon row); section ids must match the `links[]` hrefs
- `MobileSocialBar.astro` — fixed-bottom social row on mobile; mirrors `socials[]` from Header
- `Dates.astro` — `dates[]` array of `{date, city, venue, address, tickets}`
- `Videos.astro` — `reels[]` array of Instagram permalinks; renders the official IG embed.js when populated, otherwise shows a placeholder card
- `Pics.astro` — `pics[]` array of paths relative to `/public/pics/` (currently `/pics/joe-01.webp` … `joe-20.webp`)
- `Notable.astro` — `groups[]` (Headlining / Featured / Festivals)
- `Shop.astro` / `CartDrawer.astro` — tee shop + slide-in cart
- `Contact.astro` — form action defaults to a `mailto:` fallback; set `FORMSPREE_ID` in the frontmatter to POST to Formspree

## Assets

- `public/joe-logo.png` — title-treatment logo (yellow + white grunge type), used in the hero.
- `public/joe-hero.png` — portrait on yellow brushstroke, used in the hero and as the OG image.
- `public/pics/joe-01.webp` … `joe-20.webp` — gallery photos rendered by `Pics.astro`.
- `public/socials/social__*.png` — social icon glyphs used by both desktop header and mobile bar.
- `source-images/` — original PNG/JPG sources for the gallery, kept in the repo for re-export but **outside `public/`** so they don't ship with the build.

The accent color (`--color-accent: #f5e90b`) is tuned to match the logo's yellow. Changing it ripples through buttons, hover states, and the section-rule gradient.

## Known placeholders

The original Carrd site had placeholder event data (joke addresses like "1984 Somewhere Ave.", all "TICKETS" links pointing at `https://www.ticketmaster.com`). That data is preserved verbatim in `Dates.astro` — replace before going live. Same for the Formspree endpoint in `Contact.astro` and the empty `reels[]` array in `Videos.astro`.

## Deploy

Vercel: `vercel` (or push to a connected GitHub repo). The `@astrojs/vercel` adapter writes `.vercel/output/` during `npm run build`, which Vercel picks up automatically.
