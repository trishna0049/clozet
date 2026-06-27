import { getAllProducts, getPrintForProduct } from "@/lib/catalog";
import { ProductsPageContent } from "@/components/products-page-content";
import type { Product } from "@/types/catalog";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string | string[] };
}) {
  const products = await getAllProducts();
  const initialProductCategories = Array.isArray(searchParams.category)
    ? searchParams.category
    : searchParams.category
      ? [searchParams.category]
      : [];

  // Get print names for each product
  const printNames = Object.fromEntries(
    await Promise.all(
      products.map(async (product) => [
        product.slug,
        (await getPrintForProduct(product))?.name ?? "Clozet Print"
      ])
    )
  );

  return (
    <div
      className="w-screen max-w-none px-4 sm:px-8"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
    >
      <ProductsPageContent
        products={products}
        printNames={printNames}
        searchTerm={searchParams.q ?? ""}
        initialProductCategories={initialProductCategories}
      />
    </div>
  );
}
