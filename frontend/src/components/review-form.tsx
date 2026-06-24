"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  orderId: string;
  productTitle: string;
  onSubmit: (review: ReviewSubmissionData) => Promise<void>;
  onClose: () => void;
}

export interface ReviewSubmissionData {
  rating: number;
  title: string;
  comment: string;
  images: string[];
}

export function ReviewForm({ productId, orderId, productTitle, onSubmit, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !comment.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        rating,
        title,
        comment,
        images
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-cocoa">Review: {productTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    size={32}
                    className={star <= rating ? "fill-cocoa text-cocoa" : "text-cocoa/20"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-cocoa mb-2">
              Review Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border border-cocoa/30 rounded-lg focus:outline-none focus:border-cocoa"
              maxLength={100}
            />
            <p className="text-xs text-cocoa/50 mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-cocoa mb-2">
              Your Review *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience with this product..."
              className="w-full px-4 py-2 border border-cocoa/30 rounded-lg focus:outline-none focus:border-cocoa resize-none"
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-cocoa/50 mt-1">{comment.length}/1000</p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-2">
              Add Photos (optional)
            </label>
            <p className="text-xs text-cocoa/50 mb-3">
              Upload images to help other customers. Paste image URLs below.
            </p>
            <div className="space-y-2">
              {images.map((image, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[idx] = e.target.value;
                      setImages(newImages);
                    }}
                    className="flex-1 px-4 py-2 border border-cocoa/30 rounded-lg focus:outline-none focus:border-cocoa text-sm"
                    placeholder="Image URL"
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <X size={18} className="text-red-500" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => setImages([...images, ""])}
                  className="text-sm text-cocoa hover:text-cocoa/80 font-medium"
                >
                  + Add Photo
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full border border-cocoa/30 text-cocoa font-medium hover:bg-cream transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-full bg-cocoa text-cream font-medium hover:bg-cocoa/90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>

          <p className="text-xs text-cocoa/50 text-center">
            Your review will be published after admin approval
          </p>
        </form>
      </div>
    </div>
  );
}