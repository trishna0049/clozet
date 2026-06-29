import type { Brand, Print, PrintWithMeta, Product, Review } from "@/types/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

type PrintRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  drop_note: string | null;
  limited_left: number | null;
  bestseller: boolean | null;
  featured: boolean | null;
};

type ProductRow = {
  id: string;
  print_id: string;
  slug: string;
  silhouette: string;
  title: string;
  price: number;
  sizes: string[] | null;
  sleeves?: string[] | string | null;
  sleeve?: string[] | string | null;
  fabric: string | null;
  description: string | null;
  fit: string | null;
  details: string[] | null;
  inventory: number | null;
  badge: string | null;
  image?: string | null;
};

const normalizeSleeves = (value: ProductRow["sleeves"] | ProductRow["sleeve"]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const brand: Brand = {
  name: "Clozet",
  meaning: "Form or Shape",
  tagline: "Choose the Print. We Shape the Style.",
  description:
    "A print-first fashion label where every print becomes a mini wardrobe story."
};

export const reviews: Review[] = [
  {
    id: "rev-1",
    name: "Aashi",
    city: "Jaipur",
    rating: 5,
    quote: "I loved choosing the print first. It felt like building my own mini collection."
  },
  {
    id: "rev-2",
    name: "Manya",
    city: "Delhi",
    rating: 5,
    quote: "The same print across multiple silhouettes is the whole reason I bookmarked Clozet."
  },
  {
    id: "rev-3",
    name: "Prisha",
    city: "Mumbai",
    rating: 4,
    quote: "Even without final campaign images, the concept already feels premium and different."
  }
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function mapPrint(row: PrintRow): Print {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    dropNote: row.drop_note,
    limitedLeft: row.limited_left ?? 0,
    bestseller: row.bestseller ?? false,
    featured: row.featured ?? false,
    image: row.image
  };
}

function mapProduct(row: ProductRow): Product {
  const imageArray = row.image ? [row.image] : [];
  const normalizedSleeves = normalizeSleeves(row.sleeves ?? row.sleeve ?? null);

  return {
    id: row.id,
    printId: row.print_id,
    slug: row.slug,
    silhouette: row.silhouette,
    title: row.title,
    price: Number(row.price),
    sizes: row.sizes ?? [],
    sleeves: normalizedSleeves,
    images: imageArray,
    fabric: row.fabric,
    description: row.description,
    fit: row.fit,
    details: row.details ?? [],
    inventory: row.inventory ?? 0,
    badge: row.badge
  };
}

async function fetchPrintRows(category?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("prints")
    .select("id, slug, name, category, description, image, drop_note, limited_left, bestseller, featured")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PrintRow[];
}

async function fetchProductRows(filters?: { printId?: string; slug?: string }) {
  const supabase = createAdminClient();
  const baseSelect = "id, print_id, slug, silhouette, title, price, sizes, fabric, description, fit, details, inventory, badge, image";
  const selectWithSleeves = `${baseSelect}, sleeves`;
  const selectWithSleeve = `${baseSelect}, sleeve`;

  const runQuery = async (selectClause: string) => {
    let query = supabase
      .from("products")
      .select(selectClause)
      .order("created_at", { ascending: false });

    if (filters?.printId) {
      query = query.eq("print_id", filters.printId);
    }

    if (filters?.slug) {
      query = query.eq("slug", filters.slug);
    }

    return query;
  };

  const { data, error } = await runQuery(selectWithSleeves);
  if (!error) {
    return (data ?? []) as ProductRow[];
  }

  if (error.message.includes("products.sleeves") || error.message.includes("column sleeves")) {
    const { data: sleeveData, error: sleeveError } = await runQuery(selectWithSleeve);
    if (!sleeveError) {
      return (sleeveData ?? []) as ProductRow[];
    }

    if (sleeveError.message.includes("products.sleeve") || sleeveError.message.includes("column sleeve")) {
      const { data: fallbackData, error: fallbackError } = await runQuery(baseSelect);
      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
      return (fallbackData ?? []) as ProductRow[];
    }

    throw new Error(sleeveError.message);
  }

  throw new Error(error.message);
}

export async function getCategoryOptions() {
  const prints = await fetchPrintRows();
  return ["All", ...new Set(prints.map((item) => item.category))];
}

export async function getPrints(category?: string): Promise<PrintWithMeta[]> {
  const [printRows, productRows] = await Promise.all([fetchPrintRows(category), fetchProductRows()]);

  return printRows.map((row) => {
    const relatedProducts = productRows.filter((product) => product.print_id === row.id);
    const startingPrice = relatedProducts.length
      ? Math.min(...relatedProducts.map((product) => Number(product.price)))
      : 0;

    return {
      ...mapPrint(row),
      silhouettesCount: relatedProducts.length,
      startingPrice
    };
  });
}

export async function getFeaturedPrints() {
  const prints = await getPrints();
  return prints.filter((print) => print.featured).slice(0, 4);
}

export async function getPrintBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("prints")
    .select("id, slug, name, category, description, drop_note, limited_left, bestseller, featured")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return mapPrint(data as PrintRow);
}

export async function getProductsByPrintId(printId: string) {
  const rows = await fetchProductRows({ printId });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string) {
  const rows = await fetchProductRows({ slug });
  return rows.length ? mapProduct(rows[0]) : null;
}

export async function getPrintForProduct(product: Product) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("prints")
    .select("id, slug, name, category, description, drop_note, limited_left, bestseller, featured")
    .eq("id", product.printId)
    .single();

  if (error) {
    return null;
  }

  return mapPrint(data as PrintRow);
}

export async function getTrendingProducts() {
  const rows = await fetchProductRows();
  return rows
    .filter((product) =>
      ["Bestseller", "Trending", "Co-ord Hero", "Modern Muse", "Editor Pick"].includes(
        product.badge ?? ""
      )
    )
    .map(mapProduct);
}

export async function getNewArrivals() {
  const rows = await fetchProductRows();
  return rows
    .filter((product) =>
      ["New Drop", "Modern Muse", "Occasion Pick", "Night Out"].includes(product.badge ?? "")
    )
    .map(mapProduct);
}

export async function getRecommendedProducts(product: Product) {
  const [parentPrint, samePrintProducts, allProducts, allPrints] = await Promise.all([
    getPrintForProduct(product),
    getProductsByPrintId(product.printId),
    getAllProducts(),
    getPrints()
  ]);

  if (!parentPrint) {
    return [];
  }

  const categoryPrintIds = new Set(
    allPrints.filter((item) => item.category === parentPrint.category).map((item) => item.id)
  );

  const siblingStyles = samePrintProducts.filter((item) => item.slug !== product.slug);
  const categoryMatches = allProducts.filter(
    (item) =>
      item.slug !== product.slug &&
      item.printId !== product.printId &&
      categoryPrintIds.has(item.printId)
  );

  return [...siblingStyles, ...categoryMatches].slice(0, 6);
}

export async function getHomepageSnapshot() {
  const [featuredPrints, trendingProducts, newArrivals] = await Promise.all([
    getFeaturedPrints(),
    getTrendingProducts(),
    getNewArrivals()
  ]);

  return {
    brand,
    featuredPrints,
    trendingProducts: trendingProducts.slice(0, 6),
    newArrivals: newArrivals.slice(0, 4),
    reviews
  };
}

export async function getAllProducts() {
  const rows = await fetchProductRows();
  return rows.map(mapProduct);
}
