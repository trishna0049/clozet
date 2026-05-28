"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ChevronDown } from "lucide-react";

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

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "India", "Other"];
const STATES_US = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

export default function EditProfilePage() {
  const [user, setUser] = useState<any>({
    id: "",
    full_name: "",
    email: "",
    phone: ""
  });
  const [address, setAddress] = useState<AddressData>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    label: "Home",
    phone: "",
    receiverName: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || "User",
          email: authUser.email || "",
          phone: authUser.user_metadata?.phone || ""
        });

        // Load saved address if exists, merging with defaults
        if (authUser.user_metadata?.address) {
          setAddress((prev) => ({
            ...prev,
            ...authUser.user_metadata.address
          }));
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [supabase, router]);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: user.phone,
          address: address
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/account");
        }, 1500);
      }
    } catch (err) {
      setError("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const inputFieldClass =
    "w-full px-4 py-3 bg-cream border border-cocoa/20 rounded-lg text-cocoa placeholder-cocoa/50 focus:outline-none focus:border-cocoa/60 focus:ring-1 focus:ring-cocoa/20 transition";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 pb-8">
      {/* Back Link */}
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-cocoa hover:text-cocoa/70 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Account
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display text-4xl text-cocoa mb-2">Edit Profile</h1>
        <p className="text-cocoa/70">Update your address information</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">✓ Address saved successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Account Info Section */}
      <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium mb-6">Account Information</p>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-cocoa/60 uppercase tracking-[0.2em]">Full Name</p>
            <p className="text-cocoa font-medium">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-cocoa/60 uppercase tracking-[0.2em]">Email</p>
            <p className="text-cocoa font-medium">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Address Form */}
      <form onSubmit={handleSave} className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft space-y-6" suppressHydrationWarning>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium mb-6">Shipping Address</p>

          {/* Label */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">Address Label</label>
            <input
              type="text"
              name="label"
              value={address.label}
              onChange={handleAddressChange}
              placeholder="e.g., Home, Office"
              className={inputFieldClass}
              required
            />
          </div>

          {/* Receiver's Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">Receiver's Name</label>
            <input
              type="text"
              name="receiverName"
              value={address.receiverName}
              onChange={handleAddressChange}
              placeholder="Full name of recipient"
              className={inputFieldClass}
              required
            />
          </div>

          {/* Street */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">Street Address</label>
            <input
              type="text"
              name="street"
              value={address.street}
              onChange={handleAddressChange}
              placeholder="123 Main Street"
              className={inputFieldClass}
              required
            />
          </div>

          {/* City */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">City</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleAddressChange}
              placeholder="New York"
              className={inputFieldClass}
              required
            />
          </div>

          {/* Country */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">Country</label>
            <div className="relative">
              <select
                name="country"
                value={address.country}
                onChange={handleAddressChange}
                className={`${inputFieldClass} appearance-none pr-10`}
                required
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cocoa/60 pointer-events-none" />
            </div>
          </div>

          {/* State / Province */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">
              {address.country === "United States" ? "State" : "State / Province"}
            </label>
            {address.country === "United States" ? (
              <div className="relative">
                <select
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  className={`${inputFieldClass} appearance-none pr-10`}
                  required
                >
                  <option value="">Select a state</option>
                  {STATES_US.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cocoa/60 pointer-events-none" />
              </div>
            ) : (
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder="Province"
                className={inputFieldClass}
                required
              />
            )}
          </div>

          {/* Zip / Postal Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">
              {address.country === "United States" ? "ZIP Code" : "Postal Code"}
            </label>
            <input
              type="text"
              name="zipCode"
              value={address.zipCode}
              onChange={handleAddressChange}
              placeholder={address.country === "United States" ? "10001" : "A1A 1A1"}
              className={inputFieldClass}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-cocoa mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={address.phone}
              onChange={handleAddressChange}
              placeholder="10-digit phone number"
              className={inputFieldClass}
              required
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-cocoa text-cream rounded-lg font-medium hover:bg-cocoa/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
