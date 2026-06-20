import type { APIRoute } from "astro";
import { promises as fs } from "node:fs";
import { join } from "node:path";

export const prerender = false;

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

const env = (name: string): string | undefined =>
  process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

function safeName(original: string, ext: string): string {
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "image";
  const stamp = Date.now().toString(36);
  return `${base}-${stamp}.${ext}`;
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected a file upload." }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return json({ error: "No file received." }, 400);
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return json({ error: "Unsupported image type. Use JPG, PNG, WebP, GIF, or AVIF." }, 415);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "Image is too large (max 8 MB)." }, 413);
  }

  const filename = safeName(file.name, ext);
  const bytes = new Uint8Array(await file.arrayBuffer());

  // Production: Vercel Blob. Detected by its token; persistent & CDN-served.
  if (env("BLOB_READ_WRITE_TOKEN")) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${filename}`, bytes, {
        access: "public",
        contentType: file.type,
        token: env("BLOB_READ_WRITE_TOKEN"),
      });
      return json({ url: blob.url }, 200);
    } catch (err) {
      console.error("[upload] blob failed:", err);
      return json({ error: "Upload failed. Please try again." }, 502);
    }
  }

  // Local dev: write into public/uploads so it serves at /uploads/<name>.
  if (import.meta.env.DEV) {
    try {
      const dir = join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(join(dir, filename), bytes);
      return json({ url: `/uploads/${filename}` }, 200);
    } catch (err) {
      console.error("[upload] local write failed:", err);
      return json({ error: "Upload failed." }, 500);
    }
  }

  return json(
    {
      error:
        "Image uploads aren't configured. Add Vercel Blob and set BLOB_READ_WRITE_TOKEN, or paste an image URL instead.",
    },
    503,
  );
};
