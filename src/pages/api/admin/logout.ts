import type { APIRoute } from "astro";
import { endSession } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  endSession(cookies);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
