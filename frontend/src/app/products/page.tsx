import { getAllProducts } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProductsPageClient } from "@/components/products-page-client";

const parseColorValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
  }

  return [];
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const products = await getAllProducts();
  const supabase = createAdminClient();

  const uniquePrintIds = Array.from(new Set(products.map((product) => product.printId)));
  const { data: printRows } = uniquePrintIds.length
    ? await supabase.from("prints").select("*").in("id", uniquePrintIds)
    : { data: [] as any[] };

  const printMetaById = Object.fromEntries(
    (printRows ?? []).map((row: any) => {
      const colors = Array.from(
        new Set([
          ...parseColorValue(row?.colour),
          ...parseColorValue(row?.color),
          ...parseColorValue(row?.colors)
        ])
      );

      return [
        row.id,
        {
          name: row.name ?? "Clozet Print",
          colors
        }
      ];
    })
  );

  const initialProductCategories = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category
    : resolvedSearchParams.category
      ? [resolvedSearchParams.category]
      : [];

  // Build print names and print-colour map for each product.
  const printNames = Object.fromEntries(
    products.map((product) => [product.slug, printMetaById[product.printId]?.name ?? "Clozet Print"])
  );

  const printColorsByProductSlug = Object.fromEntries(
    products.map((product) => [product.slug, printMetaById[product.printId]?.colors ?? []])
  );

  return (
    <div
      className="w-screen max-w-none px-4 sm:px-8"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <ProductsPageClient
        products={products}
        printNames={printNames}
        printColorsByProductSlug={printColorsByProductSlug}
        searchTerm={resolvedSearchParams.q ?? ""}
        initialProductCategories={initialProductCategories}
      />
    </div>
  );
}
