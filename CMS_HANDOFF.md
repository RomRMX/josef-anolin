# Client Editing Handoff

This site is wired for a Git-backed Decap CMS at `/admin`.

## Client Workflow

1. Visit `https://www.josefanolin.com/admin`.
2. Log in with the approved GitHub account.
3. Edit the website content.
4. Save and publish.
5. Decap commits the change to GitHub.
6. Vercel automatically rebuilds and publishes the live site.

## One-Time Launch Setup

Before the live CMS can authenticate, create a Decap-compatible GitHub OAuth provider and update `public/admin/config.yml`.

Required values:

- GitHub repository: `RomRMX/josef-anolin`
- Production site: `https://www.josefanolin.com`
- CMS URL: `https://www.josefanolin.com/admin`
- OAuth callback URL: `https://YOUR-DECAP-OAUTH-PROVIDER.example.com/callback`

After the OAuth provider is deployed, replace this placeholder in `public/admin/config.yml`:

```yml
base_url: https://YOUR-DECAP-OAUTH-PROVIDER.example.com
```

## Editable Content

The CMS edits `src/data/siteContent.json`, which powers:

- Hero name, tagline, button label, and bio
- Contact copy and email
- Show dates
- Appearance credits
- YouTube videos
- Photo gallery
- Products
- Store policies
- Social links

Images uploaded in the CMS are stored in `public/uploads` and referenced on the site as `/uploads/...`.
