"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhone, setIsPhone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) setError(error.message);
    } catch (err) {
      setError("Failed to sign in with Google");
    }
  };



  const inputFieldClass =
    "w-full px-4 py-3 bg-cream border border-cocoa/20 rounded-lg text-cocoa placeholder-cocoa/50 focus:outline-none focus:border-cocoa/60 focus:ring-1 focus:ring-cocoa/20 transition";

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-start justify-center pt-4 pb-4 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-display text-3xl text-cocoa mb-1">Welcome Back</h1>
          <p className="text-cocoa/70">Sign in to your account to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
          {/* Email / Phone Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-cream border border-cocoa/10 rounded-lg">
            <button
              type="button"
              onClick={() => setIsPhone(false)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                !isPhone ? "bg-cocoa text-cream" : "text-cocoa/70"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setIsPhone(true)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                isPhone ? "bg-cocoa text-cream" : "text-cocoa/70"
              }`}
            >
              Phone
            </button>
          </div>

          {/* Email / Phone Input */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-2">
              {isPhone ? "Phone Number" : "Email Address"}
            </label>
            <input
              type={isPhone ? "tel" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isPhone ? "+1 (555) 123-4567" : "you@example.com"}
              className={inputFieldClass}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-cocoa mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputFieldClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa/60 hover:text-cocoa transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-cocoa hover:text-cocoa/70 font-medium">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cocoa text-cream rounded-lg font-medium hover:bg-cocoa/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-cocoa/10"></div>
          <span className="text-sm text-cocoa/60">or continue with</span>
          <div className="flex-1 h-px bg-cocoa/10"></div>
        </div>

        {/* Social Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 border border-cocoa/20 rounded-lg hover:bg-cream/50 transition flex items-center justify-center gap-2 font-medium text-cocoa"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-cocoa/70">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-cocoa hover:text-cocoa/70">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
