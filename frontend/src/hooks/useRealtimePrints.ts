import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PrintWithMeta } from "@/types/catalog";

type RealtimePrintFilters = {
  category?: string;
  colors?: string[];
  storyTags?: string[];
};

const normalizeFilterValues = (values?: string[]) =>
  Array.from(new Set((values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean))).sort();

const escapeLikeTerm = (term: string) => term.replace(/[%_,]/g, "").trim();

const buildTextMatchOrClause = (terms: string[]) =>
  terms
    .map((term) => escapeLikeTerm(term))
    .filter(Boolean)
    .flatMap((term) => [
      `name.ilike.%${term}%`,
      `description.ilike.%${term}%`
    ])
    .join(",");

const intersectSets = (base: Set<string> | null, incoming: Set<string>) => {
  if (base === null) {
    return new Set(incoming);
  }

  return new Set(Array.from(base).filter((item) => incoming.has(item)));
};

const STORY_TO_PRINT_CATEGORIES: Record<string, string[]> = {
  abstract: ["Abstract"],
  floral: ["Floral"],
  indian: ["Indian", "Ethnic"]
};

export function useRealtimePrints(filtersOrCategory?: string | RealtimePrintFilters) {
  const [prints, setPrints] = useState<PrintWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filters: RealtimePrintFilters =
    typeof filtersOrCategory === "string"
      ? { category: filtersOrCategory }
      : filtersOrCategory ?? {};

  const selectedCategory = filters.category;
  const selectedColors = normalizeFilterValues(filters.colors);
  const selectedStoryTags = normalizeFilterValues(filters.storyTags);
  const selectedColorsKey = selectedColors.join("|");
  const selectedStoryTagsKey = selectedStoryTags.join("|");

  const fetchPrints = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      let filteredIds: Set<string> | null = null;

      if (selectedColors.length > 0) {
        let colorQuery = supabase.from("prints").select("id");
        if (selectedCategory && selectedCategory !== "All") {
          colorQuery = colorQuery.eq("category", selectedCategory);
        }

        const colorClause = buildTextMatchOrClause(selectedColors);
        if (colorClause) {
          colorQuery = colorQuery.or(colorClause);
        }

        const { data: colorRows, error: colorError } = await colorQuery;
        if (colorError) {
          throw colorError;
        }

        filteredIds = intersectSets(
          filteredIds,
          new Set((colorRows ?? []).map((row: any) => row.id))
        );
      }

      if (selectedStoryTags.length > 0) {
        let storyQuery = supabase.from("prints").select("id");
        if (selectedCategory && selectedCategory !== "All") {
          storyQuery = storyQuery.eq("category", selectedCategory);
        }

        const storyCategories = Array.from(
          new Set(
            selectedStoryTags.flatMap((tag) => STORY_TO_PRINT_CATEGORIES[tag] ?? [tag])
          )
        );
        if (storyCategories.length > 0) {
          storyQuery = storyQuery.in("category", storyCategories);
        }

        const { data: storyRows, error: storyError } = await storyQuery;
        if (storyError) {
          throw storyError;
        }

        filteredIds = intersectSets(
          filteredIds,
          new Set((storyRows ?? []).map((row: any) => row.id))
        );
      }

      if (filteredIds && filteredIds.size === 0) {
        setPrints([]);
        setError(null);
        return;
      }
      
      // Fetch all prints
      let query = supabase
        .from("prints")
        .select("id, slug, name, category, description, image, drop_note, limited_left, bestseller, featured")
        .order("featured", { ascending: false })
        .order("name", { ascending: true });

      if (selectedCategory && selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      if (filteredIds) {
        query = query.in("id", Array.from(filteredIds));
      }

      const { data: printRows, error: printError } = await query;

      if (printError) {
        throw printError;
      }

      // Fetch products to calculate silhouettes count and starting price
      const printIds = (printRows ?? []).map((row: any) => row.id);
      let productQuery = supabase.from("products").select("id, print_id, price");
      if (printIds.length > 0) {
        productQuery = productQuery.in("print_id", printIds);
      }

      const { data: productRows, error: productError } = await productQuery;

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
  }, [selectedCategory, selectedColorsKey, selectedStoryTagsKey]);

  useEffect(() => {
    // Initial fetch
    fetchPrints();

    const supabase = createClient();
    const channelName = `prints-products-changes-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // Subscribe to realtime changes for both tables before calling subscribe.
    const realtimeSubscription = supabase
      .channel(channelName)
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
      supabase.removeChannel(realtimeSubscription);
    };
  }, [fetchPrints]);

  return { prints, loading, error };
}
