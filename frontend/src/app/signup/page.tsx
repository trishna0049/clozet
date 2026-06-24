"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  usePhone: boolean;
  includeAddress: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    usePhone: false,
    includeAddress: false,
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email && !formData.phone) {
      setError("Email or phone number is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.includeAddress) {
      if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
        setError("Please fill in all address fields");
        return false;
      }
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email || `${formData.phone}@phone.clozet.local`,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.includeAddress
              ? {
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  zip_code: formData.zipCode,
                  country: formData.country
                }
              : null
          }
        }
      });

      if (signupError) {
        setError(signupError.message);
      } else if (data.user) {
        router.push("/login?message=Check your email for verification");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputFieldClass =
    "w-full px-4 py-3 bg-cream border border-cocoa/20 rounded-lg text-cocoa placeholder-cocoa/50 focus:outline-none focus:border-cocoa/60 focus:ring-1 focus:ring-cocoa/20 transition";

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cocoa mb-2">Create Your Account</h1>
          <p className="text-cocoa/70">Join us and start your style journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6" suppressHydrationWarning>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className={inputFieldClass}
              required
            />
          </div>

          {/* Contact Info Selection */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-3">Contact Information</label>
            <div className="flex gap-2 mb-3 p-1 bg-cream border border-cocoa/10 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, usePhone: false }))}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                  !formData.usePhone ? "bg-cocoa text-cream" : "text-cocoa/70"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, usePhone: true }))}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                  formData.usePhone ? "bg-cocoa text-cream" : "text-cocoa/70"
                }`}
              >
                Phone
              </button>
            </div>

            <input
              type={formData.usePhone ? "tel" : "email"}
              name={formData.usePhone ? "phone" : "email"}
              value={formData.usePhone ? formData.phone : formData.email}
              onChange={handleInputChange}
              placeholder={formData.usePhone ? "+1 (555) 123-4567" : "you@example.com"}
              className={inputFieldClass}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={inputFieldClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa/60 hover:text-cocoa transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-cocoa/60 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={inputFieldClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa/60 hover:text-cocoa transition"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Address Information */}
          <div className="border border-cocoa/10 rounded-lg p-4 bg-cream/30">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="includeAddress"
                checked={formData.includeAddress}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-cocoa/20 text-cocoa"
              />
              <span className="text-sm font-medium text-cocoa">Add address now (optional)</span>
            </label>
            <p className="text-xs text-cocoa/60 mt-2">You can add or update your address anytime after signing up in your account settings.</p>

            {formData.includeAddress && (
              <div className="mt-4 space-y-3">
                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-cocoa mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    className={inputFieldClass}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-cocoa mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className={inputFieldClass}
                  />
                </div>

                {/* State / Province */}
                <div>
                  <label className="block text-sm font-medium text-cocoa mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State or Province"
                    className={inputFieldClass}
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-cocoa mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    className={inputFieldClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cocoa text-cream rounded-lg font-medium hover:bg-cocoa/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="mt-8 text-center text-cocoa/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cocoa hover:text-cocoa/70">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
