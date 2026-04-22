"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful_count: number;
  unhelpful_count: number;
  created_at: string;
  user: {
    full_name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onAddReview: () => void;
  userHasReviewed: boolean;
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  onAddReview,
  userHasReviewed
}: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState("helpful");

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "helpful") {
      return b.helpful_count - a.helpful_count;
    } else if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "highest") {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    return { star, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
  });

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-display text-cocoa">{averageRating.toFixed(1)}</div>
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.round(averageRating) ? "fill-cocoa text-cocoa" : "text-cocoa/20"}
              />
            ))}
          </div>
          <p className="text-sm text-cocoa/60 mt-2">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-3">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-cocoa w-12 text-right">{star} ★</span>
              <div className="flex-1 h-2 bg-cocoa/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cocoa transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-cocoa/60 w-12">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Button */}
      {!userHasReviewed && (
        <button
          onClick={onAddReview}
          className="w-full rounded-full bg-cocoa px-6 py-3 text-sm font-medium text-cream hover:bg-cocoa/90 transition"
        >
          Share Your Review
        </button>
      )}

      {userHasReviewed && (
        <p className="text-sm text-cocoa/60 text-center">✓ You have already reviewed this product</p>
      )}

      {/* Sort and Filter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-cocoa">Customer Reviews ({totalReviews})</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-cocoa/30 rounded text-sm text-cocoa bg-white"
        >
          <option value="helpful">Most Helpful</option>
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div key={review.id} className="rounded-[1.5rem] border border-cocoa/10 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? "fill-cocoa text-cocoa" : "text-cocoa/20"}
                    />
                  ))}
                </div>
                {review.title && <p className="font-medium text-cocoa">{review.title}</p>}
              </div>
              <p className="text-xs text-cocoa/50">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>

            {review.comment && <p className="text-sm text-cocoa/75 mb-3">{review.comment}</p>}

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {review.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`Review image ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-cocoa/60">
              <p className="font-medium text-cocoa/75">{review.user.full_name}</p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 hover:text-cocoa transition">
                  <ThumbsUp size={14} />
                  {review.helpful_count > 0 && <span>{review.helpful_count}</span>}
                </button>
                <button className="flex items-center gap-1 hover:text-cocoa transition">
                  <ThumbsDown size={14} />
                  {review.unhelpful_count > 0 && <span>{review.unhelpful_count}</span>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-cocoa/60">No reviews yet. Be the first to review!</p>
        </div>
      )}
    </div>
  );
}
