import { getAllProducts, getPrintForProduct } from "@/lib/catalog";
import { ProductsPageContent } from "@/components/products-page-content";
import type { Product } from "@/types/catalog";

export default async function ProductsPage() {
  const products = await getAllProducts();

  // Get print names for each product
  const printNames = Object.fromEntries(
    await Promise.all(
      products.map(async (product) => [
        product.slug,
        (await getPrintForProduct(product))?.name ?? "Aakaar Print"
      ])
    )
  );

  return <ProductsPageContent products={products} printNames={printNames} />;
}
