"use client";

import { useMemo, useState } from "react";
import { ProductCard, SectionHeader } from "@/components/catalog-ui";
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
}

export function ProductsPageContent({ products, printNames }: ProductsPageContentProps) {
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedPrintCategories, setSelectedPrintCategories] = useState<Set<string>>(new Set());
  const [selectedProductCategories, setSelectedProductCategories] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedSleeves, setSelectedSleeves] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("popularity");
  const [showAllPrints, setShowAllPrints] = useState(false);

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

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const printName = printNames[product.slug] || "Unknown";
      
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

      // Sleeve filter - based on product description or details
      if (selectedSleeves.size > 0) {
        const productText = (product.description || "" + product.details?.join(" ") || "").toLowerCase();
        const matchesSleeve = Array.from(selectedSleeves).some(sleeve => {
          const sleeveSearch = sleeve.toLowerCase().replace(/\s/g, "");
          return productText.includes(sleeveSearch);
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
  }, [products, printNames, priceRange, selectedPrintCategories, selectedProductCategories, selectedSizes, selectedSleeves, selectedColors, sortBy]);

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
      <SectionHeader
        title="All Products"
        description="Explore all silhouettes and prints from our collection"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-cocoa">Filters</h3>
              {(selectedPrintCategories.size > 0 || selectedProductCategories.size > 0 || selectedSizes.size > 0 || selectedSleeves.size > 0 || selectedColors.size > 0 ||
                priceRange[0] > filterOptions.priceRange.min || priceRange[1] < filterOptions.priceRange.max) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-cocoa/60 hover:text-cocoa underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-8">
              <h4 className="font-semibold text-cocoa mb-4">Price Range</h4>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min={filterOptions.priceRange.min}
                      max={filterOptions.priceRange.max}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full px-2 py-1 border border-cocoa/30 rounded text-sm"
                      placeholder="Min"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min={filterOptions.priceRange.min}
                      max={filterOptions.priceRange.max}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full px-2 py-1 border border-cocoa/30 rounded text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-cocoa/72">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h4 className="font-semibold text-cocoa mb-4">Category</h4>
              <div className="space-y-3">
                {filterOptions.productCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProductCategories.has(category)}
                      onChange={() => toggleProductCategory(category)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span className="text-sm text-cocoa/72">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-8">
              <h4 className="font-semibold text-cocoa mb-4">Sizes</h4>
              <div className="space-y-3">
                {filterOptions.sizes.map((size) => (
                  <label key={size} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size)}
                      onChange={() => toggleSize(size)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span className="text-sm text-cocoa/72">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sleeve Filter */}
            <div className="mb-8">
              <h4 className="font-semibold text-cocoa mb-4">Sleeves</h4>
              <div className="space-y-3">
                {filterOptions.sleeves.map((sleeve) => (
                  <label key={sleeve} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSleeves.has(sleeve)}
                      onChange={() => toggleSleeve(sleeve)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span className="text-sm text-cocoa/72">{sleeve}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Print Filter */}
            <div className="mb-8">
              <h4 className="font-semibold text-cocoa mb-4">Print</h4>
              <div className="space-y-3">
                {displayedPrints.map((print) => (
                  <label key={print} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPrintCategories.has(print)}
                      onChange={() => togglePrintCategory(print)}
                      className="w-4 h-4 rounded border-cocoa/30"
                    />
                    <span className="text-sm text-cocoa/72">{print}</span>
                  </label>
                ))}
              </div>
              {!showAllPrints && filterOptions.printNames.length > 5 && (
                <button
                  onClick={() => setShowAllPrints(true)}
                  className="mt-3 text-sm text-cocoa/60 hover:text-cocoa underline"
                >
                  View All Prints ({filterOptions.printNames.length})
                </button>
              )}
              {showAllPrints && (
                <button
                  onClick={() => setShowAllPrints(false)}
                  className="mt-3 text-sm text-cocoa/60 hover:text-cocoa underline"
                >
                  View Less
                </button>
              )}
            </div>

            {/* Colour Filter */}
            {filterOptions.colors.length > 0 && (
              <div className="mb-8">
                <h4 className="font-semibold text-cocoa mb-4">Colour</h4>
                <div className="space-y-3">
                  {filterOptions.colors.map((color) => (
                    <label key={color} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.has(color)}
                        onChange={() => toggleColor(color)}
                        className="w-4 h-4 rounded border-cocoa/30"
                      />
                      <span className="text-sm text-cocoa/72">{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-cocoa/60">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium text-cocoa">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-cocoa/30 rounded text-sm text-cocoa bg-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                printName={printNames[product.slug] ?? "Aakaar Print"}
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
