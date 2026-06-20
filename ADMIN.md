# Site Editor (`/admin`)

The owner edits the site at **`https://www.josefanolin.com/admin`** by signing
in with Google — no GitHub account, no rebuild. Changes save to a cloud store
and appear on the next page load (the homepage is server-rendered on demand).

## Owner workflow

1. Go to `/admin`.
2. Click **Sign in with Google** and pick the authorized account.
3. Edit any section, then click **Save changes**.
4. Open the site (or refresh) — the update is live.

Only Google accounts listed in `ADMIN_ALLOWED_EMAILS` can get in; everyone else
is rejected after the Google screen.

Editable sections: **Hero bio**, **Social links**, **Shows** (tour dates),
**Appearances**, **Videos**, **Photos** (with upload), and **Contact**.

## One-time launch setup (Vercel)

Set these in **Vercel → Project → Settings → Environment Variables**, then redeploy.

| Variable | Required | What it does |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | ✅ | OAuth 2.0 Web client id (Google sign-in). |
| `GOOGLE_CLIENT_SECRET` | ✅ | OAuth 2.0 Web client secret. |
| `ADMIN_ALLOWED_EMAILS` | ✅ | Comma-separated Google accounts allowed in, e.g. `josefanolin@gmail.com`. |
| `ADMIN_SECRET` | recommended | Long random string used to sign the session cookie. |
| `KV_REST_API_URL` | ✅ | Cloud store endpoint (where edits are saved). |
| `KV_REST_API_TOKEN` | ✅ | Cloud store auth token. |
| `BLOB_READ_WRITE_TOKEN` | for photo uploads | Lets the owner upload images. Without it, photos can still be added by URL. |
| `ADMIN_PASSWORD` | optional | Enables a password fallback alongside Google. Leave unset for Google-only. |

### Setting up Google sign-in

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create (or pick) a project and configure the **OAuth consent screen**
   (External). Add the owner's email under **Test users**, or publish the app.
2. Create an **OAuth client ID** → application type **Web application**.
3. Under **Authorized redirect URIs**, add both:
   - `https://www.josefanolin.com/api/admin/auth/callback`
   - `http://localhost:4321/api/admin/auth/callback` (for local testing)
4. Copy the **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID` /
   `GOOGLE_CLIENT_SECRET`, and set `ADMIN_ALLOWED_EMAILS` to the owner's Gmail.

If the redirect URI doesn't match exactly, Google shows a `redirect_uri_mismatch`
error — the path is always `/api/admin/auth/callback`.

### Provisioning the store

1. In the Vercel dashboard, open **Storage** and create a **KV / Upstash Redis**
   store, then **Connect** it to this project. Vercel injects `KV_REST_API_URL`
   and `KV_REST_API_TOKEN` automatically. (Upstash's own
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` names are also accepted.)
2. For photo uploads, create a **Blob** store the same way — it injects
   `BLOB_READ_WRITE_TOKEN`.
3. Add `ADMIN_PASSWORD` (and ideally `ADMIN_SECRET`) by hand.
4. Redeploy.

Until a KV store is connected, the editor loads but shows a read-only banner and
the site serves the built-in default content.

## Local development

`npm run dev` needs no services:

- The password login is shown and defaults to **`admin`** (override with
  `ADMIN_PASSWORD` in `.env`). Google sign-in only appears once
  `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `ADMIN_ALLOWED_EMAILS` are set —
  to test it locally, add a Google client whose redirect URI is
  `http://localhost:4321/api/admin/auth/callback`.
- Edits persist to `.data/content.json` (gitignored).
- Photo uploads save into `public/uploads/` (gitignored).

## How it works

- `src/data/defaults.ts` — the seed content + the `SiteContent` type. This is what
  the site shows before anything is saved.
- `src/lib/content.ts` — reads/writes the store (KV in prod, local file in dev) and
  always merges over the defaults.
- `src/lib/auth.ts` — password check, signed-cookie session, and the OAuth CSRF
  state cookie. `src/lib/google.ts` — the Google OAuth handshake.
- `src/middleware.ts` — guards `/api/admin/*`, leaving the login routes
  (`/api/admin/login`, `/api/admin/auth/*`) public.
- `src/pages/api/admin/*` — `login`, `logout`, `content` (GET/PUT), `upload`, and
  `auth/google` + `auth/callback` (Google sign-in). All sign-ins end in the same
  signed session cookie, so the rest of the app is identical regardless of method.
- `src/pages/admin/index.astro` + `src/scripts/admin-editor.ts` — the login +
  editor UI.
- `src/pages/index.astro` is `prerender = false` and reads the store per request,
  so saved edits go live without a deploy.

## Not yet editable (developer-managed)

The **shop catalog / prices** (`src/data/products.ts`, used by Stripe checkout) and
the **legal/policy pages** (`src/components/PoliciesContent.astro`) are intentionally
left in code for now — the shop is still "opening soon" and policy copy is legal
boilerplate. They can be added to the editor as a phase 2.
