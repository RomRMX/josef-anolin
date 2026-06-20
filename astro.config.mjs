import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.josefanolin.com',
  adapter: vercel(),
  devToolbar: { enabled: false },
  // Astro's CSRF origin check false-positives behind Vercel's proxy (the site is
  // configured for www but is also served on the apex), which 403'd non-JSON
  // admin requests like logout and image uploads. The admin session cookie is
  // httpOnly + SameSite=Lax, which already prevents cross-site CSRF, so this
  // check is redundant here.
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
