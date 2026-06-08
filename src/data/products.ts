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
const HOODIE = 6500; // $65

export const products: Product[] = [
  // ── Alcoholics Adjacent ──────────────────────────────────────────────
  {
    id: "alcoholics-adjacent-tee",
    src: "/shop/tee-black-front.png",
    name: "Alcoholics Adjacent — Tee",
    description:
      "You're not the problem — you're just always standing next to it. Soft cotton, jet black.",
    price: TEE,
  },
  {
    id: "alcoholics-adjacent-hoodie",
    src: "/shop/hoodie-black.png",
    name: "Alcoholics Adjacent — Hoodie",
    description:
      "Heavyweight fleece for the designated 'I'll just have one' friend. Oversized fit.",
    price: HOODIE,
  },
  // ── PTing! ───────────────────────────────────────────────────────────
  {
    id: "pting-tee",
    src: "/shop/tee-black-front-2.png",
    name: "PTing! — Tee",
    description:
      "The sound of a green bubble landing in the group chat. Wear it and annoy people in person too.",
    price: TEE,
  },
  {
    id: "pting-hoodie",
    src: "/shop/hoodie-black.png",
    name: "PTing! — Hoodie",
    description:
      "Cozy fleece that says 'sent from my Android.' Heavyweight, oversized fit.",
    price: HOODIE,
  },
  // ── Why can't these hoes? ────────────────────────────────────────────
  {
    id: "why-cant-these-hoes-tee",
    src: "/shop/tee-black-front.png",
    name: "Why Can't These Hoes? — Tee",
    description:
      "A question for the ages, across your chest in Anton block letters. Black cotton.",
    price: TEE,
  },
  {
    id: "why-cant-these-hoes-hoodie",
    src: "/shop/hoodie-black.png",
    name: "Why Can't These Hoes? — Hoodie",
    description:
      "Pose the eternal question in heavyweight fleece. Oversized, greenroom-approved.",
    price: HOODIE,
  },
];

export const sizes = ["Medium", "Large", "XL", "XXL"] as const;

export const productById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);
