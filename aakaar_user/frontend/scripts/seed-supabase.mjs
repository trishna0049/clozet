import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });

const catalogPath = path.resolve(__dirname, "../../shared/catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


async function seed() {
  console.log("Seeding prints...");

  const printRows = catalog.prints.map((print) => ({
    slug: print.slug,
    name: print.name,
    category: print.category,
    description: print.description,
    mood: print.mood ?? null,

    drop_note: print.dropNote ?? null,
    limited_left: print.limitedLeft ?? 0,
    bestseller: print.bestseller ?? false,
    featured: print.featured ?? false
  }));

  const { error: printError } = await supabase
    .from("prints")
    .upsert(printRows, { onConflict: "slug" });

  if (printError) throw printError;

  const { data: prints, error: printsFetchError } = await supabase
    .from("prints")
    .select("id, slug");

  if (printsFetchError) throw printsFetchError;

  const printIdBySlug = Object.fromEntries(prints.map((p) => [p.slug, p.id]));
  const printSlugByLegacyId = Object.fromEntries(catalog.prints.map((p) => [p.id, p.slug]));

  console.log("Seeding products...");

  const productRows = catalog.products.map((product) => {
    const printSlug = printSlugByLegacyId[product.printId];

    return {
      print_id: printIdBySlug[printSlug],
      slug: product.slug,
      silhouette: product.silhouette,
      title: product.title,
      price: product.price,
      sizes: product.sizes ?? [],
      fabric: product.fabric ?? null,
      description: product.description ?? null,
      fit: product.fit ?? null,
      details: product.details ?? [],
      inventory: product.inventory ?? 0,
      badge: product.badge ?? null
    };
  });

  const { error: productError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "slug" });

  if (productError) throw productError;

  console.log("Supabase seed completed without images.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
