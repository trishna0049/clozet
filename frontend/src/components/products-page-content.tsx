"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/catalog-ui";
import type { Product } from "@/types/catalog";

const PRODUCT_CATEGORIES = ["Tops", "Dresses", "Co-ords", "Shirts", "Kurtis"];
const SIZES = ["XS", "S", "M", "L", "XL"];
const SLEEVES = ["Sleeveless", "Half Sleeve", "Full Sleeve"];
const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Customer Rating", value: "rating" }
];

// Common color keywords to extract from product details
const COLOR_KEYWORDS = [
  "red", "blue", "green", "black", "white", "navy", "cream", "cocoa", "pink", "yellow",
  "purple", "orange", "brown", "gray", "grey", "beige", "burgundy", "olive", "teal",
  "maroon", "gold", "silver", "rust", "sage", "charcoal", "ivory", "coral", "turquoise",
  "khaki", "indigo", "mauve", "rose", "taupe", "fuchsia", "lime", "mint"
];

// Map categories to their singular search terms
const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  "Tops": "top",
  "Dresses": "dress",
  "Co-ords": "co-ord",
  "Shirts": "shirt",
  "Kurtis": "kurti"
};

interface ProductsPageContentProps {
  products: Product[];
  printNames: Record<string, string>;
  searchTerm: string;
  initialCategory?: string;
}

// Fuzzy search: checks if all characters of each query token appear in order within the text
function fuzzyMatch(text: string, query: string): boolean {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lowerText = text.toLowerCase();
  return tokens.every(token => {
    if (lowerText.includes(token)) return true;
    let ti = 0;
    for (let qi = 0; qi < token.length && ti < lowerText.length; qi++) {
      while (ti < lowerText.length && lowerText[ti] !== token[qi]) ti++;
      if (ti < lowerText.length) ti++;
      else return false;
    }
    return true;
  });
}

export function ProductsPageContent({ products, printNames, searchTerm, initialCategory = "" }: ProductsPageContentProps) {
  console.count("ProductsPageContent");

  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get("category") ?? "";

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchTerm);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedPrintCategories, setSelectedPrintCategories] = useState<Set<string>>(new Set());
  const [selectedProductCategories, setSelectedProductCategories] = useState<Set<string>>(
    () => initialCategory && PRODUCT_CATEGORIES.includes(initialCategory) ? new Set([initialCategory]) : new Set()
  );
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedSleeves, setSelectedSleeves] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("popularity");
  const [showAllPrints, setShowAllPrints] = useState(false);

  // Sync category from URL on client navigation
  useEffect(() => {
    if (urlCategory && PRODUCT_CATEGORIES.includes(urlCategory)) {
      setSelectedProductCategories(new Set([urlCategory]));
    } else if (!urlCategory) {
      setSelectedProductCategories(new Set());
    }
  }, [urlCategory]);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const allPrints = Array.from(new Set(products.map(p => printNames[p.slug] || "Unknown"))).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    
    // Extract colors from product details
    const colors = Array.from(new Set(products.flatMap(p => {
      const productText = (p.description || "" + p.details?.join(" ") || "").toLowerCase();
      return COLOR_KEYWORDS.filter(color => productText.includes(color))
        .map(color => color.charAt(0).toUpperCase() + color.slice(1));
    }))).sort();

    return {
      printNames: allPrints,
      productCategories: PRODUCT_CATEGORIES,
      sizes: SIZES,
      sleeves: SLEEVES,
      colors: colors,
      priceRange: {
        min: Math.min(...products.map(p => p.price), 0),
        max: Math.max(...products.map(p => p.price), 10000)
      }
    };
  }, [products, printNames]);

  // Count products matching each filter option
  const filterCounts = useMemo(() => {
    const categoryCounts = Object.fromEntries(
      PRODUCT_CATEGORIES.map((category) => {
        const searchTerm = CATEGORY_SEARCH_TERMS[category];
        const count = products.filter((product) =>
          product.title?.toLowerCase().includes(searchTerm) ||
          product.silhouette?.toLowerCase().includes(searchTerm)
        ).length;
        return [category, count];
      })
    );

    const sizeCounts = Object.fromEntries(
      SIZES.map((size) => [
        size,
        products.filter((product) => (product.sizes ?? []).includes(size)).length
      ])
    );

    const sleeveCounts = Object.fromEntries(
      SLEEVES.map((sleeve) => {
        const search = sleeve.toLowerCase().replace(/\s/g, "");
        const count = products.filter((product) =>
          (product.sleeves ?? []).some(s => s.toLowerCase().replace(/\s/g, "") === search)
        ).length;
        return [sleeve, count];
      })
    );

    const printCounts = Object.fromEntries(
      filterOptions.printNames.map((name) => [
        name,
        products.filter((product) => (printNames[product.slug] || "Unknown") === name).length
      ])
    );

    const colorCounts = Object.fromEntries(
      filterOptions.colors.map((color) => {
        const count = products.filter((product) => {
          const text = (product.description || "" + product.details?.join(" ") || "").toLowerCase();
          return text.includes(color.toLowerCase());
        }).length;
        return [color, count];
      })
    );

    return { categoryCounts, sizeCounts, sleeveCounts, printCounts, colorCounts };
  }, [products, printNames, filterOptions.printNames, filterOptions.colors]);

  // Smart token matching: each query token must match category, color, or fuzzy-text
  const matchSearchToken = (token: string, product: Product, printName: string): boolean => {
    for (const [cat, searchTerm] of Object.entries(CATEGORY_SEARCH_TERMS)) {
      if (cat.toLowerCase().includes(token) || token.includes(searchTerm)) {
        if (product.title?.toLowerCase().includes(searchTerm) ||
            product.silhouette?.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
    }
    for (const color of COLOR_KEYWORDS) {
      if (color.includes(token) || token.includes(color)) {
        const text = (product.description || "" + product.details?.join(" ") || "").toLowerCase();
        if (text.includes(color)) return true;
      }
    }
    const productText = [
      product.title, product.silhouette, product.description,
      product.details?.join(" "), printName
    ].filter(Boolean).join(" ").toLowerCase();
    return fuzzyMatch(productText, token);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const searchTokens = normalizedSearchQuery.split(/\s+/).filter(Boolean);

    let filtered = products.filter(product => {
      const printName = printNames[product.slug] || "Unknown";
      
      // Search filter - smart token matching
      if (searchTokens.length > 0) {
        const matchesAllTokens = searchTokens.every(token =>
          matchSearchToken(token, product, printName)
        );
        if (!matchesAllTokens) return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Print filter
      if (selectedPrintCategories.size > 0 && !selectedPrintCategories.has(printName)) {
        return false;
      }

      // Product category filter - based on title or silhouette matching product categories
      if (selectedProductCategories.size > 0) {
        const matchesCategory = Array.from(selectedProductCategories).some(category => {
          const searchTerm = CATEGORY_SEARCH_TERMS[category];
          return product.title?.toLowerCase().includes(searchTerm) ||
                 product.silhouette?.toLowerCase().includes(searchTerm);
        });
        if (!matchesCategory) {
          return false;
        }
      }

      // Size filter
      if (selectedSizes.size > 0 && !product.sizes.some(s => selectedSizes.has(s))) {
        return false;
      }

      // Sleeve filter - based on product sleeves column
      if (selectedSleeves.size > 0) {
        const matchesSleeve = Array.from(selectedSleeves).some(sleeve => {
          const search = sleeve.toLowerCase().replace(/\s/g, "");
          return (product.sleeves ?? []).some(s => s.toLowerCase().replace(/\s/g, "") === search);
        });
        if (!matchesSleeve) {
          return false;
        }
      }

      // Color filter - based on product description or details
      if (selectedColors.size > 0) {
        const productText = (product.description || "" + product.details?.join(" ") || "").toLowerCase();
        const matchesColor = Array.from(selectedColors).some(color => {
          return productText.includes(color.toLowerCase());
        });
        if (!matchesColor) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Sort by ID descending (assuming higher ID = newer)
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "rating":
        // Sort by inventory as proxy for popularity/rating
        filtered.sort((a, b) => b.inventory - a.inventory);
        break;
      case "popularity":
      default:
        // Keep original order or sort by inventory
        filtered.sort((a, b) => b.inventory - a.inventory);
        break;
    }

    return filtered;
  }, [products, printNames, priceRange, selectedPrintCategories, selectedProductCategories, selectedSizes, selectedSleeves, selectedColors, sortBy, searchQuery]);

  const togglePrintCategory = (category: string) => {
    const newSet = new Set(selectedPrintCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedPrintCategories(newSet);
  };

  const toggleProductCategory = (category: string) => {
    const newSet = new Set(selectedProductCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setSelectedProductCategories(newSet);
  };

  const toggleSize = (size: string) => {
    const newSet = new Set(selectedSizes);
    if (newSet.has(size)) {
      newSet.delete(size);
    } else {
      newSet.add(size);
    }
    setSelectedSizes(newSet);
  };

  const toggleSleeve = (sleeve: string) => {
    const newSet = new Set(selectedSleeves);
    if (newSet.has(sleeve)) {
      newSet.delete(sleeve);
    } else {
      newSet.add(sleeve);
    }
    setSelectedSleeves(newSet);
  };

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
    setPriceRange([filterOptions.priceRange.min, filterOptions.priceRange.max]);
    setSelectedPrintCategories(new Set());
    setSelectedProductCategories(new Set());
    setSelectedSizes(new Set());
    setSelectedSleeves(new Set());
    setSelectedColors(new Set());
    setShowAllPrints(false);
  };

  const displayedPrints = showAllPrints ? filterOptions.printNames : filterOptions.printNames.slice(0, 5);

  return (
    <div className="space-y-8 pb-8" suppressHydrationWarning>
      {searchQuery.trim().length > 0 && (
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft text-sm text-cocoa/80">
          Showing results for <span className="font-semibold text-cocoa">"{searchQuery.trim()}"</span>
        </div>
      )}

      <div className="space-y-8">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="group relative">
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                <span>Sort by</span>
              </div>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-1 text-sm text-cocoa/72 hidden group-hover:block">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`block w-full rounded px-2 py-1 text-left transition ${
                      sortBy === option.value
                        ? "bg-cocoa text-cream"
                        : "hover:bg-cocoa/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                <span>Price</span>
              </div>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-3 text-sm text-cocoa/72 hidden group-hover:block">
                <div className="flex justify-between text-xs text-cocoa/60">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <div className="relative h-5">
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 rounded-full bg-cocoa/10" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-cocoa"
                    style={{
                      left: `${(priceRange[0] / 10000) * 100}%`,
                      right: `${100 - (priceRange[1] / 10000) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val < priceRange[1]) setPriceRange([val, priceRange[1]]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cocoa [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
                  />
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > priceRange[0]) setPriceRange([priceRange[0], val]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cocoa [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPriceRange([0, 10000])}
                  className="w-full pt-2 mt-2 text-left text-xs text-cocoa/50 hover:text-cocoa transition border-t border-cocoa/10"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                <span>Category</span>
                <span className="text-cocoa/60 text-xs">{selectedProductCategories.size ? `${selectedProductCategories.size} selected` : ""}</span>
              </div>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-2 text-sm text-cocoa/72 hidden group-hover:block">
                {filterOptions.productCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProductCategories.has(category)}
                      onChange={() => toggleProductCategory(category)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span>{category} ({filterCounts.categoryCounts[category] ?? 0})</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedProductCategories(new Set())}
                  className="w-full pt-2 mt-2 text-left text-xs text-cocoa/50 hover:text-cocoa transition border-t border-cocoa/10"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                <span>Size</span>
                <span className="text-cocoa/60 text-xs">{selectedSizes.size ? `${selectedSizes.size} selected` : ""}</span>
              </div>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-2 text-sm text-cocoa/72 hidden group-hover:block">
                {filterOptions.sizes.map((size) => (
                  <label key={size} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size)}
                      onChange={() => toggleSize(size)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span>{size} ({filterCounts.sizeCounts[size] ?? 0})</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedSizes(new Set())}
                  className="w-full pt-2 mt-2 text-left text-xs text-cocoa/50 hover:text-cocoa transition border-t border-cocoa/10"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                <span>Sleeves</span>
                <span className="text-cocoa/60 text-xs">{selectedSleeves.size ? `${selectedSleeves.size} selected` : ""}</span>
              </div>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-2 text-sm text-cocoa/72 hidden group-hover:block">
                {filterOptions.sleeves.map((sleeve) => (
                  <label key={sleeve} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSleeves.has(sleeve)}
                      onChange={() => toggleSleeve(sleeve)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span>{sleeve} ({filterCounts.sleeveCounts[sleeve] ?? 0})</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedSleeves(new Set())}
                  className="w-full pt-2 mt-2 text-left text-xs text-cocoa/50 hover:text-cocoa transition border-t border-cocoa/10"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="group relative">
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                <span>Print</span>
                <span className="text-cocoa/60 text-xs">{selectedPrintCategories.size ? `${selectedPrintCategories.size} selected` : ""}</span>
              </div>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-2 text-sm text-cocoa/72 hidden group-hover:block">
                {displayedPrints.map((print) => (
                  <label key={print} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPrintCategories.has(print)}
                      onChange={() => togglePrintCategory(print)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span>{print} ({filterCounts.printCounts[print] ?? 0})</span>
                  </label>
                ))}
                {!showAllPrints && filterOptions.printNames.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllPrints(true)}
                    className="mt-3 text-sm text-cocoa/60 hover:text-cocoa underline"
                  >
                    View All Prints ({filterOptions.printNames.length})
                  </button>
                )}
                {showAllPrints && (
                  <button
                    type="button"
                    onClick={() => setShowAllPrints(false)}
                    className="mt-3 text-sm text-cocoa/60 hover:text-cocoa underline"
                  >
                    View Less
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPrintCategories(new Set())}
                  className="w-full pt-2 mt-2 text-left text-xs text-cocoa/50 hover:text-cocoa transition border-t border-cocoa/10"
                >
                  Clear
                </button>
              </div>
            </div>

            {filterOptions.colors.length > 0 && (
              <div className="group relative">
                <div className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa rounded transition hover:bg-cocoa/5">
                  <span>Colour</span>
                  <span className="text-cocoa/60 text-xs">{selectedColors.size ? `${selectedColors.size} selected` : ""}</span>
                </div>
                <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-2 text-sm text-cocoa/72 hidden group-hover:block">
                  {filterOptions.colors.map((color) => (
                    <label key={color} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.has(color)}
                        onChange={() => toggleColor(color)}
                        className="w-4 h-4 rounded border-cocoa/30"
                      />
                    <span>{color} ({filterCounts.colorCounts[color] ?? 0})</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedColors(new Set())}
                  className="w-full pt-2 mt-2 text-left text-xs text-cocoa/50 hover:text-cocoa transition border-t border-cocoa/10"
                >
                  Clear
                </button>
              </div>
              </div>
            )}

            {(selectedPrintCategories.size > 0 || selectedProductCategories.size > 0 || selectedSizes.size > 0 || selectedSleeves.size > 0 || selectedColors.size > 0 ||
              priceRange[0] > filterOptions.priceRange.min || priceRange[1] < filterOptions.priceRange.max) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-cocoa/60 hover:text-cocoa underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  printName={printNames[product.slug] ?? "Clozet Print"}
                  compact
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-cocoa/60">No products match your filters</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
