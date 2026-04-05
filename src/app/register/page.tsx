"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/login");
      } else {
        setError(data.error || "Registration failed");
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
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-zinc-500 mt-2">Join NovaMart today</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
          </div>
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
          <button 
            disabled={loading}
            type="submit" 
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        
        <p className="text-center text-sm text-zinc-500 mt-8">
          Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
