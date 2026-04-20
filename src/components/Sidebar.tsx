"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Truck, Package,
  Settings, Settings2, LogOut, User, Mail
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { getAdminUser, adminLogout } from "@/lib/adminAuth";

const menuItems = [
  { name: "Dashboard",      icon: LayoutDashboard, href: "/admin/dashboard" },
  { name: "Sales Order",    icon: ShoppingCart,    href: "/admin/orders"      },
  { name: "Delivery Order", icon: Truck,           href: "/delivery"        },
  { name: "Inventory",      icon: Package,         href: "/inventory"       },
  { name: "Messages",       icon: Mail,            href: "/admin/messages"  },
  { name: "Settings",       icon: Settings,        href: "/settings"        },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const user = getAdminUser();
    if (user) setAdmin(user);
  }, []);

  return (
    <div
      className={`flex h-screen flex-col border-r border-slate-800 bg-[#020617] text-slate-200
        transition-all duration-300 ease-in-out shrink-0
        ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* ── Logo / toggle button ─────────────────────────── */}
      <button
        onClick={toggle}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`flex items-center gap-3 border-b border-slate-800 py-4 w-full
          hover:bg-[#0f172a] transition-colors duration-150 focus:outline-none
          ${isCollapsed ? "justify-center px-0" : "px-4"}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
          bg-[#0f172a] border border-slate-800 shadow-sm">
          <Settings2 className="h-5 w-5 text-slate-200" />
        </div>
        {!isCollapsed && (
          <span className="text-sm font-bold text-slate-200 tracking-wide whitespace-nowrap overflow-hidden">
            AdminPanel
          </span>
        )}
      </button>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-2 scrollbar-hide">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === "/admin/dashboard" || pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${isActive
                      ? "bg-[#3b82f6] text-white shadow-md font-bold"
                      : "text-slate-400 hover:bg-[#0f172a] hover:text-slate-200"}
                    ${isCollapsed ? "justify-center" : ""}`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Admin info + logout (Pinned to bottom) ───────── */}
      <div className="mt-auto border-t border-slate-800/60 bg-[#020617] px-2 py-4 space-y-1.5 shrink-0">
        {/* Admin profile row */}
        {!isCollapsed && admin && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/40 shadow-sm mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-100 leading-tight truncate uppercase tracking-tighter">{admin.name}</p>
              <p className="text-[10px] text-slate-500 truncate font-medium">{admin.email}</p>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={adminLogout}
          title="Logout"
          className={`group flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-bold
            text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200
            ${isCollapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span>Logout Account</span>}
        </button>
      </div>
    </div>
  );
}
