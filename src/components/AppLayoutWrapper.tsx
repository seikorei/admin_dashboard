"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import StoreNavbar from "./StoreNavbar";
import { CartProvider } from "@/context/CartContext";

// Routes that use the store (customer-facing) layout
const STORE_ROUTES = ["/home", "/shop", "/cart", "/checkout", "/login", "/register", "/about", "/contact", "/account", "/forgot-password"];

// Admin routes that DON'T need auth protection (the login page itself)
const ADMIN_PUBLIC = ["/admin/login"];

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const isStore      = STORE_ROUTES.some(r => pathname?.startsWith(r));
  const isAdminLogin = ADMIN_PUBLIC.some(r => pathname?.startsWith(r));
  // All other routes are admin routes (dashboard, sales, delivery, inventory, settings, /)
  const isAdminRoute = !isStore && !isAdminLogin;

  useEffect(() => {
    if (isAdminRoute) {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.replace("/admin/login");
        return;
      }
    }
    setAuthChecked(true);
  }, [pathname, isAdminRoute, router]);

  // ── Store / customer layout ─────────────────────────────
  if (isStore) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans transition-colors duration-300 overflow-y-auto">
          <StoreNavbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </CartProvider>
    );
  }

  // ── Admin login page (no sidebar/topbar) ────────────────
  if (isAdminLogin) {
    return <>{children}</>;
  }

  // ── Protected admin layout (sidebar + topbar) ───────────
  if (!authChecked) {
    // Render nothing while we check auth (avoids flash of unprotected content)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-[#020617] transition-colors duration-300">
      {/* Sidebar is fixed on the left (it handles its own width/expand state inside) */}
      <Sidebar />
      
      {/* Main content area takes remaining space and scrolls independently */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
