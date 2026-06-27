"use client";

import dynamic from "next/dynamic";
import type { Product } from "@/types/catalog";

const ProductsPageContent = dynamic(
  () => import("@/components/products-page-content").then((mod) => mod.ProductsPageContent),
  { ssr: false }
);

type ProductsPageClientProps = {
  products: Product[];
  printNames: Record<string, string>;
  printColorsByProductSlug: Record<string, string[]>;
  searchTerm: string;
  initialProductCategories?: string[];
};

export function ProductsPageClient(props: ProductsPageClientProps) {
  return <ProductsPageContent {...props} />;
}
