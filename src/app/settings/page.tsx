"use client";

import React, { useState, useEffect } from "react";
import {
  User, Mail, Phone, Lock, Store, MapPin, Bell,
  Smartphone, Moon, Sun, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { getAdminToken, getAdminUser } from "@/lib/adminAuth";

/* ─── Toggle Switch ─────────────────────────────────── */
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? "bg-blue-600" : "bg-zinc-700 dark:bg-[#1e293b]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ─── Input Group ────────────────────────────────────── */
function InputGroup({
  label, type = "text", value, icon: Icon, onChange, placeholder = "",
}: {
  label: string; type?: string; value: string; icon?: any;
  onChange?: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          spellCheck={false}
          className={`w-full py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] rounded-xl text-sm text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

/* ─── Settings Section ───────────────────────────────── */
function SettingsSection({
  title, description, children, onSave,
}: {
  title: string; description: string; children: React.ReactNode; onSave?: () => Promise<void> | void;
}) {
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setError("");
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#1e293b] bg-white/50 dark:bg-[#0f172a] backdrop-blur-sm overflow-hidden shadow-custom transition-colors duration-300">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
          </div>
          {onSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${
                saved
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
              }`}
            >
              {saved ? (
                <><CheckCircle2 className="h-4 w-4" /> Saved</>
              ) : saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                "Save Changes"
              )}
            </button>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ─── Main Settings Page ─────────────────────────────── */
export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  // Admin Profile (from admins table via /api/admin/me)
  const [profile, setProfile] = useState({
    name: "", email: "", newPassword: "", confirmPassword: "",
  });
  const [profileError, setProfileError] = useState("");

  // Store Settings (from settings table)
  const [store, setStore] = useState({
    store_name: "", store_email: "", store_phone: "", store_address: "",
  });

  // Notification toggles (from settings table)
  const [notif, setNotif] = useState({
    notif_low_stock: true, notif_new_order: true, notif_delivery: false,
    notif_email: true, notif_sms: false, notif_system: true,
  });

  const [pageLoading, setPageLoading] = useState(true);

  // ── Load everything on mount ──────────────────────────
  useEffect(() => {
    const token = getAdminToken();
    const user  = getAdminUser();

    // Pre-fill profile from localStorage (instant, no flicker)
    if (user) {
      setProfile(p => ({ ...p, name: user.name || "", email: user.email || "" }));
    }

    // Fetch fresh admin profile
    if (token) {
      fetch(`/api/admin/me?token=${token}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.admin) {
            setProfile(p => ({ ...p, name: data.admin.name || "", email: data.admin.email || "" }));
          }
        })
        .catch(console.error);
    }

    // Fetch store settings + notification prefs
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setStore({
            store_name:    data.store_name    || "",
            store_email:   data.store_email   || "",
            store_phone:   data.store_phone   || "",
            store_address: data.store_address || "",
          });
          setNotif({
            notif_low_stock: Boolean(data.notif_low_stock),
            notif_new_order: Boolean(data.notif_new_order),
            notif_delivery:  Boolean(data.notif_delivery),
            notif_email:     Boolean(data.notif_email),
            notif_sms:       Boolean(data.notif_sms),
            notif_system:    Boolean(data.notif_system),
          });
        }
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, []);

  // ── Save admin profile ────────────────────────────────
  const saveProfile = async () => {
    setProfileError("");
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      setProfileError("Passwords do not match.");
      throw new Error("Passwords do not match.");
    }
    if (profile.newPassword && profile.newPassword.length < 6) {
      setProfileError("Password must be at least 6 characters.");
      throw new Error("Password too short.");
    }
    const token = getAdminToken();
    const res = await fetch(`/api/admin/me?token=${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        newPassword: profile.newPassword || undefined,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Save failed.");
    // Update localStorage
    const user = getAdminUser();
    if (user) {
      localStorage.setItem("adminUser", JSON.stringify({ ...user, name: profile.name, email: profile.email }));
    }
    setProfile(p => ({ ...p, newPassword: "", confirmPassword: "" }));
  };

  // ── Save store settings ───────────────────────────────
  const saveStore = async () => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...store, ...notif }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Save failed.");
  };

  // ── Save notification prefs ────────────────────────────
  const saveNotifications = async () => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...store, ...notif }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Save failed.");
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white transition-colors duration-300">
          System Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your profile, store details, notifications, and appearance.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Admin Profile */}
        <SettingsSection
          title="Admin Profile"
          description="Update your administrator name, email, and password."
          onSave={saveProfile}
        >
          {profileError && (
            <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" /> {profileError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              label="Full Name" value={profile.name} icon={User} placeholder="Administrator"
              onChange={(v) => setProfile(p => ({ ...p, name: v }))}
            />
            <InputGroup
              label="Email Address" type="email" value={profile.email} icon={Mail}
              placeholder="admin@novamart.com"
              onChange={(v) => setProfile(p => ({ ...p, email: v }))}
            />
            <InputGroup
              label="New Password (leave blank to keep current)"
              type="password" value={profile.newPassword} icon={Lock}
              placeholder="Min. 6 characters"
              onChange={(v) => setProfile(p => ({ ...p, newPassword: v }))}
            />
            <InputGroup
              label="Confirm New Password"
              type="password" value={profile.confirmPassword} icon={Lock}
              placeholder="Re-enter password"
              onChange={(v) => setProfile(p => ({ ...p, confirmPassword: v }))}
            />
          </div>
        </SettingsSection>

        {/* 2. Store Settings */}
        <SettingsSection
          title="Store Settings"
          description="Update your store's public contact information and branding."
          onSave={saveStore}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              label="Store Name" value={store.store_name} icon={Store}
              placeholder="NovaMart"
              onChange={(v) => setStore(s => ({ ...s, store_name: v }))}
            />
            <InputGroup
              label="Support Email" type="email" value={store.store_email} icon={Mail}
              placeholder="contact@novamart.com"
              onChange={(v) => setStore(s => ({ ...s, store_email: v }))}
            />
            <InputGroup
              label="Support Phone" value={store.store_phone} icon={Phone}
              placeholder="+60 12-345 6789"
              onChange={(v) => setStore(s => ({ ...s, store_phone: v }))}
            />
            <InputGroup
              label="Store Address" value={store.store_address} icon={MapPin}
              placeholder="123 Commerce Blvd, Kuala Lumpur"
              onChange={(v) => setStore(s => ({ ...s, store_address: v }))}
            />
          </div>
        </SettingsSection>

        {/* 3 & 4. Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SettingsSection
            title="Notification Settings"
            description="Choose which alerts you receive on the dashboard."
            onSave={saveNotifications}
          >
            <div className="space-y-5">
              {[
                { key: "notif_low_stock", label: "Low Stock Alerts", desc: "Get notified when product stock falls below 15." },
                { key: "notif_new_order", label: "New Orders",       desc: "Receive immediate alerts for new customer orders." },
                { key: "notif_delivery",  label: "Delivery Updates", desc: "Alerts when a shipment status changes to Delivered." },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{label}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                  </div>
                  <ToggleSwitch
                    enabled={notif[key as keyof typeof notif]}
                    onChange={(v) => setNotif(n => ({ ...n, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            title="Communication Preferences"
            description="How the system delivers critical messages to you."
            onSave={saveNotifications}
          >
            <div className="space-y-5">
              {[
                { key: "notif_email",  icon: Mail,       label: "Email Notifications",   desc: `Send alerts to ${store.store_email || "—"}.` },
                { key: "notif_sms",    icon: Smartphone,  label: "SMS Notifications",     desc: `Send text messages to ${store.store_phone || "—"}.` },
                { key: "notif_system", icon: Bell,        label: "System Push Alerts",    desc: "Show in-app dashboard popup notifications." },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-[#1e293b]">
                      <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{label}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={notif[key as keyof typeof notif]}
                    onChange={(v) => setNotif(n => ({ ...n, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </SettingsSection>
        </div>

        {/* 5. Appearance */}
        <SettingsSection
          title="Appearance Settings"
          description="Customize how the dashboard looks and feels."
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={`flex-1 w-full flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-blue-500 bg-blue-50/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "border-zinc-200 dark:border-[#1e293b] hover:border-zinc-300 dark:hover:border-slate-700 hover:bg-zinc-50 dark:hover:bg-[#1e293b]"
              }`}
            >
              <Sun className={`h-8 w-8 mb-3 ${theme === "light" ? "text-blue-600" : "text-zinc-400"}`} />
              <span className={`text-sm font-bold ${theme === "light" ? "text-blue-700 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`}>
                Light Mode
              </span>
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`flex-1 w-full flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "border-zinc-200 dark:border-[#1e293b] hover:border-zinc-300 dark:hover:border-slate-700 hover:bg-zinc-50 dark:hover:bg-[#1e293b]"
              }`}
            >
              <Moon className={`h-8 w-8 mb-3 ${theme === "dark" ? "text-blue-500" : "text-zinc-400"}`} />
              <span className={`text-sm font-bold ${theme === "dark" ? "text-blue-400" : "text-zinc-500 dark:text-zinc-400"}`}>
                Dark Mode
              </span>
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
