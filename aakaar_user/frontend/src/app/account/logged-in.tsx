"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, CheckCircle2, Edit2 } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
}

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  label: string;
  phone: string;
  receiverName: string;
}

export default function LoggedInAccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        router.push("/login");
        return;
      }

      // Get user profile
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || "User",
          email: authUser.email || "",
          avatar_url: authUser.user_metadata?.avatar_url,
          phone: authUser.user_metadata?.phone
        });
        
        // Load address if it exists
        if (authUser.user_metadata?.address) {
          setAddress(authUser.user_metadata.address);
        }
        
        setShowNotification(true);
      }

      // TODO: Fetch user's actual orders and addresses from database
      // For now, they'll be empty
      setOrders([]);
      setAddresses([]);
      setLoading(false);
    };

    checkAuth();

    // Auto-hide notification after 4 seconds
    const timer = setTimeout(() => setShowNotification(false), 4000);
    return () => clearTimeout(timer);
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const initials = user?.full_name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="space-y-8 pb-8">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg max-w-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">✓ You are now logged in</p>
              <p className="text-xs text-green-700">Welcome back, {user?.full_name}!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-cocoa">My Account</h1>
          <p className="text-cocoa/70 mt-2">Welcome, {user?.full_name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-cocoa/10 text-cocoa rounded-full hover:bg-cocoa/20 transition font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Profile Avatar */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cocoa to-cocoa/80 flex items-center justify-center text-white font-display text-2xl shadow-md">
        {initials}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium">Recent Orders</p>
            <Link 
              href="/account/my-orders"
              className="text-sm text-cocoa hover:text-cocoa/70 font-medium flex items-center gap-1"
            >
              View All →
            </Link>
          </div>
          <div className="mt-6">
            <div className="text-center py-8">
              <p className="text-cocoa/50 text-sm mb-3">Manage all your orders and reviews</p>
              <Link
                href="/account/my-orders"
                className="inline-block px-4 py-2 bg-cocoa text-cream rounded-full text-sm font-medium hover:bg-cocoa/90 transition"
              >
                Go to My Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium">Shipping Address</p>
            <Link href="/account/edit-profile" className="flex items-center gap-1 text-sm text-cocoa hover:text-cocoa/70 font-medium">
              <Edit2 size={16} />
              Edit
            </Link>
          </div>
          <div className="mt-6">
            {address ? (
              <div className="rounded-[1.4rem] bg-cream p-4 text-sm text-cocoa/72">
                <p className="font-medium text-cocoa mb-2">{address.label}</p>
                <p className="font-medium text-cocoa">{address.receiverName}</p>
                <p>{address.phone}</p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p className="text-xs text-cocoa/60 mt-2">{address.country}</p>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-cocoa/10 rounded-lg">
                <p className="text-cocoa/50 text-sm mb-3">No address added yet</p>
                <Link href="/account/edit-profile" className="inline-block px-4 py-2 bg-cocoa text-cream rounded-full text-sm font-medium hover:bg-cocoa/90 transition">
                  Add Address
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium">Account Information</p>
          <Link href="/account/edit-profile" className="flex items-center gap-1 text-sm text-cocoa hover:text-cocoa/70 font-medium">
            <Edit2 size={16} />
            Edit
          </Link>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-cocoa/60 uppercase tracking-[0.2em]">Full Name</p>
            <p className="text-cocoa font-medium">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-cocoa/60 uppercase tracking-[0.2em]">Email</p>
            <p className="text-cocoa font-medium">{user?.email}</p>
          </div>
          {user?.phone && (
            <div>
              <p className="text-xs text-cocoa/60 uppercase tracking-[0.2em]">Phone</p>
              <p className="text-cocoa font-medium">{user.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
