// Single source of truth for the shop catalog.
// Prices live here (server-side) so the Stripe checkout endpoint never trusts
// a price sent from the browser. Shop.astro renders from this list too.

export type Product = {
  id: string;
  src: string;
  name: string;
  description: string;
  price: number; // in cents (USD)
};

export const products: Product[] = [
  {
    id: "joe-tee-classic",
    src: "/shop/tee-black-front.png",
    name: "Joe Dobo Classic Tee",
    description:
      "Soft cotton, blast yellow logo on jet black. Roomy fit so your beer doesn't have to compete for space.",
    price: 3000,
  },
  {
    id: "joe-tee-stand-up",
    src: "/shop/tee-black-front-2.png",
    name: "Stand Up Comedian Tee",
    description:
      "Anton block letters across the chest. The shirt that says you're funnier than the venue paid for.",
    price: 3000,
  },
  {
    id: "joe-hoodie",
    src: "/shop/hoodie-black.png",
    name: "Joe Dobo Hoodie",
    description:
      "Heavyweight fleece, oversized fit. The unofficial uniform of every greenroom from Oakland to LA.",
    price: 6500,
  },
];

export const sizes = ["Medium", "Large", "XL", "XXL"] as const;

export const productById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);
