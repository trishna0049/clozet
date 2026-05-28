"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
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
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-cocoa hover:text-cocoa/70 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cocoa mb-2">Reset Password</h1>
          <p className="text-cocoa/70">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              Check your email for a password reset link. It may take a few minutes to arrive.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleResetPassword} className="space-y-5" suppressHydrationWarning>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-cocoa mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputFieldClass}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cocoa text-cream rounded-lg font-medium hover:bg-cocoa/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-cocoa/70 mb-6">
              If an account exists with this email, you will receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="inline-block py-3 px-6 bg-cocoa text-cream rounded-lg font-medium hover:bg-cocoa/90 transition"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
