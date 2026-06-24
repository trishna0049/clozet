"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { CartItem, Product } from "@/types/catalog";
import { createClient } from "@/lib/supabase/client";

type StoreContextValue = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, printName: string, size?: string) => void;
  removeFromCart: (slug: string, size: string) => void;
  updateQuantity: (slug: string, size: string, quantity: number) => void;
  toggleWishlist: (slug: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = "clozet-cart";
const WISHLIST_KEY = "clozet-wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const supabase = createClient();

  // Load user and their cart/wishlist data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          setUserId(session.user.id);
          
          // Load user's cart from Supabase
          const { data: userCart } = await supabase
            .from("user_cart")
            .select("cart_items")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (userCart?.cart_items) {
            setCart(userCart.cart_items);
          }
          
          // Load user's wishlist from Supabase
          const { data: userWishlist } = await supabase
            .from("user_wishlist")
            .select("wishlist_items")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (userWishlist?.wishlist_items) {
            setWishlist(userWishlist.wishlist_items);
          }
        } else {
          // Not logged in - load from localStorage
          const savedCart = window.localStorage.getItem(CART_KEY);
          const savedWishlist = window.localStorage.getItem(WISHLIST_KEY);

          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }

          if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Fallback to localStorage on error
        const savedCart = window.localStorage.getItem(CART_KEY);
        const savedWishlist = window.localStorage.getItem(WISHLIST_KEY);

        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }

        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id) {
        setUserId(session.user.id);
        // Reset cart and wishlist to reload from DB
        setCart([]);
        setWishlist([]);
        loadUserData();
      } else if (event === "SIGNED_OUT") {
        setUserId(null);
        // Keep current cart/wishlist for guest checkout
      }
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  // Save cart to Supabase (when user is logged in) or localStorage (when not)
  useEffect(() => {
    if (isLoadingUserData) return;

    if (userId) {
      // Save to Supabase for logged-in users
      const saveToSupabase = async () => {
        try {
          const { data: existing } = await supabase
            .from("user_cart")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("user_cart")
              .update({ cart_items: cart })
              .eq("user_id", userId);
          } else {
            await supabase
              .from("user_cart")
              .insert({ user_id: userId, cart_items: cart });
          }
        } catch (error) {
          console.error("Failed to save cart:", error);
        }
      };

      saveToSupabase();
    } else {
      // Save to localStorage for guests
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, userId, isLoadingUserData, supabase]);

  // Save wishlist to Supabase (when user is logged in) or localStorage (when not)
  useEffect(() => {
    if (isLoadingUserData) return;

    if (userId) {
      // Save to Supabase for logged-in users
      const saveToSupabase = async () => {
        try {
          const { data: existing } = await supabase
            .from("user_wishlist")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("user_wishlist")
              .update({ wishlist_items: wishlist })
              .eq("user_id", userId);
          } else {
            await supabase
              .from("user_wishlist")
              .insert({ user_id: userId, wishlist_items: wishlist });
          }
        } catch (error) {
          console.error("Failed to save wishlist:", error);
        }
      };

      saveToSupabase();
    } else {
      // Save to localStorage for guests
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, userId, isLoadingUserData, supabase]);

  const value = useMemo<StoreContextValue>(() => {
    const addToCart = (product: Product, printName: string, size?: string) => {
      if (!size) return;
      setCart((current) => {
        const existing = current.find((item) => item.slug === product.slug && item.size === size);

        if (existing) {
          return current.map((item) =>
            item.slug === product.slug && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [
          ...current,
          {
            slug: product.slug,
            title: product.title,
            price: product.price,
            quantity: 1,
            size,
            image: product.images[0],
            silhouette: product.silhouette,
            printId: product.printId,
            printName
          }
        ];
      });
    };

    const removeFromCart = (slug: string, size: string) => {
      setCart((current) => current.filter((item) => !(item.slug === slug && item.size === size)));
    };

    const updateQuantity = (slug: string, size: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(slug, size);
        return;
      }

      setCart((current) =>
        current.map((item) =>
          item.slug === slug && item.size === size ? { ...item, quantity } : item
        )
      );
    };

    const toggleWishlist = (slug: string) => {
      setWishlist((current) =>
        current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
      );
    };

    const clearCart = () => setCart([]);
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      clearCart,
      cartCount,
      subtotal
    };
  }, [cart, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}

