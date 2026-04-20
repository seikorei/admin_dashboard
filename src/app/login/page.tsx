"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        // Store user in session
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("userToken", data.token);
        }
        // Notify same-tab listeners (navbar, etc.)
        window.dispatchEvent(new Event("userChanged"));
        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/account");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-16 flex items-center justify-center">
      <div className="bg-white max-w-md w-full mx-auto p-8 rounded-2xl shadow-xl border border-zinc-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-zinc-500 mt-2">Sign in to your NovaMart account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Email Address</label>
            <input 
              required
              type="email" 
              placeholder="you@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded focus:ring-blue-500 text-blue-600" />
              <span className="text-sm text-zinc-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</Link>
          </div>
          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <p className="text-center text-sm text-zinc-500 mt-8">
          Don't have an account? <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
