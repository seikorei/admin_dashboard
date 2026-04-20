"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Package, AlertCircle } from "lucide-react";

/* =======================
   Types
======================= */
type Order = {
  id: string;
  dbId: number;
  customer: string;
  date: string;
  status: string;
  amount: string;
};

type Product = {
  id: number;
  stock: number;
  status: string;
};

type Stat = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "warning";
  icon: any;
  color: string;
  bg: string;
};

/* =======================
   Main Dashboard
======================= */
export default function DashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    // Fetch orders and products in parallel for real stats
    Promise.all([
      fetch("/api/orders").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ])
      .then(([ordersData, productsData]) => {
        const orders: Order[] = Array.isArray(ordersData) ? ordersData : [];
        const products: Product[] = Array.isArray(productsData) ? productsData : [];

        const totalSales = orders.reduce(
          (sum, o) => sum + (parseFloat(String(o.amount).replace(/[^0-9.]/g, "")) || 0),
          0
        );
        const totalOrders = orders.length;
        const totalCustomers = new Set(orders.map((o) => o.customer)).size;
        const lowStockCount = products.filter(
          (p) => Number(p.stock) > 0 && Number(p.stock) < 15
        ).length;
        const outOfStockCount = products.filter((p) => Number(p.stock) === 0).length;
        const alertCount = lowStockCount + outOfStockCount;

        const newStats: Stat[] = [
          {
            label: "Total Sales",
            value: `RM ${totalSales.toFixed(2)}`,
            change: `${totalOrders} orders`,
            trend: "up",
            icon: TrendingUp,
            color: "text-[#22c55e]",
            bg: "bg-[#22c55e]/10",
          },
          {
            label: "Total Orders",
            value: totalOrders.toString(),
            change: totalOrders > 0 ? "Live" : "No orders",
            trend: "up",
            icon: Package,
            color: "text-[#3b82f6]",
            bg: "bg-[#3b82f6]/10",
          },
          {
            label: "Active Customers",
            value: totalCustomers.toString(),
            change: totalCustomers > 0 ? "Unique" : "None yet",
            trend: "up",
            icon: Users,
            color: "text-[#8b5cf6]",
            bg: "bg-[#8b5cf6]/10",
          },
          {
            label: "Stock Alerts",
            value: alertCount.toString(),
            change: lowStockCount > 0 ? `${lowStockCount} low` : "All OK",
            trend: alertCount > 0 ? "warning" : "up",
            icon: AlertCircle,
            color: "text-[#ef4444]",
            bg: "bg-[#ef4444]/10",
          },
        ];

        setStats(newStats);
      })
      .catch(err => console.error("Dashboard stats error:", err));
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-zinc-400">
          Real-time data from your database 🚀
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border p-4 bg-white dark:bg-[#0f172a]"
            >
              <div className="flex justify-between mb-3">
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs">{stat.change}</span>
              </div>

              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Orders */}
      <OrdersPreview />
    </div>
  );
}

/* =======================
   Orders Preview（带删除🔥）
======================= */
function OrdersPreview() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        const fetched: Order[] = Array.isArray(data) ? data : [];
        setOrders(fetched.slice(0, 5));
      })
      .catch(err => console.error("Orders preview error:", err));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="rounded-xl border p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">Recent Orders</h2>
        <a href="/admin/orders" className="text-blue-500 text-sm underline">
          View All →
        </a>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 pr-4">Order ID</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-zinc-400 text-xs">No orders yet.</td>
            </tr>
          ) : orders.map((o) => (
            // Use dbId (numeric PK) as the React key — always unique
            <tr key={o.dbId} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <td className="py-2 pr-4 font-mono text-blue-500">{o.id}</td>
              <td className="py-2 pr-4">{o.customer || "—"}</td>
              <td className="py-2 pr-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  o.status === "Paid" || o.status === "Shipped" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" :
                  o.status === "Cancelled" ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400" :
                  "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                }`}>{o.status}</span>
              </td>
              <td className="py-2 pr-4 font-bold">{o.amount}</td>
              <td className="py-2">
                <button
                  onClick={async () => {
                    if (!confirm(`Delete order ${o.id}?`)) return;
                    await fetch(`/api/orders/${o.dbId}`, { method: "DELETE" });
                    loadOrders();
                  }}
                  className="text-red-500 hover:text-red-700 hover:underline text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}