import { PrintDetailContent } from "@/components/print-detail-content";

export default async function PrintDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PrintDetailContent slug={slug} />;
}
