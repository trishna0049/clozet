export type Brand = {
  name: string;
  meaning: string;
  tagline: string;
  description: string;
};

export type Print = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  dropNote: string | null;
  limitedLeft: number;
  bestseller: boolean;
  featured: boolean;
  image?: string | null;
  bannerImage?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  printId: string;
  silhouette: string;
  title: string;
  price: number;
  sizes: string[];
  sleeves?: string[];
  images: string[];
  fabric: string | null;
  description: string | null;
  fit: string | null;
  details: string[];
  inventory: number;
  badge: string | null;
};

export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number;
  quote: string;
};

export type PrintWithMeta = Print & {
  silhouettesCount: number;
  startingPrice: number;
};

export type CartItem = {
  slug: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  silhouette: string;
  printId: string;
  printName: string;
};
