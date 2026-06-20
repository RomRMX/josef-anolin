import type { APIRoute } from "astro";
import { newState, setOAuthState } from "../../../../lib/auth";
import { googleConfig, buildAuthUrl } from "../../../../lib/google";

export const prerender = false;

// Kick off the Google sign-in flow: stash a CSRF state cookie, then bounce the
// browser to Google's consent screen.
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const cfg = googleConfig();
  if (!cfg) return redirect("/admin?error=google-not-configured");

  const state = newState();
  setOAuthState(cookies, state);
  return redirect(buildAuthUrl(cfg, request, state), 302);
};
