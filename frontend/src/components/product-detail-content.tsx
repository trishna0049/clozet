"use client";

import Image from "next/image";
import { ProductCard, ProductPurchasePanel, SectionHeader } from "@/components/catalog-ui";
import { useRealtimeProductDetail } from "@/hooks/useRealtimeProductDetail";

interface ProductDetailContentProps {
  slug: string;
}

export function ProductDetailContent({ slug }: ProductDetailContentProps) {
  const { product, print, siblingProducts, recommendations, loading, error } =
    useRealtimeProductDetail(slug);

  if (loading) {
    return <div className="space-y-10 pb-8 animate-pulse">Loading...</div>;
  }

  if (error || !product || !print) {
    return <div className="space-y-10 pb-8 text-center text-cocoa">Product not found</div>;
  }

  return (
    <div className="space-y-10 pb-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
        <div className="grid gap-0 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="grid min-h-0 gap-0 lg:grid-rows-[minmax(0,1fr)_auto]">
          <div className="relative aspect-[4/5] min-h-[320px] overflow-hidden lg:aspect-auto lg:h-full">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
                className="object-cover object-center"
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-cocoa/45">Cloudinary ready</p>
                <p className="mt-3 font-display text-4xl text-cocoa">{product.title}</p>
                <p className="mt-3 text-sm leading-7 text-cocoa/60">
                  Add model shots, flat lays, and fabric detail images later.
                </p>
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="grid gap-0 sm:grid-cols-2">
              {product.images.slice(1, 3).map((image) => (
                <div
                  key={image}
                  className="relative aspect-[4/5] overflow-hidden"
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="border-t border-cocoa/10 p-4 md:p-5 lg:border-l lg:border-t-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <ProductPurchasePanel product={product} printName={print.name} />
        </div>
        </div>
      </section>

      {siblingProducts.length > 0 && (
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Very important"
            title="View other styles in this print"
            description="Keep people in the same print universe instead of sending them back to a disconnected catalog."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {siblingProducts.map((item) => (
              <ProductCard key={item.slug} product={item} printName={print.name} />
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Recommended next"
            title="Print recommendations based on affinity"
            description="A simple recommendation layer can start with matching print moods and silhouette preferences."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((item) => (
              <ProductCard
                key={item.slug}
                product={item}
                printName={item.printId ? "Clozet Print" : print.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
