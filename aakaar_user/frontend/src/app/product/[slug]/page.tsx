import { ProductDetailContent } from "@/components/product-detail-content";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailContent slug={slug} />;
}
