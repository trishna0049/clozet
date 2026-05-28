import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Print, Product } from "@/types/catalog";

export function useRealtimeProductDetail(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [print, setPrint] = useState<Print | null>(null);
  const [siblingProducts, setSiblingProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Decode the slug from URL encoding
  const decodedSlug = decodeURIComponent(slug);

  const fetchProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(
          "id, print_id, slug, silhouette, title, price, sizes, fabric, description, fit, details, inventory, badge, image"
        )
        .eq("slug", decodedSlug)
        .single();

      if (productError) {
        throw productError;
      }

      // Map product
      const imageArray = productData.image ? [productData.image] : [];

      const mappedProduct = {
        id: productData.id,
        printId: productData.print_id,
        slug: productData.slug,
        silhouette: productData.silhouette,
        title: productData.title,
        price: Number(productData.price),
        sizes: productData.sizes ?? [],
        images: imageArray,
        fabric: productData.fabric,
        description: productData.description,
        fit: productData.fit,
        details: productData.details ?? [],
        inventory: productData.inventory ?? 0,
        badge: productData.badge
      };

      // Fetch print
      const { data: printData } = await supabase
        .from("prints")
        .select("id, slug, name, category, description, image, drop_note, limited_left, bestseller, featured")
        .eq("id", productData.print_id)
        .single();

      const mappedPrint = printData ? {
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
        bannerImage: null
      } : null;

      // Fetch sibling products (same print)
      const { data: siblingRows } = await supabase
        .from("products")
        .select(
          "id, print_id, slug, silhouette, title, price, sizes, fabric, description, fit, details, inventory, badge, image"
        )
        .eq("print_id", productData.print_id)
        .order("created_at", { ascending: false });

      const mappedSiblings = (siblingRows || [])
        .filter((item: any) => item.slug !== slug)
        .map((row: any) => {
          const imgArray = row.image ? [row.image] : [];
          return {
            id: row.id,
            printId: row.print_id,
            slug: row.slug,
            silhouette: row.silhouette,
            title: row.title,
            price: Number(row.price),
            sizes: row.sizes ?? [],
            images: imgArray,
            fabric: row.fabric,
            description: row.description,
            fit: row.fit,
            details: row.details ?? [],
            inventory: row.inventory ?? 0,
            badge: row.badge
          };
        });

      // Fetch all products and prints for recommendations
      const { data: allProducts } = await supabase
        .from("products")
        .select("id, print_id, slug, silhouette, title, price, sizes, fabric, description, fit, details, inventory, badge, image");

      const { data: allPrints } = await supabase
        .from("prints")
        .select("id, category");

      const categoryPrintIds = new Set(
        (allPrints || [])
          .filter((p: any) => p.id === printData?.id || (printData && (allPrints.find((ap: any) => ap.id === printData.id)?.category === p.category)))
          .map((p: any) => p.id)
      );

      const mappedRecommendations = (allProducts || [])
        .filter((item: any) => 
          item.slug !== slug && 
          item.print_id !== productData.print_id && 
          categoryPrintIds.has(item.print_id)
        )
        .slice(0, 6)
        .map((row: any) => {
          const imgArray = row.image ? [row.image] : [];
          return {
            id: row.id,
            printId: row.print_id,
            slug: row.slug,
            silhouette: row.silhouette,
            title: row.title,
            price: Number(row.price),
            sizes: row.sizes ?? [],
            images: imgArray,
            fabric: row.fabric,
            description: row.description,
            fit: row.fit,
            details: row.details ?? [],
            inventory: row.inventory ?? 0,
            badge: row.badge
          };
        });

      setProduct(mappedProduct);
      setPrint(mappedPrint);
      setSiblingProducts(mappedSiblings);
      setRecommendations(mappedRecommendations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch product details"));
      setProduct(null);
      setPrint(null);
      setSiblingProducts([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [decodedSlug]);

  useEffect(() => {
    // Initial fetch
    fetchProductDetail();

    const supabase = createClient();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel("product-detail-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products"
        },
        () => {
          fetchProductDetail();
        }
      )
      .subscribe();

    const printsSubscription = supabase
      .channel("product-prints-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prints"
        },
        () => {
          fetchProductDetail();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(printsSubscription);
    };
  }, [fetchProductDetail]);

  return { product, print, siblingProducts, recommendations, loading, error };
}
