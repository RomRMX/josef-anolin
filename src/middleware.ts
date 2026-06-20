// Gatekeeper for the admin API. Any /api/admin/* route (except login) requires
// a valid session cookie; otherwise it returns 401 before the handler runs.
// The /admin page itself is public — it renders its own login form when the
// visitor isn't authenticated.

import { defineMiddleware } from "astro:middleware";
import { isAuthed } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Public, pre-session routes: password login and the Google OAuth handshake.
  const isLoginRoute =
    pathname === "/api/admin/login" || pathname.startsWith("/api/admin/auth/");

  if (pathname.startsWith("/api/admin/") && !isLoginRoute) {
    if (!(await isAuthed(context.cookies))) {
      return new Response(JSON.stringify({ error: "Not authorized." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
  }

  return next();
});
