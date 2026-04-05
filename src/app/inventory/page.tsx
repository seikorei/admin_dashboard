"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Filter, Package, Plus, AlertTriangle,
  Pencil, Trash2, X, ChevronDown, AlertCircle, ImagePlus, Upload,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────── */
type Status = "In Stock" | "Low Stock" | "Out of Stock";
interface Product {
  id: string; dbId: number; name: string; category: string;
  stock: number; status: Status; price: string; image_url: string;
}

/* ─── Helpers ─────────────────────────────────────────── */
function stockStatus(stock: number): Status {
  if (stock === 0) return "Out of Stock";
  if (stock < 15)  return "Low Stock";
  return "In Stock";
}

function mapRow(r: any): Product {
  return {
    id:        String(r.id ?? r.dbId ?? ""),
    dbId:      Number(r.dbId ?? r.id ?? 0),
    name:      r.name || r.product_name || "Unknown",
    category:  r.category || "Uncategorized",
    stock:     Number(r.stock ?? 0),
    price:     r.price ? String(r.price) : "0.00",
    status:    r.status || stockStatus(Number(r.stock ?? 0)),
    image_url: r.image_url || "",
  };
}

const CATEGORIES = ["All", "Electronics", "Audio", "Accessories", "Devices", "Furniture", "Peripherals", "Wearables", "Home"];

const STATUS_STYLE: Record<Status, string> = {
  "In Stock":     "bg-emerald-950/60 text-emerald-400",
  "Low Stock":    "bg-amber-950/60 text-amber-400",
  "Out of Stock": "bg-rose-950/60 text-rose-400",
};

const EMPTY = { name: "", category: "Electronics", stock: 0, price: "", image_url: "" };

/* ─── Sub-components ──────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg }:
  { label: string; value: string | number; icon: any; color: string; bg: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border-zinc-200 dark:border-[#1e293b] bg-white/50 dark:bg-[#0f172a] p-5">
      <div className={`shrink-0 p-2.5 rounded-lg ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── Image Upload Widget ─────────────────────────────── */
interface ImageUploadProps {
  currentUrl: string;
  onChange: (url: string) => void;
}
function ImageUploadWidget({ currentUrl, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file) return;
    setError("");

    // Client-side validation
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, or GIF images allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5 MB.");
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setPreview(data.image_url);
        onChange(data.image_url);
      } else {
        setError(data.error || "Upload failed.");
        setPreview(currentUrl); // revert
      }
    } catch (e: any) {
      setError("Network error during upload.");
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
        Product Image
      </label>

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer select-none overflow-hidden
          ${dragOver
            ? "border-blue-400 bg-blue-950/30"
            : "border-zinc-700 hover:border-blue-500 bg-zinc-900/50 hover:bg-blue-950/20"
          }
          ${uploading ? "pointer-events-none opacity-70" : ""}
        `}
        style={{ minHeight: "140px" }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-36 object-cover rounded-xl"
              onError={(e: any) => { e.target.src = ""; setPreview(""); }}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
              <Upload className="h-6 w-6 text-white" />
              <span className="text-white text-xs font-bold">Click or drop to replace</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center px-4">
            <div className="p-3 bg-zinc-800 rounded-xl">
              <ImagePlus className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-300">
                {dragOver ? "Drop image here" : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WebP · Max 5 MB</p>
            </div>
          </div>
        )}

        {/* Loading spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-300 font-medium">Uploading…</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />

      {/* Clear button */}
      {preview && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setPreview(""); onChange(""); }}
          className="text-xs text-zinc-500 hover:text-rose-400 transition-colors font-medium"
        >
          Remove image
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Modal ───────────────────────────────────────────── */
interface ModalProps {
  title: string;
  product?: Partial<typeof EMPTY>;
  onSave: (p: typeof EMPTY) => void;
  onClose: () => void;
}
function ProductModal({ title, product, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState({ ...EMPTY, ...product });
  const set = (k: keyof typeof EMPTY, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <ImageUploadWidget
            currentUrl={form.image_url}
            onChange={(url) => set("image_url", url)}
          />

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Product Name</label>
            <input
              type="text" spellCheck={false} value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Wireless Mouse"
              className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Stock & Price row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Stock</label>
              <input
                type="number" min={0} value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Price (RM)</label>
              <input
                type="text" spellCheck={false} value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 bg-white dark:bg-[#0b1220] border border-zinc-200 dark:border-[#1e293b] text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (form.name.trim()) { onSave(form); onClose(); } }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-colors active:scale-95">
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm delete dialog ───────────────────────────── */
function ConfirmDelete({ name, onConfirm, onCancel }:
  { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#1e293b] rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-950/50">
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <h2 className="text-base font-bold text-white">Delete Product</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          Are you sure you want to delete <span className="font-bold text-white">"{name}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-zinc-800 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-bold text-white transition-colors active:scale-95">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────── */
export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [showAdd, setShowAdd]   = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.map(mapRow)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* Filter */
  const filtered = products.filter((p) => {
    const matchSearch = (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
                        String(p.id).toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || p.category === category;
    return matchSearch && matchCat;
  });

  /* CRUD handlers */
  const handleAdd = async (form: typeof EMPTY) => {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: form.name,
        category:     form.category,
        status:       stockStatus(Number(form.stock)),
        stock:        Number(form.stock),
        price:        form.price,
        image_url:    form.image_url || null,
      }),
    });
    fetchProducts();
  };

  const handleEdit = async (form: typeof EMPTY) => {
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id:           editItem!.dbId,
        product_name: form.name,
        category:     form.category,
        status:       stockStatus(Number(form.stock)),
        stock:        Number(form.stock),
        price:        form.price,
        image_url:    form.image_url,  // pass explicitly so API can update it
      }),
    });
    fetchProducts();
  };

  const handleDelete = async () => {
    await fetch(`/api/products?id=${deleteItem!.dbId}`, { method: "DELETE" });
    setDeleteItem(null);
    fetchProducts();
  };

  /* Computed stats */
  const totalItems    = products.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const outOfStock    = products.filter((p) => p.status === "Out of Stock").length;

  return (
    <>
      <div className="space-y-6 pb-4">
        {/* ── Page header ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Product Inventory</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage your product catalog and stock levels.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* ── Stats cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Stock"     value={loading ? "—" : totalItems.toLocaleString()} icon={Package}       color="text-blue-400"   bg="bg-blue-950/50"  />
          <StatCard label="Low Stock Alert" value={loading ? "—" : lowStockCount}               icon={AlertTriangle}  color="text-amber-400"  bg="bg-amber-950/50" />
          <StatCard label="Out of Stock"    value={loading ? "—" : outOfStock}                  icon={AlertCircle}    color="text-rose-400"   bg="bg-rose-950/50"  />
        </div>

        {/* ── Toolbar: search + category filter ───────── */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text" spellCheck={false} value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#0b1220]/80 border border-zinc-200 dark:border-[#1e293b] rounded-xl text-zinc-900 dark:text-slate-200 placeholder:text-zinc-500 dark:placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all"
            />
          </div>

          {/* Category filter */}
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-[#0b1220]/80 border border-zinc-200 dark:border-[#1e293b] rounded-xl text-zinc-900 dark:text-slate-300 appearance-none
                focus:outline-none focus:ring-2 focus:ring-blue-500/25 transition-all cursor-pointer"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* ── Low-stock warning banner ─────────────────── */}
        {!loading && lowStockCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-400 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span><strong>{lowStockCount}</strong> product{lowStockCount > 1 ? "s are" : " is"} running low on stock and may need restocking soon.</span>
          </div>
        )}

        {/* ── Table ───────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border-zinc-200 dark:border-[#1e293b] bg-white/50 dark:bg-[#0f172a] backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-zinc-800">
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[38%]">Product</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[15%]">Category</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center w-[10%]">Stock</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-[15%]">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right w-[12%]">Price</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <p className="text-sm text-zinc-500">Loading products…</p>
                    </td>
                  </tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* Product thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-700">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{item.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">#{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-400">{item.category}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-white text-center">
                      <span className={item.status === "Out of Stock" ? "text-rose-400" : item.status === "Low Stock" ? "text-amber-400" : ""}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_STYLE[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-zinc-300 text-right">RM {item.price}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditItem(item)}
                          title="Edit"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                            text-zinc-400 hover:bg-blue-950/60 hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          title="Delete"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                            text-zinc-400 hover:bg-rose-950/60 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <Package className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">No products found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3.5 bg-zinc-900/30 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {filtered.length} of {products.length} products
            </span>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {showAdd && (
        <ProductModal
          title="Add New Product"
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editItem && (
        <ProductModal
          title="Edit Product"
          product={{
            name:      editItem.name,
            category:  editItem.category,
            stock:     editItem.stock,
            price:     editItem.price,
            image_url: editItem.image_url,
          }}
          onSave={handleEdit}
          onClose={() => setEditItem(null)}
        />
      )}
      {deleteItem && (
        <ConfirmDelete
          name={deleteItem.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </>
  );
}
