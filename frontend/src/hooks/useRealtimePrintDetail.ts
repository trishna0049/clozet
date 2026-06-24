import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Print, PrintWithMeta, Product } from "@/types/catalog";

export function useRealtimePrintDetail(slug: string) {
  const [print, setPrint] = useState<(Print & { silhouettesCount?: number; startingPrice?: number }) | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Decode the slug from URL encoding
  const decodedSlug = decodeURIComponent(slug);

  const fetchPrintDetail = useCallback(async () => {
    try {
      console.log("=== fetchPrintDetail START for slug:", decodedSlug);
      setLoading(true);
      const supabase = createClient();

      // Fetch print
      const printResponse = await supabase
        .from("prints")
        .select("id, slug, name, category, description, image, drop_note, limited_left, bestseller, featured")
        .eq("slug", decodedSlug)
        .single();

      console.log("=== fetchPrintDetail RESPONSE ===", printResponse);

      const { data: printData, error: printError } = printResponse;

      if (printError) {
        console.error("=== fetchPrintDetail PRINT ERROR ===", { 
          error: printError,
          errorMessage: printError?.message,
          errorCode: printError?.code,
          searchedSlug: slug,
          printData: printData
        });
        throw printError;
      }

      if (!printData) {
        console.error("=== fetchPrintDetail PRINT DATA MISSING ===", { printResponse });
        throw new Error("Print data not found for slug: " + decodedSlug);
      }

      console.log("=== fetchPrintDetail PRINT FOUND ===", { id: printData?.id, slug: printData?.slug, name: printData?.name });

      // Fetch products for this print
      const { data: productRows, error: productError } = await supabase
        .from("products")
        .select(
          "id, print_id, slug, silhouette, title, price, sizes, fabric, description, fit, details, inventory, badge, image"
        )
        .eq("print_id", printData.id)
        .order("created_at", { ascending: false });

      if (productError) {
        console.error("=== fetchPrintDetail PRODUCT ERROR ===", { productError, printId: printData.id });
        throw productError;
      }

      // Map print
      const mappedPrint = {
        id: printData.id,
        slug: printData.slug,
        name: printData.name,
        category: printData.category,
        description: printData.description ?? "",
        dropNote: printData.drop_note,
        limitedLeft: printData.limited_left ?? 0,
        bestseller: printData.bestseller ?? false,
        featured: printData.featured ?? false,
        image: printData.image,
        bannerImage: null,
        silhouettesCount: (productRows || []).length,
        startingPrice: 0
      };

      // Map products
      const mappedProducts = (productRows || []).map((row: any) => {
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

      setPrint(mappedPrint);
      setProducts(mappedProducts);
      setError(null);
      console.log("=== fetchPrintDetail SUCCESS ===", { slug, productCount: mappedProducts.length });
    } catch (err) {
      // Enhanced error logging
      if (err instanceof Error) {
        console.error("=== fetchPrintDetail ERROR (Error instance) ===", { name: err.name, message: err.message, stack: err.stack });
      } else if (typeof err === "object" && err !== null) {
        console.error("=== fetchPrintDetail ERROR (object) ===", JSON.stringify(err, null, 2));
      } else {
        console.error("=== fetchPrintDetail ERROR (other) ===", err);
      }
      setError(err instanceof Error ? err : new Error("Failed to fetch print details"));
      setPrint(null);
      setProducts([]);
    } finally {
      console.log("=== fetchPrintDetail END ===");
      setLoading(false);
    }
  }, [decodedSlug]);

  useEffect(() => {
    // Initial fetch
    fetchPrintDetail();

    const supabase = createClient();

    // Subscribe to realtime changes on prints table
    const printsSubscription = supabase
      .channel("print-detail-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prints"
        },
        () => {
          fetchPrintDetail();
        }
      )
      .subscribe();

    // Subscribe to realtime changes on products table
    const productsSubscription = supabase
      .channel("print-products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products"
        },
        () => {
          fetchPrintDetail();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(printsSubscription);
      supabase.removeChannel(productsSubscription);
    };
  }, [fetchPrintDetail]);

  return { print, products, loading, error };
}
