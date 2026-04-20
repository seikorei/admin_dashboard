"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear status when user starts typing again
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        // Reset form fields
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">Get in Touch</h1>
          <p className="text-lg text-zinc-500">We'd love to hear from you. Please fill out this form or reach out directly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* ── Contact Info ─────────────────────────────── */}
          <div className="space-y-8 pl-0 md:pl-10">
            <h3 className="text-2xl font-bold text-zinc-900">Contact Information</h3>
            <div className="flex items-center gap-4 text-zinc-600">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <p>123 Commerce Avenue<br />San Francisco, CA 94103</p>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <p>support@novamart.com</p>
            </div>
          </div>

          {/* ── Contact Form ──────────────────────────────── */}
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">

            {/* Success Banner */}
            {status === "success" && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-pulse-once">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Message sent successfully!</p>
                  <p className="text-xs text-green-600 mt-0.5">We'll get back to you as soon as possible.</p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {status === "error" && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Failed to send message</p>
                  <p className="text-xs text-red-600 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  id="contact-name"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  id="contact-email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  name="message"
                  id="contact-message"
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                id="contact-submit-btn"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  : <><Send className="w-4 h-4" /> Send Message</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
