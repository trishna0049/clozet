"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductCard, PrintCard, SectionHeader } from "@/components/catalog-ui";
import { useRealtimePrintDetail } from "@/hooks/useRealtimePrintDetail";
import { useRealtimePrints } from "@/hooks/useRealtimePrints";
import type { PrintWithMeta } from "@/types/catalog";

interface PrintDetailContentProps {
  slug: string;
}

export function PrintDetailContent({ slug }: PrintDetailContentProps) {
  const { print, products, loading, error } = useRealtimePrintDetail(slug);
  const { prints: allPrints } = useRealtimePrints();

  if (loading) {
    return <div className="space-y-10 pb-8 animate-pulse">Loading...</div>;
  }

  if (error || !print) {
    return <div className="space-y-10 pb-8 text-center text-cocoa">Print not found</div>;
  }

  // Get related prints in the same category
  const relatedPrints = allPrints
    .filter((item) => item.category === print.category && item.slug !== print.slug)
    .slice(0, 3);

  return (
    <div className="space-y-10 pb-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white shadow-soft">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex min-h-[420px] items-center justify-center bg-gradient-to-br from-sand via-cream to-white p-8 text-center overflow-hidden">
            {print.image ? (
              <Image
                src={print.image}
                alt={print.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cocoa/45">Cloudinary ready</p>
                <h2 className="mt-4 font-display text-5xl text-cocoa">{print.name}</h2>
                <p className="mt-3 text-sm leading-7 text-cocoa/60">
                  Upload a banner image later to turn this print page into a campaign landing screen.
                </p>
              </div>
            )}
          </div>

          <div className="p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.45em] text-cocoa/55">{print.category} print</p>
            <h1 className="mt-4 font-display text-6xl leading-none text-cocoa">{print.name}</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-cocoa/72">{print.description}</p>

            <div className="mt-8 grid gap-4 rounded-[1.8rem] bg-cream p-5 text-sm text-cocoa/75 md:grid-cols-2">
              <div>
                <p className="uppercase tracking-[0.28em] text-cocoa/50">Styles</p>
                <p className="mt-2 text-lg text-cocoa">{products.length} silhouettes in this print</p>
              </div>
              <div>
                <p className="uppercase tracking-[0.28em] text-cocoa/50">Drop note</p>
                <p className="mt-2 text-lg text-cocoa">{print.dropNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeader
          eyebrow="One print, multiple forms"
          title={`All silhouettes in ${print.name}`}
          description="This is the signature Clozet experience. Stay in the print you love and compare shapes without losing the visual story."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} printName={print.name} />
          ))}
        </div>
      </section>

      {relatedPrints.length > 0 && (
        <section className="space-y-8">
          <SectionHeader
            eyebrow="Similar prints"
            title={`More ${print.category} prints`}
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedPrints.map((relatedPrint) => (
              <PrintCard
                key={relatedPrint.slug}
                item={relatedPrint}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
