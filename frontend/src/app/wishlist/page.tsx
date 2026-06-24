import { getAllProducts, getPrintForProduct } from "@/lib/catalog";
import { SectionHeader } from "@/components/catalog-ui";
import { WishlistClient } from "@/components/wishlist-client";

export default async function WishlistPage() {
  const allProducts = await getAllProducts();
  const printNames = Object.fromEntries(
    await Promise.all(
      allProducts.map(async (product) => [
        product.printId,
        (await getPrintForProduct(product))?.name ?? "Clozet Print"
      ])
    )
  );

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader
        title="Your wishlist"
        description="Save prints and silhouettes you love to build your perfect wardrobe."
      />
      <WishlistClient products={allProducts} printNames={printNames} />
    </div>
  );
}
