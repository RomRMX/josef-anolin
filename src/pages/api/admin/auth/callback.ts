import type { APIRoute } from "astro";
import {
  startSession,
  readOAuthState,
  clearOAuthState,
} from "../../../../lib/auth";
import {
  googleConfig,
  exchangeCodeForIdentity,
  emailAllowed,
} from "../../../../lib/google";

export const prerender = false;

// Google redirects here after the user consents. Verify state (CSRF), exchange
// the code for the user's verified email, check the allowlist, and — only then
// — start the admin session.
export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const cfg = googleConfig();
  if (!cfg) return redirect("/admin?error=google-not-configured");

  // User cancelled or Google returned an error.
  if (url.searchParams.get("error")) return redirect("/admin?error=google-denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = readOAuthState(cookies);
  clearOAuthState(cookies);

  if (!code || !state || !savedState || state !== savedState) {
    return redirect("/admin?error=bad-state");
  }

  const identity = await exchangeCodeForIdentity(cfg, request, code);
  if (!identity || !identity.verified) return redirect("/admin?error=google-failed");

  if (!emailAllowed(identity.email, cfg)) return redirect("/admin?error=not-allowed");

  await startSession(cookies);
  return redirect("/admin");
};
