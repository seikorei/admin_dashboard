"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center font-sans px-4">
        <div className="bg-white max-w-md w-full mx-auto p-12 rounded-2xl shadow-xl border border-zinc-200 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-3">
            Password Reset!
          </h1>
          <p className="text-zinc-500 mb-2 leading-relaxed text-sm">
            Your password has been successfully updated for:
          </p>
          <p className="font-bold text-zinc-800 mb-8 text-sm bg-zinc-100 px-4 py-2 rounded-lg inline-block">
            {email}
          </p>
          <div className="mt-2">
            <Link
              href="/login"
              className="w-full block py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 text-center text-sm active:scale-95"
            >
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ────────────────────────────────────────────
  return (
    <div className="bg-zinc-50 min-h-screen flex items-center justify-center font-sans px-4">
      <div className="bg-white max-w-md w-full mx-auto p-8 rounded-2xl shadow-xl border border-zinc-200">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
            Enter your account email and choose a new password below.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
            <span className="font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email Field */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                required
                type="email"
                id="reset-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                required
                type={showPassword ? "text" : "password"}
                id="reset-new-password"
                placeholder="Min. 6 characters"
                value={newPassword}
                minLength={6}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5">Must be at least 6 characters long.</p>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            id="reset-password-btn"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          Remember your password?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
