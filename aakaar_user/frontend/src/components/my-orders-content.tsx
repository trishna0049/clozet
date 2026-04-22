"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight, Star, AlertCircle } from "lucide-react";
import { ReviewForm, ReviewSubmissionData } from "@/components/review-form";

interface OrderItem {
  product_id: string;
  product_title: string;
  silhouette: string;
  print_name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  payment_status: string;
}

export function MyOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{
    orderId: string;
    productId: string;
    productTitle: string;
  } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Please log in to view your orders");
          setLoading(false);
          return;
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [supabase]);

  const handleReviewSubmit = async (review: ReviewSubmissionData) => {
    if (!reviewingItem) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            user_id: user.id,
            product_id: reviewingItem.productId,
            order_id: reviewingItem.orderId,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            images: review.images.filter(img => img.trim()),
            approved: false
          }
        ]);

      if (error) throw error;
      setReviewingItem(null);
      // Could show success toast here
    } catch (err) {
      throw err;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors: Record<Order["status"], string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200"
    };
    return colors[status];
  };

  if (loading) {
    return <div className="text-center py-12">Loading your orders...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex gap-3">
        <AlertCircle size={20} className="flex-shrink-0" />
        <div>
          <p className="font-medium">Unable to load orders</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="font-display text-2xl text-cocoa mb-2">My Orders</h2>
        <p className="text-cocoa/60">Track your orders and leave reviews on delivered products</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[2rem] border border-white/70 bg-white p-12 text-center shadow-soft">
          <p className="text-cocoa/60 mb-4">No orders yet</p>
          <p className="text-cocoa/40 text-sm">Once you place your first order, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[1.5rem] border border-white/70 bg-white shadow-soft overflow-hidden">
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-cream/50 transition"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-4 mb-2">
                    <div>
                      <p className="font-medium text-cocoa">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-cocoa/60">
                        {new Date(order.created_at).toLocaleDateString()} · ₹{order.total}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  <p className="text-sm text-cocoa/70">{order.items.length} item(s)</p>
                </div>
                <ChevronRight
                  size={20}
                  className={`text-cocoa/60 transition transform ${
                    expandedOrder === order.id ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-cocoa/10 p-6 space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-cocoa/5 last:border-0 last:pb-0">
                      <img
                        src={item.image}
                        alt={item.product_title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-cocoa">{item.product_title}</p>
                        <p className="text-sm text-cocoa/60 mb-1">
                          {item.silhouette} · {item.print_name}
                        </p>
                        <p className="text-sm text-cocoa/60">
                          Size: {item.size} · Qty: {item.quantity}
                        </p>
                        <p className="font-medium text-cocoa mt-2">₹{item.price * item.quantity}</p>
                      </div>

                      {/* Review Button */}
                      {order.status === "delivered" && (
                        <button
                          onClick={() =>
                            setReviewingItem({
                              orderId: order.id,
                              productId: item.product_id,
                              productTitle: item.product_title
                            })
                          }
                          className="px-4 py-2 bg-cocoa/10 text-cocoa rounded-full text-sm font-medium hover:bg-cocoa/20 transition whitespace-nowrap"
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Order Summary */}
                  <div className="bg-cream p-4 rounded-lg mt-4">
                    <div className="flex justify-between text-sm text-cocoa mb-2">
                      <span>Subtotal</span>
                      <span>₹{order.total}</span>
                    </div>
                    <div className="flex justify-between font-medium text-cocoa">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingItem && (
        <ReviewForm
          productId={reviewingItem.productId}
          orderId={reviewingItem.orderId}
          productTitle={reviewingItem.productTitle}
          onSubmit={handleReviewSubmit}
          onClose={() => setReviewingItem(null)}
        />
      )}
    </div>
  );
}
