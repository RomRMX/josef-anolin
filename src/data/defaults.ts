// Single source of truth for all OWNER-EDITABLE site content.
//
// The admin (/admin) edits a `SiteContent` document that is persisted to the
// content store (src/lib/content.ts). Every value below is the seed/default —
// what the live site shows before the owner has saved anything. Keep these in
// sync with the real launch copy so a fresh deploy (or a missing store) still
// renders a complete, correct page.

export type SocialIconName =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "threads"
  | "email";

export type Social = { label: string; href: string; icon: SocialIconName };
export type Show = {
  date: string;
  city: string;
  venue: string;
  address?: string;
  tickets?: string;
};
export type AppearanceGroup = { label: string; items: string[] };
export type Video = { id: string; title?: string };
export type Pic = { src: string; alt?: string };
export type Product = {
  id: string;
  src: string;
  name: string;
  description: string;
  price: number; // in cents (USD) — the SERVER price authority used by checkout
};
export type ShopStatus = "open" | "coming-soon";

// Apparel sizes offered in the shop. Structural, not owner-editable.
export const SHOP_SIZES = ["Medium", "Large", "XL", "XXL"] as const;

export type SiteContent = {
  hero: {
    bio: string;
    followLine: string;
  };
  socials: Social[];
  shows: Show[];
  appearances: AppearanceGroup[];
  videos: Video[];
  pics: Pic[];
  shopStatus: ShopStatus;
  products: Product[];
  contact: {
    heading: string;
    lede: string;
    email: string;
    formspreeId: string;
  };
};

export const defaultContent: SiteContent = {
  hero: {
    bio: "Josef Anolin is an Oakland-bred, LA-based stand-up comedian and actor whose mischievous, anecdotal humor has made him a standout on the Southern California circuit. He's been featured at Punch Line SF, Cobb's Comedy Club, and Netflix Is A Joke Fest 2026, and performs regularly at the Hollywood Improv Lab. Off stage, he's on his Android, mostly to annoy you with green text bubbles.",
    followLine: "Follow him at @comedianjoe510.",
  },

  socials: [
    { label: "YouTube", href: "https://www.youtube.com/@comedianjoe510", icon: "youtube" },
    { label: "Instagram", href: "https://www.instagram.com/comedianjoe510/", icon: "instagram" },
    { label: "TikTok", href: "https://www.tiktok.com/@comedianjoe510?is_from_webapp=1&sender_device=pc", icon: "tiktok" },
    { label: "Facebook", href: "https://www.facebook.com/JosefAnolinComedian", icon: "facebook" },
    { label: "Threads", href: "https://www.threads.com/@comedianjoe510", icon: "threads" },
    { label: "Email", href: "mailto:josefanolin@gmail.com", icon: "email" },
  ],

  // No live dates yet — the owner adds them in /admin. An empty list renders
  // the "Updates Coming Soon!" placeholder.
  shows: [],

  appearances: [
    {
      label: "Appears regularly at...",
      items: [
        "Hollywood Improv",
        "Laughs Unlimited (Sacramento, CA)",
        "Punch Line (San Francisco)",
        "Punch Line (Sacramento)",
        "Cobb's Comedy Club (San Francisco)",
        "The San Jose Improv",
        "Rooster T. Feathers",
      ],
    },
    {
      label: "Festivals",
      items: [
        "Netflix is a Joke Fest 2026",
        "Clusterfest Bay Area Showcase 2018",
        "Sketchfest (2015, 2017, 2018, 2023)",
        "Outside Lands 2016",
        "North Carolina Comedy Festival 2018",
      ],
    },
  ],

  videos: [
    { id: "1shEtqNu1Ms", title: "Counting Farsees with Josef Anolin" },
    { id: "PfS_FJM735U" },
    { id: "W4qgq3mXbgI" },
    { id: "q1iKMftySOA" },
  ],

  pics: Array.from({ length: 20 }, (_, i) => ({
    src: `/pics/joe-${String(i + 1).padStart(2, "0")}.webp`,
    alt: `Josef Anolin photo ${i + 1}`,
  })),

  // Shop is "opening soon" until the owner flips shopStatus to "open" in /admin.
  shopStatus: "coming-soon",
  products: [
    {
      id: "alcoholics-adjacent-tee",
      src: "/shop/tee-black-front.png",
      name: "Alcoholics Adjacent — Tee",
      description:
        "For the friend who's never the problem, just always standing next to it. Soft ringspun cotton, jet black, relaxed fit.",
      price: 3000,
    },
    {
      id: "alcoholics-adjacent-hoodie",
      src: "/shop/hoodie-black-front.png",
      name: "Alcoholics Adjacent — Hoodie",
      description:
        "The official uniform of the designated 'I'll just have one.' Heavyweight fleece, oversized, jet black.",
      price: 5000,
    },
    {
      id: "pting-tee",
      src: "/shop/tee-black-front.png",
      name: "PTing! — Tee",
      description:
        "That's the sound of a green bubble landing in the group chat. Now you can annoy people in person too. Soft ringspun cotton, relaxed fit.",
      price: 3000,
    },
    {
      id: "pting-hoodie",
      src: "/shop/hoodie-black-front.png",
      name: "PTing! — Hoodie",
      description:
        "Sent from his Android, worn on your back. Cozy heavyweight fleece, oversized fit.",
      price: 5000,
    },
    {
      id: "why-cant-these-hoes-tee",
      src: "/shop/tee-black-front.png",
      name: "Why Can't These Hoes? — Tee",
      description:
        "The eternal question, right across your chest. Soft ringspun cotton, jet black, relaxed fit.",
      price: 3000,
    },
    {
      id: "why-cant-these-hoes-hoodie",
      src: "/shop/hoodie-black-front.png",
      name: "Why Can't These Hoes? — Hoodie",
      description:
        "Ask the big questions in maximum comfort. Heavyweight fleece, oversized, greenroom-approved.",
      price: 5000,
    },
  ],

  contact: {
    heading: "HIT ME UP",
    lede: "Bookings, press, and general hellos. I read everything.",
    email: "josefanolin@gmail.com",
    formspreeId: "",
  },
};

// Order matters for the icon <select> in the admin.
export const SOCIAL_ICONS: SocialIconName[] = [
  "youtube",
  "instagram",
  "tiktok",
  "facebook",
  "threads",
  "email",
];
