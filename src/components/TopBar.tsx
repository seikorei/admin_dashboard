"use client";

import React, { useEffect, useState } from "react";
import { Bell, Search, Package } from "lucide-react";
import { getAdminUser } from "@/lib/adminAuth";
import Link from "next/link";

export default function TopBar() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    // Load admin identity
    const user = getAdminUser();
    if (user) setAdmin(user);

    // Fetch low-stock products count from DB
    fetch("/api/products")
      .then(r => r.json())
      .then((products: any[]) => {
        if (!Array.isArray(products)) return;
        const count = products.filter(p => Number(p.stock) > 0 && Number(p.stock) < 15).length
                    + products.filter(p => Number(p.stock) === 0).length;
        setLowStockCount(count);
      })
      .catch(console.error);
  }, []);

  // Initials from name
  const initials = admin?.name
    ? admin.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-zinc-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-sm shrink-0 relative">
      {/* Global search */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 dark:text-slate-400" />
        <input
          type="text"
          placeholder="Quick search…"
          spellCheck={false}
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-slate-800 rounded-lg
            text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400
            focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Low-stock alert bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-zinc-500 dark:text-slate-400
              hover:bg-zinc-100 dark:hover:bg-slate-800 hover:text-zinc-900 dark:hover:text-slate-200 transition-all"
            title={lowStockCount > 0 ? `${lowStockCount} stock alert(s)` : "No alerts"}
          >
            <Bell className="h-[18px] w-[18px]" />
            {lowStockCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center px-1 ring-2 ring-white dark:ring-[#020617]">
                {lowStockCount > 9 ? "9+" : lowStockCount}
              </span>
            )}
          </button>

          {/* Alert dropdown */}
          {showAlerts && (
            <div className="absolute right-0 top-12 w-72 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#1e293b] rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-[#1e293b]">
                <p className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">Stock Alerts</p>
              </div>
              {lowStockCount === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-zinc-400 dark:text-slate-500">All products well-stocked ✓</p>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/50">
                      <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {lowStockCount} product{lowStockCount !== 1 ? "s" : ""} need restocking
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-slate-500">View inventory for details</p>
                    </div>
                  </div>
                  <Link
                    href="/inventory"
                    onClick={() => setShowAlerts(false)}
                    className="block mt-2 w-full text-center py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                  >
                    Go to Inventory →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Click-outside to close dropdown */}
        {showAlerts && (
          <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
        )}

        {/* Admin avatar */}
        <div
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white tracking-wide select-none cursor-default"
          title={admin?.name || "Admin"}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
