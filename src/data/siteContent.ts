export type ShowDate = {
  date: string;
  city: string;
  venue: string;
  address: string;
  tickets: string;
};

export type Product = {
  id: string;
  src: string;
  name: string;
  description: string;
  price: number;
};

export type AppearanceGroup = {
  label: string;
  items: string[];
};

export type Video = {
  id: string;
  title?: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: "youtube" | "instagram" | "tiktok" | "facebook" | "threads" | "email";
};

export type ShopPolicy = {
  title: string;
  body: string;
};

export type SiteContent = {
  hero: {
    name: string;
    tagline: string;
    bookLabel: string;
    bio: string;
  };
  contact: {
    heading: string;
    lede: string;
    email: string;
    formspreeId: string;
  };
  shows: ShowDate[];
  appearances: AppearanceGroup[];
  videos: Video[];
  pics: string[];
  products: Product[];
  policies: ShopPolicy[];
  socials: SocialLink[];
};

const siteContent: SiteContent = {
  hero: {
    name: "Josef Anolin",
    tagline: "Stand-Up Comedian",
    bookLabel: "BOOK ME!",
    bio: "From Oakland, California currently living in Los Angeles, Josef has opened for the likes of Tom Segura, Whitney Cummings, and Michael Che. He likes telling irreverent stories based on his life and observations. He has an Android phone because he likes pissing you off with his green text bubbles.",
  },
  contact: {
    heading: "HIT ME UP",
    lede: "Bookings, press, and general hellos. I read everything.",
    email: "josefanolin@gmail.com",
    formspreeId: "",
  },
  shows: [
    {
      date: "08/28/25",
      city: "Oakland, CA",
      venue: "Luka's Lounge",
      address: "1984 Somewhere Ave.",
      tickets: "https://www.ticketmaster.com",
    },
    {
      date: "08/28/25",
      city: "Oakland, CA",
      venue: "Luka's Lounge",
      address: "1984 Somewhere Ave.",
      tickets: "https://www.ticketmaster.com",
    },
    {
      date: "08/28/25",
      city: "Oakland, CA",
      venue: "Luka's Lounge",
      address: "1984 Somewhere Ave.",
      tickets: "https://www.ticketmaster.com",
    },
    {
      date: "08/28/25",
      city: "Oakland, CA",
      venue: "Luka's Lounge",
      address: "1984 Somewhere Ave.",
      tickets: "https://www.ticketmaster.com",
    },
  ],
  appearances: [
    {
      label: "Headlining",
      items: ["Laughs Unlimited (Sacramento, CA)"],
    },
    {
      label: "Featured",
      items: [
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
        "Clusterfest Bay Area Showcase 2018",
        "Sketchfest (2015, 2017, 2018, 2023)",
        "Outside Lands 2016",
        "North Carolina Comedy Festival 2018",
      ],
    },
  ],
  videos: [
    { id: "Is2_LT5YVww" },
    { id: "1shEtqNu1Ms", title: "Counting Farsees with Josef Anolin" },
    { id: "_PWBWs5rL94" },
    { id: "PfS_FJM735U" },
    { id: "W4qgq3mXbgI" },
    { id: "q1iKMftySOA" },
  ],
  pics: Array.from(
    { length: 20 },
    (_, i) => `/pics/joe-${String(i + 1).padStart(2, "0")}.webp`,
  ),
  products: [
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
  ],
  policies: [
    {
      title: "Privacy Policy",
      body: "We collect the information needed to process orders, respond to customer messages, and improve the store experience. Customer data is used only for order fulfillment, payment processing, fraud prevention, and required business records. We do not sell personal information.",
    },
    {
      title: "Shipping Policy",
      body: "Orders are packed after payment confirmation and ship to the address provided at checkout. Shipping rates and estimated delivery windows are shown before purchase. Delivery timing may vary by carrier, destination, weather, and holiday volume.",
    },
    {
      title: "Terms of Service",
      body: "By placing an order, you agree to provide accurate contact, billing, and shipping details. Product availability, pricing, and descriptions may change without notice. We may refuse or cancel orders that appear fraudulent, abusive, or incorrectly priced.",
    },
    {
      title: "Refund Policy",
      body: "Unworn and unused items may be eligible for return or exchange within 30 days of delivery. Items must be returned in their original condition. Final sale items, damaged-by-use items, and customized products are not eligible for refund.",
    },
    {
      title: "Cookies Policy",
      body: "This site may use cookies and similar technologies to remember cart activity, measure site performance, support secure checkout, and understand store traffic. You can manage cookie preferences through your browser settings.",
    },
  ],
  socials: [
    {
      label: "YouTube",
      href: "https://www.youtube.com/@comedianjoe510",
      icon: "youtube",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/comedianjoe510/",
      icon: "instagram",
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@comedianjoe510?is_from_webapp=1&sender_device=pc",
      icon: "tiktok",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/JosefAnolinComedian",
      icon: "facebook",
    },
    {
      label: "Threads",
      href: "https://www.threads.com/@comedianjoe510",
      icon: "threads",
    },
    {
      label: "Email",
      href: "mailto:josefanolin@gmail.com",
      icon: "email",
    },
  ],
};

export default siteContent;
