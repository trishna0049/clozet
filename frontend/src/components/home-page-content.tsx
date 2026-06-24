"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
    quote: "The same print across multiple silhouettes is the whole reason I bookmarked Clozet."
  },
  {
    id: "rev-3",
    name: "Prisha",
    city: "Mumbai",
    rating: 4,
    quote: "Even without final campaign images, the concept already feels premium and different."
  }
];

const HERO_BG_IMAGE = "https://res.cloudinary.com/di67gryqm/image/upload/v1781969688/home_page_clozet_ysnfvv.jpg";

export function HomePageContent() {
  const { prints: allPrints, loading: printsLoading } = useRealtimePrints();
  const { products: trendingProducts, loading: productsLoading } = useRealtimeProducts();

  // Get all prints for the moving marquee
  const featuredPrints = useMemo(() => allPrints, [allPrints]);

  // Get trending products
  const trendingProductsFiltered = useMemo(
    () =>
      trendingProducts
        .filter((product) => product.badge === "Bestseller")
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
      names[product.slug] = print?.name ?? "Clozet Print";
    });
    return names;
  }, [trendingProductsFiltered, allPrints]);

  const newArrivalPrintNames = useMemo(() => {
    const names: Record<string, string> = {};
    newArrivals.forEach((product) => {
      const print = allPrints.find((p) => p.id === product.printId);
      names[product.slug] = print?.name ?? "Clozet Print";
    });
    return names;
  }, [newArrivals, allPrints]);

  if (printsLoading || productsLoading) {
    return <div className="space-y-20 pb-8 animate-pulse">Loading...</div>;
  }

  return (
    <div className="pb-8">
      <section className="flex justify-center">
        <div className="flex h-[1cm] w-full items-center justify-center gap-2 bg-cocoa px-4 text-center text-sm font-medium uppercase tracking-[0.22em] leading-none text-cream sm:px-6">
          <span>Use</span>
          <span>code</span>
          <span className="font-semibold">CLOZET10</span>
          <span>to get 10% off on your first purchase</span>
        </div>
      </section>

      <section className="relative flex h-[700px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={HERO_BG_IMAGE}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/82 to-white/55" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center text-center">
          <div>
            <h1 className="mt-5 mx-auto max-w-5xl font-display text-6xl leading-[0.92] text-cocoa md:text-8xl text-center">
              <span className="whitespace-nowrap">Choose the Print</span>
              <br />
              <span className="whitespace-nowrap">We Shape the Style</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-cocoa/72">
              Clozet flips fashion discovery. You begin with the artwork you love, then explore
              every silhouette cut in that exact print.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
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

      <div className="mt-12 w-full px-[1cm]">
        <section className="mt-8 mb-[1cm] space-y-8">
          <SectionHeader
            title="Shop by Print"
            actionLabel="See all prints"
            actionHref="/shop"
          />
          <div className="overflow-hidden">
            <div className="flex w-max animate-marquee will-change-transform">
              {[...featuredPrints, ...featuredPrints].map((print, index) => (
                <div
                  key={`${print.slug}-${index}`}
                  className="mr-6 w-[280px] shrink-0 sm:w-[320px] xl:w-[340px]"
                >
                  <PrintCard item={print} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-[1cm] space-y-8">
          <div className="space-y-4 text-left">
            <h2 className="font-display text-4xl leading-tight text-cocoa md:text-5xl whitespace-nowrap">
              Bestsellers
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {trendingProductsFiltered.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                printName={trendingPrintNames[product.slug] ?? "Clozet Print"}
              />
            ))}
          </div>
        </section>

        <section id="new-arrivals" className="space-y-8">
          <SectionHeader
            title="New arrivals"
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                printName={newArrivalPrintNames[product.slug] ?? "Clozet Print"}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
