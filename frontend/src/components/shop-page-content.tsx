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
  initialStoryTags?: string[];
}

const PRINT_STORY_TAGS = ["Abstract", "Indian", "Floral"] as const;

const normalizeStoryTag = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "abstract") return "Abstract";
  if (normalized === "indian") return "Indian";
  if (normalized === "floral") return "Floral";
  return null;
};

export function ShopPageContent({ initialCategory = "All", initialStoryTags = [] }: ShopPageContentProps) {
  const { prints: allPrints, loading: allPrintsLoading } = useRealtimePrints();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const initialNormalizedStoryTags = useMemo(
    () => Array.from(new Set(initialStoryTags.map((tag) => normalizeStoryTag(tag)).filter((tag): tag is string => Boolean(tag)))),
    [initialStoryTags]
  );
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedStoryTags, setSelectedStoryTags] = useState<Set<string>>(
    () => new Set(initialNormalizedStoryTags)
  );

  const activeColors = useMemo(() => Array.from(selectedColors), [selectedColors]);
  const activeStoryTags = useMemo(() => Array.from(selectedStoryTags), [selectedStoryTags]);
  const {
    prints: filteredPrints,
    loading: filteredPrintsLoading
  } = useRealtimePrints({
    category: selectedCategory,
    colors: activeColors,
    storyTags: activeStoryTags
  });

  const categoryOptions = useMemo(
    () => ["All", ...new Set(allPrints.map((print) => print.category))],
    [allPrints]
  );

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

  const buildShopUrl = (category: string, storyTag?: string) => {
    const params = new URLSearchParams();
    if (category !== "All") {
      params.set("category", category);
    }
    if (storyTag) {
      params.set("story", storyTag);
    }
    const queryString = params.toString();
    return queryString ? `/shop?${queryString}` : "/shop";
  };

  const handleStoryTagSelect = (tag: string) => {
    setSelectedStoryTags(new Set([tag]));
    const url = buildShopUrl(selectedCategory, tag);
    window.history.pushState({}, "", url);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const activeStoryTag = Array.from(selectedStoryTags)[0];
    const url = buildShopUrl(category, activeStoryTag);
    window.history.pushState({}, "", url);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedColors(new Set());
    setSelectedStoryTags(new Set());
    window.history.pushState({}, "", "/shop");
  };

  if (allPrintsLoading || filteredPrintsLoading) {
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
              Category
            </button>
            <div className="absolute left-0 top-full z-30 hidden pt-2 group-hover:block group-focus-within:block">
              <div className="w-48 rounded-xl border border-white/70 bg-white p-2 shadow-soft text-sm text-cocoa/80">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`block w-full rounded px-3 py-2 text-left text-xs uppercase tracking-[0.18em] transition ${
                      selectedCategory === category
                        ? "bg-cocoa text-cream"
                        : "text-cocoa/70 hover:bg-cream hover:text-cocoa"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="group relative">
            <button
              type="button"
              className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cocoa/75 transition hover:text-cocoa"
            >
              Colour
            </button>
            <div className="absolute left-0 top-full z-30 hidden pt-2 group-hover:block group-focus-within:block">
              <div className="max-h-72 w-52 overflow-auto rounded-xl border border-white/70 bg-white p-2 shadow-soft text-sm text-cocoa/80">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`block w-full rounded px-3 py-2 text-left text-xs uppercase tracking-[0.18em] transition ${
                      selectedColors.has(color)
                        ? "bg-cocoa text-cream"
                        : "text-cocoa/70 hover:bg-cream hover:text-cocoa"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {PRINT_STORY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleStoryTagSelect(tag)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                selectedStoryTags.has(tag)
                  ? "bg-cocoa text-cream"
                  : "text-cocoa/75 hover:text-cocoa"
              }`}
            >
              {tag}
            </button>
          ))}
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
