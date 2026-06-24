import { CartExperience, SectionHeader } from "@/components/catalog-ui";
import { getAllProducts, getPrintForProduct } from "@/lib/catalog";

export default async function CartPage() {
  const products = await getAllProducts();
  const suggestedProducts = products.slice(0, 4);
  const printNames = Object.fromEntries(
    await Promise.all(
      products.map(async (product) => [
        product.printId,
        (await getPrintForProduct(product))?.name ?? "Clozet Print"
      ])
    )
  );

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader
        eyebrow="Your edit"
        title="Cart"
        description="A clean bag experience that still reinforces the print-first story and nudges shoppers back into the same print family."
      />
      <CartExperience suggestedProducts={suggestedProducts} printNames={printNames} />
    </div>
  );
}
