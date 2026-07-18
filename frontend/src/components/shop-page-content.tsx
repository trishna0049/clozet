"use client";

import { useMemo, useState } from "react";
import { PrintCard } from "@/components/catalog-ui";
import { useRealtimePrints } from "@/hooks/useRealtimePrints";

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

const PRINT_CATEGORY_OPTIONS = ["Abstract", "Floral"] as const;

const normalizePrintCategory = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "abstract") return "Abstract";
  if (normalized === "floral") return "Floral";
  return null;
};

export function ShopPageContent({ initialCategory = "All" }: ShopPageContentProps) {
  const { prints: allPrints, loading: allPrintsLoading } = useRealtimePrints();
  const initialNormalizedCategories = useMemo(
    () =>
      Array.from(
        new Set(
          (initialCategory === "All" ? [] : initialCategory.split(","))
            .map((value) => normalizePrintCategory(value))
            .filter((value): value is string => Boolean(value))
        )
      ),
    [initialCategory]
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(initialNormalizedCategories)
  );
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

  const activeCategories = useMemo(() => Array.from(selectedCategories), [selectedCategories]);
  const activeColors = useMemo(() => Array.from(selectedColors), [selectedColors]);
  const {
    prints: filteredPrints,
    loading: filteredPrintsLoading
  } = useRealtimePrints({
    category: activeCategories,
    colors: activeColors
  });

  // Extract available colors from all prints
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    allPrints.forEach((print) => {
      const printText = `${print.name} ${print.description ?? ""}`.toLowerCase();
      COLOR_KEYWORDS.forEach(color => {
        if (printText.includes(color)) {
          colors.add(color.charAt(0).toUpperCase() + color.slice(1));
        }
      });
    });
    return Array.from(colors).sort();
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

  const buildShopUrl = (categories: string[]) => {
    const params = new URLSearchParams();
    if (categories.length > 0) {
      params.set("category", categories.join(","));
    }
    const queryString = params.toString();
    return queryString ? `/shop?${queryString}` : "/shop";
  };

  const handleCategorySelect = (category: string) => {
    const nextCategories = new Set(selectedCategories);
    if (nextCategories.has(category)) {
      nextCategories.delete(category);
    } else {
      nextCategories.add(category);
    }
    setSelectedCategories(nextCategories);
    const url = buildShopUrl(Array.from(nextCategories));
    window.history.pushState({}, "", url);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedColors(new Set());
    window.history.pushState({}, "", "/shop");
  };

  const isInitialLoading = (allPrintsLoading || filteredPrintsLoading) && allPrints.length === 0;
  if (isInitialLoading) {
    return <div className="space-y-10 pb-8 animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-10 pb-8">
      <section className="rounded-[2.5rem] border border-white/70 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 text-sm text-cocoa">
          <div className="group relative">
            <button
              type="button"
              className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cocoa/75 transition hover:text-cocoa"
            >
              <span>Category</span>
              {selectedCategories.size > 0 && (
                <span className="ml-2 text-[10px] font-medium normal-case tracking-normal text-cocoa/60">
                  ({selectedCategories.size} selected)
                </span>
              )}
            </button>
            <div className="absolute left-0 top-full z-30 hidden pt-2 group-hover:block">
              <div className="w-48 rounded-xl border border-white/70 bg-white p-2 shadow-soft text-sm text-cocoa/80">
                {PRINT_CATEGORY_OPTIONS.map((category) => (
                  <label
                    key={category}
                    className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-cocoa/80 transition hover:bg-cream hover:text-cocoa"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category)}
                      onChange={() => handleCategorySelect(category)}
                      className="h-3.5 w-3.5 rounded border-current accent-cocoa"
                    />
                    {category}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCategories(new Set())}
                  className="w-full px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-cocoa/70 underline underline-offset-2 transition hover:text-cocoa"
                >
                  Clear filter
                </button>
              </div>
            </div>
          </div>

          <div className="group relative">
            <button
              type="button"
              className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cocoa/75 transition hover:text-cocoa"
            >
              <span>Colour</span>
              {selectedColors.size > 0 && (
                <span className="ml-2 text-[10px] font-medium normal-case tracking-normal text-cocoa/60">
                  ({selectedColors.size} selected)
                </span>
              )}
            </button>
            <div className="absolute left-0 top-full z-30 hidden pt-2 group-hover:block">
              <div className="max-h-72 w-52 overflow-auto rounded-xl border border-white/70 bg-white p-2 shadow-soft text-sm text-cocoa/80">
                {availableColors.map((color) => (
                  <label
                    key={color}
                    className="flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-cocoa/80 transition hover:bg-cream hover:text-cocoa"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColors.has(color)}
                      onChange={() => toggleColor(color)}
                      className="h-3.5 w-3.5 rounded border-current accent-cocoa"
                    />
                    {color}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedColors(new Set())}
                  className="w-full px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-cocoa/70 underline underline-offset-2 transition hover:text-cocoa"
                >
                  Clear filter
                </button>
              </div>
            </div>
          </div>

          {(selectedCategories.size > 0 || selectedColors.size > 0) && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cocoa/70 underline underline-offset-2 transition hover:text-cocoa"
            >
              Clear filters
            </button>
          )}

        </div>
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
