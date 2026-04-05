"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Truck, Search, Filter, Package, CheckCircle2,
  Clock, AlertCircle, MapPin, ChevronDown, Loader2, X, Trash2,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────── */
type DeliveryStatus = "Processing" | "Shipped" | "In Transit" | "Delivered";

const DELIVERY_STATUSES: DeliveryStatus[] = ["Processing", "Shipped", "In Transit", "Delivered"];
const FILTER_STATUSES = ["All", ...DELIVERY_STATUSES];

interface Delivery {
  id: string;        // display id "#DEL-0001"
  dbId: number;
  orderId: string;   // "#ORD-0001"
  customer: string;
  address: string;
  carrier: string;
  status: string;
  eta: string;
  items: number;
  createdAt: string;
  orderAmount: string;
}

/* ─── Status config ──────────────────────────────────── */
const STATUS_CFG: Record<string, { color: string; bg: string; icon: any }> = {
  "Processing": { color: "text-amber-400",   bg: "bg-amber-950/60",   icon: Clock        },
  "Shipped":    { color: "text-blue-400",    bg: "bg-blue-950/60",    icon: Truck        },
  "In Transit": { color: "text-cyan-400",    bg: "bg-cyan-950/60",    icon: MapPin       },
  "Delivered":  { color: "text-emerald-400", bg: "bg-emerald-950/60", icon: CheckCircle2 },
};

const CARRIERS = ["DHL", "FedEx", "J&T Express", "Pos Laju", "GDex", "Ninja Van"];

/* ─── Main Page ───────────────────────────────────────── */
export default function DeliveryOrderPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ status: "", carrier: "", address: "", eta: "" });
  const [saving, setSaving] = useState(false);

  const fetchDeliveries = useCallback(() => {
    setLoading(true);
    fetch("/api/delivery")
      .then(r  => r.json())
      .then(data => setDeliveries(Array.isArray(data) ? data : []))
      .catch(err => { console.error("Deliveries fetch error:", err); setDeliveries([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const startEdit = (d: Delivery) => {
    setEditId(d.dbId);
    setEditForm({
      status: d.status, carrier: d.carrier, address: d.address || "", eta: d.eta === "TBD" ? "" : d.eta
    });
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setSaving(true);
    await fetch(`/api/delivery/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    setEditId(null);
    fetchDeliveries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this delivery record?")) return;
    const res = await fetch(`/api/delivery/${id}`, { method: "DELETE" });
    console.log(await res.json());
    fetchDeliveries();
  };

  const filtered = deliveries.filter(d => {
    const matchSearch =
      (d.customer || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.id       || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.orderId  || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = [
    { label: "Total Shipments", value: deliveries.length,                                        icon: Package,      color: "text-blue-400",    bg: "bg-blue-950/50"   },
    { label: "Processing",      value: deliveries.filter(d => d.status === "Processing").length,  icon: Clock,        color: "text-amber-400",   bg: "bg-amber-950/50"  },
    { label: "In Transit",      value: deliveries.filter(d => d.status === "In Transit").length,  icon: Truck,        color: "text-cyan-400",    bg: "bg-cyan-950/50"   },
    { label: "Delivered",       value: deliveries.filter(d => d.status === "Delivered").length,   icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-950/50"},
  ];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-slate-200">Delivery Orders</h1>
        <p className="text-sm text-zinc-400 mt-1">Track and manage all outgoing shipments. Deliveries are created automatically when orders are paid.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-[#1e293b] bg-white/50 dark:bg-[#0f172a] p-4">
            <div className={`shrink-0 p-2.5 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{s.label}</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-slate-200 mt-0.5">{loading ? "—" : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input type="text" spellCheck={false} placeholder="Search by ID, order or customer…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#0b1220]/80 border border-zinc-200 dark:border-[#1e293b] rounded-xl text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all" />
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-[#0b1220]/80 border border-zinc-200 dark:border-[#1e293b] rounded-xl text-zinc-900 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/25 cursor-pointer">
            {FILTER_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-[#1e293b] bg-white/50 dark:bg-[#0f172a] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/60 border-b border-zinc-800">
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[15%]">Delivery ID</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[18%]">Customer</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[22%] hidden md:table-cell">Address</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[10%] hidden lg:table-cell">Carrier</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[10%]">ETA</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[13%]">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right w-[12%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-14 text-center">
                  <Loader2 className="h-6 w-6 text-zinc-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Loading deliveries…</p>
                </td></tr>
              ) : filtered.map(d => {
                const cfg  = STATUS_CFG[d.status] ?? { color: "text-zinc-400", bg: "bg-zinc-800/60", icon: AlertCircle };
                const Icon = cfg.icon;
                const isEditing = editId === d.dbId;

                return (
                  <tr key={d.dbId} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-blue-400">{d.id}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{d.orderId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-slate-200">{d.customer}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{d.items} item{d.items !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400 hidden md:table-cell max-w-[180px]">
                      {isEditing ? (
                        <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full px-2 py-1 text-xs bg-black/50 border border-zinc-700 rounded outline-none" placeholder="Address..." />
                      ) : (
                        <p className="truncate">{d.address || <span className="text-zinc-600 italic">No address</span>}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-300 hidden lg:table-cell">
                      {isEditing ? (
                        <select value={editForm.carrier} onChange={e => setEditForm({...editForm, carrier: e.target.value})} className="w-full px-2 py-1 text-xs bg-black/50 border border-zinc-700 rounded outline-none appearance-none">
                          {CARRIERS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      ) : d.carrier}
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {isEditing ? (
                        <input type="date" value={editForm.eta} onChange={e => setEditForm({...editForm, eta: e.target.value})} className="w-full px-2 py-1 text-xs bg-black/50 border border-zinc-700 rounded outline-none" />
                      ) : d.eta}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full px-2 py-1 text-xs bg-black/50 border border-zinc-700 rounded outline-none appearance-none">
                          {DELIVERY_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="h-3 w-3" />{d.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={handleUpdate} disabled={saving} className="px-2 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors disabled:opacity-50">Save</button>
                          <button onClick={() => setEditId(null)} className="px-2 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-bold hover:bg-zinc-800 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => startEdit(d)}
                            title="Update delivery"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-blue-950/60 hover:text-blue-400 transition-colors"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(d.dbId)}
                            title="Delete delivery"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-14 text-center">
                  <Truck className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No deliveries found.</p>
                  <p className="text-xs text-zinc-600 mt-1">Deliveries appear automatically when orders are marked as Paid.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 bg-zinc-900/30 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{filtered.length} of {deliveries.length} shipments</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-zinc-800 rounded-lg text-zinc-500 disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1.5 text-xs font-bold border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}
