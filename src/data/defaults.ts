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
