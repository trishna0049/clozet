import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;
  const supabase = createAdminClient();

  try {
    // Get only approved reviews
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        title,
        comment,
        images,
        helpful_count,
        unhelpful_count,
        created_at,
        user:user_id(full_name)
      `)
      .eq("product_id", productId)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate average rating
    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews: reviews || [],
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews?.length || 0
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
