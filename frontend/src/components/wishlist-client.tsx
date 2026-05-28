"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/providers";
import { ProductCard, PrintCard } from "@/components/catalog-ui";
import { useRealtimePrints } from "@/hooks/useRealtimePrints";
import { Heart } from "lucide-react";
import type { Product } from "@/types/catalog";

export function WishlistClient({ products, printNames }: { products: Product[]; printNames: Record<string, string> }) {
  const { wishlist } = useStore();
  const { prints: allPrints } = useRealtimePrints();
  const [activeTab, setActiveTab] = useState<"products" | "prints">("products");

  // Filter wishlisted products (handle both old and new format)
  const visibleProducts = products.filter((product) => 
    wishlist.includes(`product:${product.slug}`) || wishlist.includes(product.slug)
  );

  // Filter wishlisted prints
  const wishlistedPrintSlugs = wishlist
    .filter((item) => item.startsWith("print:"))
    .map((item) => item.replace("print:", ""));

  const visiblePrints = allPrints.filter((print) => wishlistedPrintSlugs.includes(print.slug));

  const hasProducts = visibleProducts.length > 0;
  const hasPrints = visiblePrints.length > 0;
  const isEmpty = !hasProducts && !hasPrints;

  return (
    <div className="space-y-8">
      {!isEmpty && (
        <div className="flex gap-3 border-b border-white/30">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-4 px-4 text-sm font-medium uppercase tracking-[0.25em] transition ${
              activeTab === "products"
                ? "border-b-2 border-cocoa text-cocoa"
                : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            Products ({visibleProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("prints")}
            className={`pb-4 px-4 text-sm font-medium uppercase tracking-[0.25em] transition ${
              activeTab === "prints"
                ? "border-b-2 border-cocoa text-cocoa"
                : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            Prints ({visiblePrints.length})
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-soft">
          <Heart size={32} className="mx-auto mb-4 text-cocoa/30" />
          <p className="text-cocoa/60">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-cocoa/50">Explore our collection and add your favorite prints and silhouettes</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-full bg-cocoa px-6 py-3 text-sm font-medium text-cream hover:bg-cocoa/90 transition"
          >
            Explore Shop
          </Link>
        </div>
      ) : activeTab === "products" ? (
        visibleProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                printName={printNames[product.printId] ?? "Aakaar Print"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-soft">
            <Heart size={32} className="mx-auto mb-4 text-cocoa/30" />
            <p className="text-cocoa/60">No products in your wishlist yet</p>
            <p className="mt-2 text-sm text-cocoa/50">Explore our collection and add your favorite silhouettes</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-cocoa px-6 py-3 text-sm font-medium text-cream hover:bg-cocoa/90 transition"
            >
              Browse Products
            </Link>
          </div>
        )
      ) : (
        visiblePrints.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visiblePrints.map((print) => (
              <PrintCard key={print.slug} item={print} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-soft">
            <Heart size={32} className="mx-auto mb-4 text-cocoa/30" />
            <p className="text-cocoa/60">No prints in your wishlist yet</p>
            <p className="mt-2 text-sm text-cocoa/50">Explore our print collection and add your favorites</p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-full bg-cocoa px-6 py-3 text-sm font-medium text-cream hover:bg-cocoa/90 transition"
            >
              Browse Prints
            </Link>
          </div>
        )
      )}
    </div>
  );
}
