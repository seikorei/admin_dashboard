"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Filter, Eye, Pencil, Trash2, ChevronDown,
  ShoppingCart, X, AlertCircle, Plus, Truck, Loader2,
} from "lucide-react";

type Status = string;
interface Order {
  id: string;      // display id e.g. "#ORD-0001"
  dbId: number;    // numeric PK
  customer: string;
  date: string;
  status: Status;
  amount: string;
}

const STATUS_STYLE: Record<string, string> = {
  Pending:    "bg-amber-950/60 text-amber-400",
  Processing: "bg-blue-950/60 text-blue-400",
  Paid:       "bg-emerald-950/60 text-emerald-400",
  Shipped:    "bg-cyan-950/60 text-cyan-400",
  Cancelled:  "bg-rose-950/60 text-rose-400",
  Delivered:  "bg-purple-950/60 text-purple-400",
};

/* ─── View Modal ──────────────────────────────────────── */
function ViewOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Order Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          {[
            { label: "Order ID",      value: order.id },
            { label: "Customer Name", value: order.customer },
            { label: "Date",          value: order.date },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">{value}</span>
            </div>
          ))}
          <div className="flex justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>{order.status}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-white">Total Amount</span>
            <span className="text-lg font-bold text-blue-500 dark:text-blue-400">{order.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Modal ──────────────────────────────────────── */
function EditOrderModal({ order, onSave, onClose, statuses }: {
  order: Order;
  onSave: (o: { customer: string; status: Status; amount: string }) => Promise<void>;
  onClose: () => void;
  statuses: string[];
}) {
  const [form, setForm] = useState({ customer: order.customer, status: order.status, amount: order.amount });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Edit Order</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Customer Name</label>
            <input type="text" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Status</label>
            <div className="relative">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Amount</label>
            <input type="text" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-colors active:scale-95 disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Order Modal ─────────────────────────────────── */
function AddOrderModal({ onSave, onClose, statuses }: {
  onSave: (o: { customer: string; order_date: string; status: Status; amount: string }) => Promise<void>;
  onClose: () => void;
  statuses: string[];
}) {
  const [form, setForm] = useState({
    customer: "", order_date: new Date().toISOString().split("T")[0],
    status: statuses[0] || "Pending" as Status, amount: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.customer.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Add New Order</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Customer Name</label>
            <input type="text" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="e.g. John Doe"
              className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Order Date</label>
            <input type="date" value={form.order_date} onChange={e => setForm({ ...form, order_date: e.target.value })}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}
                  className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 appearance-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all">
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">Amount (RM)</label>
              <input type="text" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.customer.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-colors active:scale-95 disabled:opacity-60">
            {saving ? "Saving…" : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Delete Modal ────────────────────────────── */
function ConfirmDeleteModal({ order, onConfirm, onCancel }: {
  order: Order; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/50"><AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400" /></div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Delete Order</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Delete <span className="font-bold text-zinc-900 dark:text-white">{order.id}</span> from <span className="font-bold text-zinc-900 dark:text-white">{order.customer}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false); }} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-bold text-white transition-colors active:scale-95 disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Ship Order Confirm Modal ────────────────────────── */
function ShipOrderModal({ order, onConfirm, onCancel }: {
  order: Order; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const [shipping, setShipping] = useState(false);
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-950/50"><Truck className="h-5 w-5 text-cyan-400" /></div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Ship Order</h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Ship <span className="font-bold text-zinc-900 dark:text-white">{order.id}</span> for <span className="font-bold text-zinc-900 dark:text-white">{order.customer}</span>?
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-6">
          This will set the order status to <strong>Shipped</strong> and create a delivery record assigned to <strong>DHL</strong> with ETA in 3 days.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
          <button
            onClick={async () => { setShipping(true); await onConfirm(); setShipping(false); }}
            disabled={shipping}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-bold text-white transition-colors active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {shipping ? <><Loader2 className="h-4 w-4 animate-spin" /> Shipping…</> : <><Truck className="h-4 w-4" /> Ship Order</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function SalesOrderPage() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("All");
  const [statuses, setStatuses]     = useState<string[]>([]);

  const [viewOrder,   setViewOrder]   = useState<Order | null>(null);
  const [editOrder,   setEditOrder]   = useState<Order | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
  const [shipOrder,   setShipOrder]   = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/orders");
      const data = await r.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    fetch("/api/status")
      .then(res => res.json())
      .then(data => setStatuses(data.map((s: any) => s.name)))
      .catch(err => console.error("Fetch statuses error:", err));
  }, []);

  const handleAdd = async (newOrder: { customer: string; order_date: string; status: Status; amount: string }) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
    } catch (err) { console.error("POST error:", err); }
    fetchOrders();
  };

  const handleDelete = async () => {
    if (!deleteOrder) return;
    try {
      await fetch(`/api/orders/${deleteOrder.dbId}`, { method: "DELETE" });
    } catch (err) { console.error("DELETE error:", err); }
    setDeleteOrder(null);
    fetchOrders();
  };

  const handleEdit = async (updated: { customer: string; status: Status; amount: string }) => {
    if (!editOrder) return;
    try {
      await fetch(`/api/orders/${editOrder.dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) { console.error("PUT error:", err); }
    setEditOrder(null);
    fetchOrders();
  };

  // ── Ship Order: change status → Shipped, delivery auto-created by API ──
  const handleShip = async () => {
    if (!shipOrder) return;
    try {
      await fetch(`/api/orders/${shipOrder.dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: shipOrder.customer,
          status:   "Shipped",
          amount:   shipOrder.amount,
        }),
      });
    } catch (err) { console.error("Ship error:", err); }
    setShipOrder(null);
    fetchOrders();
  };

  const filtered = orders.filter((o) => {
    const matchSearch = (o.customer || "").toLowerCase().includes(search.toLowerCase()) ||
                        (o.id || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || o.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-slate-200">Sales Orders</h1>
          <p className="text-sm text-zinc-400 mt-1">View and manage all customer orders.</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 shrink-0">
          <Plus className="h-4 w-4" />Add Order
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input type="text" spellCheck={false} placeholder="Search by order or customer…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#0b1220]/80 border border-zinc-200 dark:border-[#1e293b] rounded-xl text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all" />
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-[#0b1220]/80 border border-zinc-200 dark:border-[#1e293b] rounded-xl text-zinc-900 dark:text-slate-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/25 cursor-pointer">
            {["All", ...statuses].map(s => <option key={s}>{s}</option>)}
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
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[14%]">Order ID</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[22%]">Customer</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[14%]">Date</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[14%]">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right w-[12%]">Amount</th>
                <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right w-[24%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center"><p className="text-sm text-zinc-500">Loading orders…</p></td></tr>
              ) : filtered.map((order) => (
                <tr key={order.dbId} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-blue-400">{order.id}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-zinc-900 dark:text-slate-200">{order.customer}</td>
                  <td className="px-5 py-4 text-sm text-zinc-400">{order.date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-zinc-900 dark:text-slate-200 text-right">{order.amount}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button title="View" onClick={() => setViewOrder(order)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-blue-950/60 hover:text-blue-400 transition-colors">
                        <Eye className="h-3.5 w-3.5" /><span className="hidden xl:inline">View</span>
                      </button>
                      <button title="Edit" onClick={() => setEditOrder(order)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-amber-950/60 hover:text-amber-400 transition-colors">
                        <Pencil className="h-3.5 w-3.5" /><span className="hidden xl:inline">Edit</span>
                      </button>
                      {/* Ship button — only for Paid orders not yet shipped */}
                      {order.status === "Paid" && (
                        <button title="Ship Order" onClick={() => setShipOrder(order)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-cyan-950/60 hover:text-cyan-400 transition-colors">
                          <Truck className="h-3.5 w-3.5" /><span className="hidden xl:inline">Ship</span>
                        </button>
                      )}
                      <button title="Delete" onClick={() => setDeleteOrder(order)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" /><span className="hidden xl:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-14 text-center">
                  <ShoppingCart className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No orders match your filter.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{filtered.length} of {orders.length} orders</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-zinc-800 rounded-lg text-zinc-500 disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1.5 text-xs font-bold border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewOrder   && <ViewOrderModal   order={viewOrder}   onClose={() => setViewOrder(null)} />}
      {editOrder   && <EditOrderModal   order={editOrder}   onSave={handleEdit}  onClose={() => setEditOrder(null)}   statuses={statuses} />}
      {showAddModal && <AddOrderModal   onSave={handleAdd}  onClose={() => setShowAddModal(false)} statuses={statuses} />}
      {deleteOrder && <ConfirmDeleteModal order={deleteOrder} onConfirm={handleDelete} onCancel={() => setDeleteOrder(null)} />}
      {shipOrder   && <ShipOrderModal   order={shipOrder}   onConfirm={handleShip} onCancel={() => setShipOrder(null)} />}
    </div>
  );
}
