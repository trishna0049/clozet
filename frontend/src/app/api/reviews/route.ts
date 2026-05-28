import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderId, rating, title, comment, images } = body;

    if (!productId || !orderId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if user already reviewed this product
    const { data: existingReview } = await adminClient
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("order_id", orderId)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .eq("status", "delivered")
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Invalid order or product not delivered yet" },
        { status: 400 }
      );
    }

    // Create review
    const { data: review, error: reviewError } = await adminClient
      .from("reviews")
      .insert([
        {
          user_id: user.id,
          product_id: productId,
          order_id: orderId,
          rating,
          title,
          comment,
          images: images?.filter((img: string) => img.trim()) || [],
          approved: false // Requires admin approval
        }
      ])
      .select()
      .single();

    if (reviewError) throw reviewError;

    return NextResponse.json(
      {
        message: "Review submitted successfully. It will be published after admin approval.",
        review
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
