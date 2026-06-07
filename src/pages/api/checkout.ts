import type { APIRoute } from "astro";
import Stripe from "stripe";
import { productById } from "../../data/products";

// On-demand (serverless) — must not be prerendered.
export const prerender = false;

type CartLine = { productId?: string; size?: string; qty?: number };

const SHIPPING_CENTS = 500;

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const key =
    import.meta.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return json(
      { error: "Checkout isn't configured yet (missing STRIPE_SECRET_KEY)." },
      500,
    );
  }

  let body: { items?: CartLine[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) return json({ error: "Your cart is empty." }, 400);

  const origin = new URL(request.url).origin;

  // Build line items from the SERVER catalog — never trust client prices.
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const it of items) {
    const product = it.productId ? productById(it.productId) : undefined;
    if (!product) continue; // ignore unknown / tampered ids
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    const sizeLabel =
      typeof it.size === "string" && it.size ? ` — ${it.size}` : "";
    line_items.push({
      quantity: qty,
      price_data: {
        currency: "usd",
        unit_amount: product.price,
        product_data: {
          name: `${product.name}${sizeLabel}`,
          images: [`${origin}${product.src}`],
        },
      },
    });
  }

  if (line_items.length === 0) {
    return json({ error: "No valid items in cart." }, 400);
  }

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel#shop`,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: "Flat rate shipping",
            fixed_amount: { amount: SHIPPING_CENTS, currency: "usd" },
          },
        },
      ],
    });
    return json({ url: session.url }, 200);
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return json({ error: "Could not start checkout. Please try again." }, 502);
  }
};
