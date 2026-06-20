// Google OAuth (OpenID Connect) — "Sign in with Google" for the admin.
//
// Hand-rolled against Google's endpoints (no auth SDK), matching the rest of
// the app's fetch-based style. The flow:
//   1. /api/admin/auth/google  → redirect to Google's consent screen.
//   2. Google redirects back to /api/admin/auth/callback with a code.
//   3. We exchange the code for an id_token, read the verified email, and
//      check it against ADMIN_ALLOWED_EMAILS. If allowed, we start the normal
//      signed-cookie session (see lib/auth.ts) — everything downstream is the
//      same as password login.
//
// Env vars (set in Vercel):
//   GOOGLE_CLIENT_ID       OAuth 2.0 Web client id
//   GOOGLE_CLIENT_SECRET   OAuth 2.0 Web client secret
//   ADMIN_ALLOWED_EMAILS   comma-separated allowlist, e.g. "josefanolin@gmail.com"

const env = (name: string): string | undefined =>
  process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

export type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  allowed: string[];
};

export function googleConfig(): GoogleConfig | null {
  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  const allowed = (env("ADMIN_ALLOWED_EMAILS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (clientId && clientSecret && allowed.length) {
    return { clientId, clientSecret, allowed };
  }
  return null;
}

export function googleLoginEnabled(): boolean {
  return googleConfig() !== null;
}

// Resolve the public origin even behind Vercel's proxy, so the redirect_uri we
// send to Google matches the one we registered (and the one used at exchange).
export function getOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export function redirectUri(request: Request): string {
  return `${getOrigin(request)}/api/admin/auth/callback`;
}

export function buildAuthUrl(cfg: GoogleConfig, request: Request, state: string): string {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export type GoogleIdentity = { email: string; verified: boolean };

export async function exchangeCodeForIdentity(
  cfg: GoogleConfig,
  request: Request,
  code: string,
): Promise<GoogleIdentity | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) return null;

  // The id_token comes straight from Google's token endpoint over TLS (a
  // server-to-server call), so its payload is trustworthy without re-verifying
  // the signature here.
  const payload = decodeJwtPayload(data.id_token);
  if (!payload || typeof payload.email !== "string") return null;
  return { email: payload.email.toLowerCase(), verified: payload.email_verified === true };
}

export function emailAllowed(email: string, cfg: GoogleConfig): boolean {
  return cfg.allowed.includes(email.toLowerCase());
}

function decodeJwtPayload(jwt: string): { email?: string; email_verified?: boolean } | null {
  const part = jwt.split(".")[1];
  if (!part) return null;
  let b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  b64 += "=".repeat((4 - (b64.length % 4)) % 4);
  try {
    const json =
      typeof atob === "function"
        ? atob(b64)
        : Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
