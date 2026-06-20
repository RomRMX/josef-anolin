// Admin auth — a single shared password plus a signed, httpOnly session cookie.
//
// Env vars (set in Vercel → Project → Settings → Environment Variables):
//   ADMIN_PASSWORD  (required)  the password the owner types to log in.
//   ADMIN_SECRET    (optional)  HMAC signing key for the session cookie.
//                               Falls back to ADMIN_PASSWORD if unset, but set
//                               a long random value in production.
//
// The cookie is "<expiry>.<hmac>", verified server-side on every protected
// request. No password is ever stored in the cookie.

import type { AstroCookies } from "astro";

export const SESSION_COOKIE = "joe_admin";
export const OAUTH_STATE_COOKIE = "joe_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const OAUTH_STATE_TTL_SECONDS = 60 * 10; // 10 minutes

const env = (name: string): string | undefined =>
  process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

/** The configured admin password, or a dev-only default with a warning. */
function adminPassword(): string | null {
  const pw = env("ADMIN_PASSWORD");
  if (pw) return pw;
  if (import.meta.env.DEV) {
    console.warn(
      "[auth] ADMIN_PASSWORD not set — using dev password 'admin'. Set ADMIN_PASSWORD before deploying.",
    );
    return "admin";
  }
  return null; // production with no password configured → login disabled (fail closed)
}

function signingKey(): string {
  return env("ADMIN_SECRET") ?? adminPassword() ?? "insecure-dev-secret";
}

/** Whether password login is available (a password is configured). */
export function passwordLoginEnabled(): boolean {
  return adminPassword() !== null;
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: unknown): boolean {
  const expected = adminPassword();
  if (!expected || typeof input !== "string") return false;
  return safeEqual(input, expected);
}

// ---------- HMAC (Web Crypto) ----------
async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function makeToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sig = await hmac(String(exp));
  return `${exp}.${sig}`;
}

async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmac(exp);
  return safeEqual(sig, expected);
}

// ---------- cookie helpers ----------
export async function startSession(cookies: AstroCookies): Promise<void> {
  cookies.set(SESSION_COOKIE, await makeToken(), {
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function endSession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

export async function isAuthed(cookies: AstroCookies): Promise<boolean> {
  return verifyToken(cookies.get(SESSION_COOKIE)?.value);
}

// ---------- OAuth CSRF state (short-lived, httpOnly) ----------
export function newState(): string {
  return crypto.randomUUID();
}

export function setOAuthState(cookies: AstroCookies, state: string): void {
  cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
}

export function readOAuthState(cookies: AstroCookies): string | undefined {
  return cookies.get(OAUTH_STATE_COOKIE)?.value;
}

export function clearOAuthState(cookies: AstroCookies): void {
  cookies.delete(OAUTH_STATE_COOKIE, { path: "/" });
}
