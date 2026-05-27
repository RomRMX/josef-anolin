import rawSiteContent from "./siteContent.json";

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

const siteContent = rawSiteContent as SiteContent;

export default siteContent;
