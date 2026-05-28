import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PrintWithMeta } from "@/types/catalog";

export function useRealtimePrints(category?: string) {
  const [prints, setPrints] = useState<PrintWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrints = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Fetch all prints
      let query = supabase
        .from("prints")
        .select("id, slug, name, category, description, image, drop_note, limited_left, bestseller, featured")
        .order("featured", { ascending: false })
        .order("name", { ascending: true });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data: printRows, error: printError } = await query;

      if (printError) {
        throw printError;
      }

      // Fetch products to calculate silhouettes count and starting price
      const { data: productRows, error: productError } = await supabase
        .from("products")
        .select("id, print_id, price");

      if (productError) {
        throw productError;
      }

      // Map prints with metadata
      const mappedPrints = (printRows || []).map((row: any) => {
        const relatedProducts = (productRows || []).filter(
          (product: any) => product.print_id === row.id
        );
        const startingPrice = relatedProducts.length
          ? Math.min(...relatedProducts.map((product: any) => Number(product.price)))
          : 0;

        return {
          id: row.id,
          slug: row.slug,
          name: row.name,
          category: row.category,
          description: row.description ?? "",
          dropNote: row.drop_note,
          limitedLeft: row.limited_left ?? 0,
          bestseller: row.bestseller ?? false,
          featured: row.featured ?? false,
          image: row.image,
          bannerImage: null,
          silhouettesCount: relatedProducts.length,
          startingPrice
        };
      });

      setPrints(mappedPrints);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch prints"));
      setPrints([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    // Initial fetch
    fetchPrints();

    const supabase = createClient();

    // Subscribe to realtime changes on prints table
    const printsSubscription = supabase
      .channel("prints-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prints"
        },
        () => {
          // Refetch when prints change
          fetchPrints();
        }
      )
      .subscribe();

    // Subscribe to realtime changes on products table
    const productsSubscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products"
        },
        () => {
          // Refetch when products change (affects silhouettes count)
          fetchPrints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(printsSubscription);
      supabase.removeChannel(productsSubscription);
    };
  }, [fetchPrints]);

  return { prints, loading, error };
}
