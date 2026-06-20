# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static personal site for stand-up comedian Josef Anolin, rebuilt from a Carrd template (https://www.josefanolin.com). Single-page stacking-card layout: Hero → Shows (Dates + Notable) → Media (Videos + Pics) → Shop → Contact.

## Stack

- **Astro 5** (default `static` output, with on-demand routes) and the Vercel adapter — see `astro.config.mjs`. Most pages prerender to static HTML, but the homepage (`index.astro`) and the admin + `/api/*` routes set `export const prerender = false`, so they render as serverless functions. This is what lets owner edits go live without a rebuild.
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

### Content editing (owner-facing)

Owner-editable copy is **no longer hardcoded** in the section files. It lives in a
`SiteContent` document that the owner edits through a password-protected admin —
see **`ADMIN.md`** for the setup and workflow. Key pieces:

- `src/data/defaults.ts` — the `SiteContent` type and the seed/default values (what
  renders before anything is saved, and the fallback if the store is unreachable).
- `src/lib/content.ts` — `getContent()` / `saveContent()`; persists to a KV store in
  production (`KV_REST_API_URL` / `KV_REST_API_TOKEN`) or `.data/content.json` in dev,
  always merged over the defaults.
- `src/lib/auth.ts` + `src/lib/google.ts` + `src/middleware.ts` — auth: **Google
  sign-in** (allowlisted via `ADMIN_ALLOWED_EMAILS`) and an optional password
  fallback, both ending in one signed cookie; middleware guards `/api/admin/*`
  (login routes `/api/admin/login` + `/api/admin/auth/*` stay public).
- `src/pages/admin/index.astro` + `src/scripts/admin-editor.ts` — the editor UI.
- `src/pages/api/admin/*` — `login`, `logout`, `content` (GET/PUT), `upload`,
  `auth/google`, `auth/callback`.

`index.astro` calls `getContent()` and passes slices down as props. Each section
component (`Hero`, `Dates`, `Notable`, `Videos`, `Pics`, `Contact`,
`MobileSocialBar`, and `Base`) takes a prop **with a default from `defaultContent`**,
so it still renders standalone. To change the *default* copy, edit
`src/data/defaults.ts`; to change *live* copy, use `/admin`.

Editable today: Hero bio, social links, shows/dates, appearances, videos, photos
(with upload), **merch** (products/prices + an `open`/`coming-soon` toggle), and
contact. The shop catalog now lives in the content store: `Shop.astro` renders the
storefront from `content.products` when `content.shopStatus === "open"` (else the
placeholder), and `api/checkout.ts` reads prices from `getContent()` — so the
browser still can't set its own price (there is no more `src/data/products.ts`).
**Not** yet editable (still in code): `PoliciesContent.astro`.

Structural bits that are still code-level: `Header.astro` `links[]` (nav anchors;
section ids must match) and `CartDrawer.astro` (the slide-in cart + Stripe redirect).

## Assets

- `public/joe-logo.png` — title-treatment logo (yellow + white grunge type), used in the hero.
- `public/joe-hero.png` — portrait on yellow brushstroke, used in the hero and as the OG image.
- `public/pics/joe-01.webp` … `joe-20.webp` — gallery photos rendered by `Pics.astro`.
- `public/socials/social__*.png` — social icon glyphs used by both desktop header and mobile bar.
- `source-images/` — original PNG/JPG sources for the gallery, kept in the repo for re-export but **outside `public/`** so they don't ship with the build.

The accent color (`--color-accent: #f5e90b`) is tuned to match the logo's yellow. Changing it ripples through buttons, hover states, and the section-rule gradient.

## Known placeholders

The seed content in `src/data/defaults.ts` ships with no shows (`shows: []`), so the
SHOWS section renders "Updates Coming Soon!" until the owner adds dates in `/admin`.
Contact has no Formspree ID by default (the form falls back to a `mailto:` link).
The shop is still "opening soon" (`Shop.astro` is a placeholder; the catalog in
`src/data/products.ts` reuses generic mockup images — see its `TODO(artwork)`).

## Deploy

Vercel: `vercel` (or push to a connected GitHub repo). The `@astrojs/vercel` adapter writes `.vercel/output/` during `npm run build`, which Vercel picks up automatically.
