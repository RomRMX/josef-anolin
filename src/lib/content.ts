// Content store — reads/writes the owner-editable SiteContent document.
//
// Storage backends, chosen automatically:
//   • Production: a KV/Redis REST store (Vercel KV or Upstash Redis). Detected
//     via KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN).
//   • Local dev:  a JSON file at .data/content.json (gitignored), so editing
//     works end-to-end with `npm run dev` and no external services.
//
// Reads always merge the stored document over defaultContent, so a missing
// store, a partial document, or a newly-added field never breaks the page.

import { defaultContent, type SiteContent } from "../data/defaults";
import { promises as fs } from "node:fs";
import { join } from "node:path";

const KEY = "site:content";

const env = (name: string): string | undefined =>
  process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

function kvConfig(): { url: string; token: string } | null {
  const url = env("KV_REST_API_URL") ?? env("UPSTASH_REDIS_REST_URL");
  const token = env("KV_REST_API_TOKEN") ?? env("UPSTASH_REDIS_REST_TOKEN");
  if (url && token) return { url: url.replace(/\/$/, ""), token };
  return null;
}

const LOCAL_FILE = join(process.cwd(), ".data", "content.json");

// ---------- KV (Upstash/Vercel REST) ----------
async function kvGet(cfg: { url: string; token: string }): Promise<string | null> {
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(["GET", KEY]),
  });
  if (!res.ok) throw new Error(`KV GET failed: ${res.status}`);
  const data = (await res.json()) as { result: string | null };
  return data.result ?? null;
}

async function kvSet(cfg: { url: string; token: string }, value: string): Promise<void> {
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(["SET", KEY, value]),
  });
  if (!res.ok) throw new Error(`KV SET failed: ${res.status}`);
}

// ---------- local file (dev) ----------
async function fileGet(): Promise<string | null> {
  try {
    return await fs.readFile(LOCAL_FILE, "utf8");
  } catch {
    return null;
  }
}

async function fileSet(value: string): Promise<void> {
  await fs.mkdir(join(process.cwd(), ".data"), { recursive: true });
  await fs.writeFile(LOCAL_FILE, value, "utf8");
}

// ---------- public API ----------

/** Whether a writable store is available in this environment. */
export function storeWritable(): boolean {
  return kvConfig() !== null || import.meta.env.DEV;
}

/** Human-readable name of the active store, for the admin status line. */
export function storeBackend(): "kv" | "local-file" | "none" {
  if (kvConfig()) return "kv";
  if (import.meta.env.DEV) return "local-file";
  return "none";
}

export async function getContent(): Promise<SiteContent> {
  let raw: string | null = null;
  try {
    const cfg = kvConfig();
    raw = cfg ? await kvGet(cfg) : await fileGet();
  } catch (err) {
    console.error("[content] read failed, falling back to defaults:", err);
    raw = null;
  }
  if (!raw) return structuredClone(defaultContent);
  try {
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return structuredClone(defaultContent);
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  const value = JSON.stringify(content);
  const cfg = kvConfig();
  if (cfg) {
    await kvSet(cfg, value);
    return;
  }
  if (import.meta.env.DEV) {
    await fileSet(value);
    return;
  }
  throw new Error(
    "No writable content store configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.",
  );
}

/**
 * Shallow-merge a (possibly partial / untrusted) stored document over the
 * defaults so every top-level section is always present and well-typed.
 */
function mergeWithDefaults(stored: unknown): SiteContent {
  const s = (stored ?? {}) as Partial<SiteContent>;
  const d = defaultContent;
  return {
    hero: { ...d.hero, ...(s.hero ?? {}) },
    socials: Array.isArray(s.socials) ? s.socials : d.socials,
    shows: Array.isArray(s.shows) ? s.shows : d.shows,
    appearances: Array.isArray(s.appearances) ? s.appearances : d.appearances,
    videos: Array.isArray(s.videos) ? s.videos : d.videos,
    pics: Array.isArray(s.pics) ? s.pics : d.pics,
    shopStatus: s.shopStatus === "open" ? "open" : d.shopStatus,
    products: Array.isArray(s.products) ? s.products : d.products,
    contact: { ...d.contact, ...(s.contact ?? {}) },
  };
}
