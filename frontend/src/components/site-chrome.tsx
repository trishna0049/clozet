"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";
import { Heart, ShoppingCart, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop by Print" },
  { href: "/products", label: "All Products" }
];

const PRODUCT_CATEGORIES = ["Tops", "Dresses", "Co-ords", "Shirts", "Kurtis"];

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawCategory = searchParams?.get("category")?.trim().toLowerCase() ?? "";
  const activeCategory = rawCategory === "dressess" ? "dresses" : rawCategory;
  const isProductsPage = pathname === "/products";
  const allProductsActive = isProductsPage && !activeCategory;
  const topsActive = isProductsPage && activeCategory === "tops";
  const dressesActive = isProductsPage && activeCategory === "dresses";
  const { cartCount, wishlist } = useStore();
  const wishlistCount = wishlist.length;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProductSuggestions, setAllProductSuggestions] = useState<{ slug: string; title: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch product titles for search suggestions
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("slug, title");
      if (data) setAllProductSuggestions(data.map(p => ({ slug: p.slug, title: p.title ?? "" })));
    };
    fetchProducts();
  }, [supabase]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Navigate on search submit
  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/products");
    }
    setShowSuggestions(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-8">
        <Link href="/" className="flex flex-col leading-none flex-shrink-0">
          <span className="font-display text-2xl tracking-[0.18em] text-cocoa">CLOZET</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => {
            const active = item.href === "/products"
              ? allProductsActive
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isShopLink = item.href === "/shop" || item.href === "/products";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] uppercase tracking-[0.22em] transition ${
                  active ? "text-cocoa" : "text-cocoa/60 hover:text-cocoa"
                } ${isShopLink ? "font-semibold" : "font-medium"}`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/products?category=Tops"
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
              topsActive ? "text-cocoa" : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            Tops
          </Link>

          <Link
            href="/products?category=Dresses"
            className={`text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
              dressesActive ? "text-cocoa" : "text-cocoa/60 hover:text-cocoa"
            }`}
          >
            Dresses
          </Link>

          <div className="relative group">
            <button
              type="button"
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cocoa/60 hover:text-cocoa transition flex items-center gap-1"
            >
              Category
            </button>
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
              <div className="w-44 rounded-xl border border-white/70 bg-white p-2 shadow-soft space-y-1 text-sm text-cocoa/72">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="block rounded px-3 py-2 uppercase tracking-[0.2em] text-xs text-cocoa/70 hover:bg-cream hover:text-cocoa transition"
                  >
                    {cat}
                  </Link>
                ))}
                <Link
                  href="/products"
                  className="block rounded px-3 py-2 text-xs uppercase tracking-[0.2em] text-cocoa/70 underline underline-offset-2 transition hover:bg-cream hover:text-cocoa"
                >
                  View all
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Search with suggestions */}
        <div ref={searchRef} className="relative min-w-0 md:w-[220px]">
          <div className="flex items-center gap-2 rounded-full border border-cocoa/15 bg-white px-3 py-2 shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cocoa/40 flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); handleSearch(searchQuery); }
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              placeholder="Search products"
              className="min-w-0 w-full bg-transparent text-xs text-cocoa placeholder:text-cocoa/50 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                className="text-cocoa/30 hover:text-cocoa/60 transition flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>

          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-white/70 bg-white p-2 shadow-soft">
              {(() => {
                const q = searchQuery.trim().toLowerCase();
                const matchingCategories = PRODUCT_CATEGORIES.filter(cat =>
                  cat.toLowerCase().includes(q) || q.includes(cat.toLowerCase())
                );
                const matchingProducts = allProductSuggestions
                  .filter(p => p.title && p.title.toLowerCase().includes(q))
                  .slice(0, 5);

                if (matchingCategories.length === 0 && matchingProducts.length === 0) {
                  return <p className="px-3 py-2 text-xs text-cocoa/40">No suggestions</p>;
                }

                return (
                  <>
                    {matchingCategories.length > 0 && (
                      <div className="mb-1">
                        <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-cocoa/40 font-semibold">Categories</p>
                        {matchingCategories.map(cat => (
                          <button
                            key={cat}
                            onMouseDown={e => { e.preventDefault(); handleSearch(cat); }}
                            className="block w-full rounded px-3 py-1.5 text-left text-xs text-cocoa/80 hover:bg-cream transition"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                    {matchingProducts.length > 0 && (
                      <div>
                        <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-cocoa/40 font-semibold">Products</p>
                        {matchingProducts.map(p => (
                          <button
                            key={p.slug}
                            onMouseDown={e => { e.preventDefault(); handleSearch(p.title); }}
                            className="block w-full rounded px-3 py-1.5 text-left text-xs text-cocoa/80 hover:bg-cream transition truncate"
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/wishlist"
            className="rounded-full border border-cocoa/15 bg-white p-2 text-cocoa shadow-soft hover:bg-cocoa/5 relative"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cocoa text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-cocoa/15 bg-white p-2 text-cocoa shadow-soft hover:bg-cocoa/5 relative"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cocoa text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            className="rounded-full border border-cocoa/15 bg-white p-2 text-cocoa shadow-soft hover:bg-cocoa/5"
            aria-label="Profile"
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  return (
    <footer className="border-t border-cocoa/10 bg-white/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl text-cocoa">CLOZET</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-cocoa/70">
            Explore every silhouette cut in your favourite print.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cocoa">Explore</p>
          <div className="mt-4 space-y-3 text-sm text-cocoa/70">
            <Link href="/shop" className="block hover:text-cocoa">
              Browse prints
            </Link>
            <Link href="/checkout" className="block hover:text-cocoa">
              Checkout
            </Link>
            <Link href={isLoggedIn ? "/account" : "/login"} className="block hover:text-cocoa">
              Account
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cocoa">Support</p>
          <div className="mt-4 space-y-3 text-sm text-cocoa/70">
            <p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=clozet2025@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cocoa"
              >
                clozet2025@gmail.com
              </a>
            </p>
            <p>Shipping all over India</p>
            <p>Where every print tells a story</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
