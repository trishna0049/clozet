"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRealtimePrints } from "@/hooks/useRealtimePrints";
import { useRealtimeProducts } from "@/hooks/useRealtimeProducts";
import {
  PrintCard,
  ProductCard,
  ReviewCard,
  SectionHeader
} from "@/components/catalog-ui";
import type { Print, PrintWithMeta, Product } from "@/types/catalog";

const reviews = [
  {
    id: "rev-1",
    name: "Aashi",
    city: "Jaipur",
    rating: 5,
    quote: "I loved choosing the print first. It felt like building my own mini collection."
  },
  {
    id: "rev-2",
    name: "Manya",
    city: "Delhi",
    rating: 5,
    quote: "The same print across multiple silhouettes is the whole reason I bookmarked Aakaar."
  },
  {
    id: "rev-3",
    name: "Prisha",
    city: "Mumbai",
    rating: 4,
    quote: "Even without final campaign images, the concept already feels premium and different."
  }
];

export function HomePageContent() {
  const { prints: allPrints, loading: printsLoading } = useRealtimePrints();
  const { products: trendingProducts, loading: productsLoading } = useRealtimeProducts();

  // Get featured prints
  const featuredPrints = useMemo(() => allPrints.filter((print) => print.featured).slice(0, 4), [allPrints]);

  // Get trending products
  const trendingProductsFiltered = useMemo(
    () =>
      trendingProducts
        .filter((product) =>
          ["Bestseller", "Trending", "Co-ord Hero", "Modern Muse", "Editor Pick"].includes(
            product.badge ?? ""
          )
        )
        .slice(0, 6),
    [trendingProducts]
  );

  // Get new arrivals
  const newArrivals = useMemo(
    () =>
      trendingProducts
        .filter((product) =>
          ["New Drop", "Modern Muse", "Occasion Pick", "Night Out"].includes(product.badge ?? "")
        )
        .slice(0, 4),
    [trendingProducts]
  );

  // Build print name maps using useMemo to prevent infinite loops
  const trendingPrintNames = useMemo(() => {
    const names: Record<string, string> = {};
    trendingProductsFiltered.forEach((product) => {
      const print = allPrints.find((p) => p.id === product.printId);
      names[product.slug] = print?.name ?? "Aakaar Print";
    });
    return names;
  }, [trendingProductsFiltered, allPrints]);

  const newArrivalPrintNames = useMemo(() => {
    const names: Record<string, string> = {};
    newArrivals.forEach((product) => {
      const print = allPrints.find((p) => p.id === product.printId);
      names[product.slug] = print?.name ?? "Aakaar Print";
    });
    return names;
  }, [newArrivals, allPrints]);

  if (printsLoading || productsLoading) {
    return <div className="space-y-20 pb-8 animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-20 pb-8">
      <section className="grid gap-8 overflow-hidden rounded-[2.5rem] border border-white/70 bg-print-grid p-8 shadow-soft lg:p-12 grid-cols-1 lg:grid-cols-3 relative">
        <div className="flex flex-col justify-between lg:col-span-2 z-10">
          <div>
            <h1 className="mt-5 max-w-3xl font-display text-6xl leading-[0.92] text-cocoa md:text-8xl">
              Choose the Print.
              <br />
              We Shape the Style.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cocoa/72">
              Aakaar flips fashion discovery. You begin with the artwork you love, then explore
              every silhouette cut in that exact print.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-full bg-cocoa px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-cream"
            >
              Shop by Print
            </Link>
            <Link
              href="#new-arrivals"
              className="rounded-full border border-cocoa/15 bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.25em] text-cocoa"
            >
              New arrivals
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeader
          eyebrow="Main focus"
          title="Shop by Print"
          description="This is the core Aakaar behavior. Prints are the entry point, and silhouettes are the options inside each print story."
          actionLabel="See all prints"
          actionHref="/shop"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredPrints.map((print) => (
            <PrintCard key={print.slug} item={print} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeader
          title="Best forms across your favorite prints"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trendingProductsFiltered.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              printName={trendingPrintNames[product.slug] ?? "Aakaar Print"}
            />
          ))}
        </div>
      </section>

      <section id="new-arrivals" className="space-y-8">
        <SectionHeader
          title="New arrivals"
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              printName={newArrivalPrintNames[product.slug] ?? "Aakaar Print"}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
