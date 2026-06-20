import type { APIRoute } from "astro";
import { getContent, saveContent, storeWritable } from "../../../lib/content";
import {
  SOCIAL_ICONS,
  type SiteContent,
  type SocialIconName,
} from "../../../data/defaults";

export const prerender = false;

const json = (data: unknown, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

// Return the current document so the admin can populate its forms.
export const GET: APIRoute = async () => {
  const content = await getContent();
  return json({ content, writable: storeWritable() }, 200);
};

// Persist a new document. The body is untrusted — coerce every field to the
// expected shape and drop anything unexpected before saving.
export const PUT: APIRoute = async ({ request }) => {
  if (!storeWritable()) {
    return json(
      {
        error:
          "No writable content store is configured. Add a KV store and set KV_REST_API_URL + KV_REST_API_TOKEN.",
      },
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  try {
    const clean = normalize(body);
    await saveContent(clean);
    return json({ ok: true, content: clean }, 200);
  } catch (err) {
    console.error("[admin] save failed:", err);
    return json({ error: "Could not save changes. Please try again." }, 500);
  }
};

// ---------- normalization (trust boundary) ----------
const str = (v: unknown, max = 5000): string =>
  typeof v === "string" ? v.slice(0, max) : "";

const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function normalize(input: unknown): SiteContent {
  const b = (input ?? {}) as Record<string, unknown>;
  const hero = (b.hero ?? {}) as Record<string, unknown>;
  const contact = (b.contact ?? {}) as Record<string, unknown>;

  return {
    hero: {
      bio: str(hero.bio),
      followLine: str(hero.followLine, 500),
    },
    socials: arr(b.socials).map((raw) => {
      const s = (raw ?? {}) as Record<string, unknown>;
      const icon = SOCIAL_ICONS.includes(s.icon as SocialIconName)
        ? (s.icon as SocialIconName)
        : "email";
      return {
        label: str(s.label, 60),
        href: str(s.href, 500),
        icon,
      };
    }),
    shows: arr(b.shows).map((raw) => {
      const s = (raw ?? {}) as Record<string, unknown>;
      return {
        date: str(s.date, 120),
        city: str(s.city, 120),
        venue: str(s.venue, 160),
        address: str(s.address, 200),
        tickets: str(s.tickets, 500),
      };
    }),
    appearances: arr(b.appearances).map((raw) => {
      const g = (raw ?? {}) as Record<string, unknown>;
      return {
        label: str(g.label, 120),
        items: arr(g.items)
          .map((it) => str(it, 200))
          .filter(Boolean),
      };
    }),
    videos: arr(b.videos).map((raw) => {
      const v = (raw ?? {}) as Record<string, unknown>;
      return { id: str(v.id, 40), title: str(v.title, 200) };
    }),
    pics: arr(b.pics).map((raw) => {
      const p = (raw ?? {}) as Record<string, unknown>;
      return { src: str(p.src, 500), alt: str(p.alt, 200) };
    }),
    contact: {
      heading: str(contact.heading, 120),
      lede: str(contact.lede, 500),
      email: str(contact.email, 200),
      formspreeId: str(contact.formspreeId, 80),
    },
  };
}
