import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/catalog";

export function useRealtimeProducts(filters?: { printId?: string; slug?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      console.log("=== fetchProducts START ===");
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("products")
        .select(
          "id, print_id, slug, silhouette, title, price, sizes, fabric, description, fit, details, inventory, badge, image"
        )
        .order("created_at", { ascending: false });

      if (filters?.printId) {
        query = query.eq("print_id", filters.printId);
      }

      if (filters?.slug) {
        query = query.eq("slug", filters.slug);
      }

      const { data: rows, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      console.log("Query result:", { hasError: !!fetchError, rowCount: rows?.length, firstRowKeys: Object.keys(rows?.[0] || {}), firstRow: rows?.[0] });

      // Map products
      const mappedProducts = (rows || []).map((row: any) => {
        // Handle single image - convert to array
        const imageArray = row.image ? [row.image] : [];

        return {
          id: row.id,
          printId: row.print_id,
          slug: row.slug,
          silhouette: row.silhouette,
          title: row.title,
          price: Number(row.price),
          sizes: row.sizes ?? [],
          images: imageArray,
          fabric: row.fabric,
          description: row.description,
          fit: row.fit,
          details: row.details ?? [],
          inventory: row.inventory ?? 0,
          badge: row.badge
        };
      });

      setProducts(mappedProducts);
      setError(null);
      console.log("Product images loaded:", mappedProducts.slice(0, 1).map(p => ({ slug: p.slug, images: p.images })));
    } catch (err) {
      console.error("=== fetchProducts ERROR ===", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch products"));
      setProducts([]);
    } finally {
      console.log("=== fetchProducts END ===");
      setLoading(false);
    }
  }, [filters?.printId, filters?.slug]);

  useEffect(() => {
    // Initial fetch
    fetchProducts();

    const supabase = createClient();

    // Subscribe to realtime changes on products table
    const subscription = supabase
      .channel("products-changes-detailed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products"
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchProducts]);

  return { products, loading, error };
}
