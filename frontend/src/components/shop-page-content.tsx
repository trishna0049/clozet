"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { PrintCard, SectionHeader } from "@/components/catalog-ui";
import { useRealtimePrints } from "@/hooks/useRealtimePrints";
import type { PrintWithMeta } from "@/types/catalog";

// Common color keywords
const COLOR_KEYWORDS = [
  "red", "blue", "green", "black", "white", "navy", "cream", "cocoa", "pink", "yellow",
  "purple", "orange", "brown", "gray", "grey", "beige", "burgundy", "olive", "teal",
  "maroon", "gold", "silver", "rust", "sage", "charcoal", "ivory", "coral", "turquoise",
  "khaki", "indigo", "mauve", "rose", "taupe", "fuchsia", "lime", "mint"
];

interface ShopPageContentProps {
  initialCategory?: string;
}

export function ShopPageContent({ initialCategory = "All" }: ShopPageContentProps) {
  const { prints: allPrints, loading } = useRealtimePrints();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  // Get filtered prints based on selected category and colors
  const filteredPrints = useMemo(() => {
    let filtered = selectedCategory === "All"
      ? allPrints
      : allPrints.filter((print) => print.category === selectedCategory);

    // Apply color filter
    if (selectedColors.size > 0) {
      filtered = filtered.filter((print) => {
        const printText = (print.description || "").toLowerCase();
        return Array.from(selectedColors).some(color =>
          printText.includes(color.toLowerCase())
        );
      });
    }

    return filtered;
  }, [allPrints, selectedCategory, selectedColors]);

  // Extract available colors from all prints
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    allPrints.forEach(print => {
      const printText = (print.description || "").toLowerCase();
      COLOR_KEYWORDS.forEach(color => {
        if (printText.includes(color)) {
          colors.add(color.charAt(0).toUpperCase() + color.slice(1));
        }
      });
    });
    return Array.from(colors).sort();
  }, [allPrints]);

  // Update category options when prints change
  useEffect(() => {
    const categories = ["All", ...new Set(allPrints.map((print) => print.category))];
    setCategoryOptions(categories);
  }, [allPrints]);

  const toggleColor = (color: string) => {
    const newSet = new Set(selectedColors);
    if (newSet.has(color)) {
      newSet.delete(color);
    } else {
      newSet.add(color);
    }
    setSelectedColors(newSet);
  };

  const clearFilters = () => {
    setSelectedColors(new Set());
  };

  if (loading) {
    return <div className="space-y-10 pb-8 animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-10 pb-8">
      <section className="rounded-[2.5rem] border border-white/70 bg-white p-8 shadow-soft">
        <SectionHeader
          eyebrow="Print-first shop"
          title="Browse prints"
          description="Every card below is a print story. Click in to see all silhouettes available in that same print."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          {categoryOptions.map((category) => {
            const active = category === selectedCategory;
            const href = category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`;
            return (
              <Link
                key={category}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory(category);
                  // Update URL without page reload
                  const url = category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`;
                  window.history.pushState({}, "", url);
                }}
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
                  active ? "bg-cocoa text-cream" : "bg-cream text-cocoa"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </div>

        {/* Color Filter */}
        {availableColors.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-cocoa">Filter by Colour</h4>
              {selectedColors.size > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-cocoa/60 hover:text-cocoa underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] transition ${
                    selectedColors.has(color)
                      ? "bg-cocoa text-cream"
                      : "bg-cream text-cocoa hover:bg-cocoa/5"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {filteredPrints.length > 0 && (
        <>
          <div className="text-sm text-cocoa/60">
            Showing {filteredPrints.length} of {allPrints.length} prints
          </div>

          <section className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {filteredPrints.map((print) => (
              <PrintCard key={print.slug} item={print} />
            ))}
          </section>
        </>
      )}

      {filteredPrints.length === 0 && (
        <div className="rounded-[2rem] border border-dashed border-cocoa/20 bg-white p-12 text-center">
          <p className="text-cocoa/70">No prints found matching your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-cocoa text-cream rounded-full text-sm font-medium hover:bg-cocoa/90 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
