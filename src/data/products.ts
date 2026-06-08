// Single source of truth for the shop catalog.
// Prices live here (server-side) so the Stripe checkout endpoint never trusts
// a price sent from the browser. Shop.astro renders from this list too.
//
// TODO(artwork): the `src` images are PLACEHOLDERS reusing the generic tee /
// hoodie mockups. Replace each with the real design mockup once available
// (drop the files in /public/shop/ and point `src` at them).

export type Product = {
  id: string;
  src: string;
  name: string;
  description: string;
  price: number; // in cents (USD)
};

const TEE = 3000; // $30
const HOODIE = 5000; // $50

export const products: Product[] = [
  // ── Alcoholics Adjacent ──────────────────────────────────────────────
  {
    id: "alcoholics-adjacent-tee",
    src: "/shop/tee-black-front.png",
    name: "Alcoholics Adjacent — Tee",
    description:
      "For the friend who's never the problem, just always standing next to it. Soft ringspun cotton, jet black, relaxed fit.",
    price: TEE,
  },
  {
    id: "alcoholics-adjacent-hoodie",
    src: "/shop/hoodie-black-front.png",
    name: "Alcoholics Adjacent — Hoodie",
    description:
      "The official uniform of the designated 'I'll just have one.' Heavyweight fleece, oversized, jet black.",
    price: HOODIE,
  },
  // ── PTing! ───────────────────────────────────────────────────────────
  {
    id: "pting-tee",
    src: "/shop/tee-black-front.png",
    name: "PTing! — Tee",
    description:
      "That's the sound of a green bubble landing in the group chat. Now you can annoy people in person too. Soft ringspun cotton, relaxed fit.",
    price: TEE,
  },
  {
    id: "pting-hoodie",
    src: "/shop/hoodie-black-front.png",
    name: "PTing! — Hoodie",
    description:
      "Sent from his Android, worn on your back. Cozy heavyweight fleece, oversized fit.",
    price: HOODIE,
  },
  // ── Why can't these hoes? ────────────────────────────────────────────
  {
    id: "why-cant-these-hoes-tee",
    src: "/shop/tee-black-front.png",
    name: "Why Can't These Hoes? — Tee",
    description:
      "The eternal question, right across your chest. Soft ringspun cotton, jet black, relaxed fit.",
    price: TEE,
  },
  {
    id: "why-cant-these-hoes-hoodie",
    src: "/shop/hoodie-black-front.png",
    name: "Why Can't These Hoes? — Hoodie",
    description:
      "Ask the big questions in maximum comfort. Heavyweight fleece, oversized, greenroom-approved.",
    price: HOODIE,
  },
];

export const sizes = ["Medium", "Large", "XL", "XXL"] as const;

export const productById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);
