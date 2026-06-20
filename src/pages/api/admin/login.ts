import type { APIRoute } from "astro";
import { passwordLoginEnabled, checkPassword, startSession } from "../../../lib/auth";

export const prerender = false;

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!passwordLoginEnabled()) {
    return json(
      { error: "Admin login isn't configured yet (missing ADMIN_PASSWORD)." },
      503,
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (!checkPassword(body.password)) {
    return json({ error: "Wrong password." }, 401);
  }

  await startSession(cookies);
  return json({ ok: true }, 200);
};
