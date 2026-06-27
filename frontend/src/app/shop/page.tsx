import { ShopPageContent } from "@/components/shop-page-content";

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; story?: string | string[] }>;
}) {
  const params = await searchParams;
  const selectedCategory = params?.category ?? "All";
  const selectedStories = Array.isArray(params?.story)
    ? params.story
    : params?.story
      ? [params.story]
      : [];

  return <ShopPageContent initialCategory={selectedCategory} initialStoryTags={selectedStories} />;
}
