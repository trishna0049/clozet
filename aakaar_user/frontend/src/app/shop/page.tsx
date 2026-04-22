import { ShopPageContent } from "@/components/shop-page-content";

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = params?.category ?? "All";

  return <ShopPageContent initialCategory={selectedCategory} />;
}
