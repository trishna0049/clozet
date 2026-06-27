"use client";

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
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

const CATEGORY_ALIASES: Record<string, string> = {
  tops: "Tops",
  top: "Tops",
  dresses: "Dresses",
  dress: "Dresses",
  dressess: "Dresses",
  "co-ords": "Co-ords",
  coords: "Co-ords",
  shirts: "Shirts",
  shirt: "Shirts",
  kurtis: "Kurtis",
  kurti: "Kurtis"
};

const normalizeProductCategory = (value: string) => {
  const normalized = value.trim().toLowerCase();
  const mapped = CATEGORY_ALIASES[normalized];
  return mapped && PRODUCT_CATEGORIES.includes(mapped) ? mapped : null;
};

interface ProductsPageContentProps {
  products: Product[];
  printNames: Record<string, string>;
  searchTerm: string;
  initialProductCategories?: string[];
}

export function ProductsPageContent({
  products,
  printNames,
  searchTerm,
  initialProductCategories = []
}: ProductsPageContentProps) {
  console.count("ProductsPageContent");

  const searchParams = useSearchParams();
  const categoriesFromUrl = useMemo(() => searchParams.getAll("category"), [searchParams]);

  const normalizedInitialProductCategories = useMemo(
    () => {
      const sourceCategories = categoriesFromUrl.length > 0 ? categoriesFromUrl : initialProductCategories;
      return Array.from(
        new Set(
          sourceCategories
            .map((category) => normalizeProductCategory(category))
            .filter((category): category is string => Boolean(category))
        )
      );
    },
    [categoriesFromUrl, initialProductCategories]
  );

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedPrintCategories, setSelectedPrintCategories] = useState<Set<string>>(new Set());
  const [selectedProductCategories, setSelectedProductCategories] = useState<Set<string>>(
    () => new Set(normalizedInitialProductCategories)
  );
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [selectedSleeves, setSelectedSleeves] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("popularity");
  const [showAllPrints, setShowAllPrints] = useState(false);
  const dropdownRefs = useRef<Array<HTMLDetailsElement | null>>([]);

  useEffect(() => {
    setSelectedProductCategories(new Set(normalizedInitialProductCategories));
  }, [normalizedInitialProductCategories]);

  const setDropdownRef = (index: number) => (node: HTMLDetailsElement | null) => {
    dropdownRefs.current[index] = node;
  };

  const handleDropdownToggle = (index: number) => (event: SyntheticEvent<HTMLDetailsElement>) => {
    const current = event.currentTarget;
    if (!current.open) {
      return;
    }

    dropdownRefs.current.forEach((dropdown, dropdownIndex) => {
      if (dropdownIndex !== index && dropdown?.open) {
        dropdown.open = false;
      }
    });
  };

  const handleMouseEnter = (index: number) => () => {
    dropdownRefs.current.forEach((dropdown, i) => {
      if (dropdown) dropdown.open = i === index;
    });
  };

  const handleMouseLeave = (index: number) => () => {
    const dropdown = dropdownRefs.current[index];
    if (dropdown) dropdown.open = false;
  };

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
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    let filtered = products.filter(product => {
      const printName = printNames[product.slug] || "Unknown";
      
      // Search filter
      if (normalizedSearchTerm) {
        const productText = [
          product.title,
          product.silhouette,
          product.description,
          product.details?.join(" "),
          printName
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!productText.includes(normalizedSearchTerm)) {
          return false;
        }
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
      {searchTerm.trim().length > 0 && (
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft text-sm text-cocoa/80">
          Showing results for <span className="font-semibold text-cocoa">"{searchTerm.trim()}"</span>
        </div>
      )}

      <div className="space-y-8">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <details className="group relative pb-2" ref={setDropdownRef(0)} onToggle={handleDropdownToggle(0)} onMouseEnter={handleMouseEnter(0)} onMouseLeave={handleMouseLeave(0)}>
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Sort by</span>
              </summary>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-2 shadow-soft space-y-2 text-sm text-cocoa/72">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`block w-full rounded px-2 py-1 text-left transition ${
                      sortBy === option.value
                        ? "bg-cocoa text-cream"
                        : "bg-cream text-cocoa hover:bg-cocoa/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </details>

            <details className="group relative pb-2" ref={setDropdownRef(1)} onToggle={handleDropdownToggle(1)} onMouseEnter={handleMouseEnter(1)} onMouseLeave={handleMouseLeave(1)}>
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Price</span>
              </summary>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-4 shadow-soft space-y-3 text-sm text-cocoa/72">
                <div className="flex justify-between text-xs text-cocoa/60">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <div className="relative h-5">
                  {/* Track background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 rounded-full bg-cocoa/10" />
                  {/* Active range fill */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-cocoa"
                    style={{
                      left: `${((priceRange[0] - filterOptions.priceRange.min) / (filterOptions.priceRange.max - filterOptions.priceRange.min)) * 100}%`,
                      right: `${100 - ((priceRange[1] - filterOptions.priceRange.min) / (filterOptions.priceRange.max - filterOptions.priceRange.min)) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val < priceRange[1]) setPriceRange([val, priceRange[1]]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cocoa [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > priceRange[0]) setPriceRange([priceRange[0], val]);
                    }}
                    className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cocoa [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
                  />
                </div>
              </div>
            </details>

            <details className="group relative pb-2" ref={setDropdownRef(2)} onToggle={handleDropdownToggle(2)} onMouseEnter={handleMouseEnter(2)} onMouseLeave={handleMouseLeave(2)}>
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Category</span>
                {selectedProductCategories.size > 0 && (
                  <span className="text-cocoa/60 text-xs">{selectedProductCategories.size} selected</span>
                )}
              </summary>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-3 text-sm text-cocoa/72">
                {filterOptions.productCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProductCategories.has(category)}
                      onChange={() => toggleProductCategory(category)}
                      className="w-4 h-4 rounded border-cocoa/30 accent-cocoa"
                    />
                    <span>{category}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedProductCategories(new Set())}
                  className="w-full pt-1 text-left text-sm text-cocoa/75 underline underline-offset-2 hover:text-cocoa transition"
                >
                  View all
                </button>
              </div>
            </details>

            <details className="group relative pb-2" ref={setDropdownRef(3)} onToggle={handleDropdownToggle(3)} onMouseEnter={handleMouseEnter(3)} onMouseLeave={handleMouseLeave(3)}>
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Size</span>
                {selectedSizes.size > 0 && (
                  <span className="text-cocoa/60 text-xs">{selectedSizes.size} selected</span>
                )}
              </summary>
              <div className="absolute left-0 top-full z-30 w-48 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-3 text-sm text-cocoa/72">
                {filterOptions.sizes.map((size) => (
                  <label key={size} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size)}
                      onChange={() => toggleSize(size)}
                      className="w-4 h-4 rounded border-cocoa/30 accent-cocoa"
                    />
                    <span>{size}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedSizes(new Set())}
                  className="w-full pt-1 text-left text-sm text-cocoa/75 underline underline-offset-2 hover:text-cocoa transition"
                >
                  View all
                </button>
              </div>
            </details>

            <details className="group relative pb-2" ref={setDropdownRef(4)} onToggle={handleDropdownToggle(4)} onMouseEnter={handleMouseEnter(4)} onMouseLeave={handleMouseLeave(4)}>
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Sleeves</span>
                {selectedSleeves.size > 0 && (
                  <span className="text-cocoa/60 text-xs">{selectedSleeves.size} selected</span>
                )}
              </summary>
              <div className="absolute left-0 top-full z-30 w-56 rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-3 text-sm text-cocoa/72">
                {filterOptions.sleeves.map((sleeve) => (
                  <label key={sleeve} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSleeves.has(sleeve)}
                      onChange={() => toggleSleeve(sleeve)}
                      className="w-4 h-4 rounded border-cocoa/30 accent-cocoa"
                    />
                    <span>{sleeve}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedSleeves(new Set())}
                  className="w-full pt-1 text-left text-sm text-cocoa/75 underline underline-offset-2 hover:text-cocoa transition"
                >
                  View all
                </button>
              </div>
            </details>

            <details className="group relative pb-2" ref={setDropdownRef(5)} onToggle={handleDropdownToggle(5)} onMouseEnter={handleMouseEnter(5)} onMouseLeave={handleMouseLeave(5)}>
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                <span>Print</span>
                {selectedPrintCategories.size > 0 && (
                  <span className="text-cocoa/60 text-xs">{selectedPrintCategories.size} selected</span>
                )}
              </summary>
              <div className="absolute left-0 top-full z-30 w-64 max-h-80 overflow-auto rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-3 text-sm text-cocoa/72">
                {displayedPrints.map((print) => (
                  <label key={print} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPrintCategories.has(print)}
                      onChange={() => togglePrintCategory(print)}
                      className="w-4 h-4 rounded border-cocoa/30 accent-cocoa"
                    />
                    <span>{print}</span>
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
              </div>
            </details>

            {filterOptions.colors.length > 0 && (
              <details className="group relative pb-2" ref={setDropdownRef(6)} onToggle={handleDropdownToggle(6)} onMouseEnter={handleMouseEnter(6)} onMouseLeave={handleMouseLeave(6)}>
                <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-sm font-medium text-cocoa">
                  <span>Colour</span>
                  {selectedColors.size > 0 && (
                    <span className="text-cocoa/60 text-xs">{selectedColors.size} selected</span>
                  )}
                </summary>
                <div className="absolute left-0 top-full z-30 w-56 max-h-80 overflow-auto rounded-xl border border-white/70 bg-white p-3 shadow-soft space-y-3 text-sm text-cocoa/72">
                  {filterOptions.colors.map((color) => (
                    <label key={color} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.has(color)}
                        onChange={() => toggleColor(color)}
                        className="w-4 h-4 rounded border-cocoa/30 accent-cocoa"
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedColors(new Set())}
                    className="w-full pt-1 text-left text-sm text-cocoa/75 underline underline-offset-2 hover:text-cocoa transition"
                  >
                    View all
                  </button>
                </div>
              </details>
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
