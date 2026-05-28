"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/providers";
import { createClient } from "@/lib/supabase/client";
import { Heart, ShoppingCart, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop by Print" },
  { href: "/products", label: "Shop Products" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, wishlist } = useStore();
  const wishlistCount = wishlist.length;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-3xl tracking-[0.18em] text-cocoa">AAKAAR</span>
          <span className="text-[10px] uppercase tracking-[0.4em] text-cocoa/60">
            Any shape and form
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm uppercase tracking-[0.28em] transition ${
                  active ? "text-cocoa" : "text-cocoa/60 hover:text-cocoa"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

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
          <p className="font-display text-3xl text-cocoa">Aakaar</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-cocoa/70">
            A print-first fashion platform designed for discovery, repeat styling, and drop-led
            storytelling.
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
            <p>hello@aakaar.in</p>
            <p>Ships all over India</p>
            <p>Crafted for limited print drops</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
