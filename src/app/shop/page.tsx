"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, Loader2, Star, Filter } from "lucide-react";
import { getUser, logout } from "@/lib/auth";
import { useCart } from "@/context/CartContext";

function ProductCard({ product, addToCart, addingToCart, isWishlisted, onToggleWishlist }: any) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group border border-zinc-100/50 will-change-transform">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 flex items-center justify-center">
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 w-full h-full animate-pulse bg-gray-200 z-10" />
        )}
        
        {/* Image */}
        <img
          src={product.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={product.product_name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
            setLoaded(true);
          }}
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } group-hover:scale-110 transition-transform duration-500`}
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full z-20 transition-all duration-200 ease-out shadow-sm border ${
            isWishlisted 
              ? "bg-yellow-400 text-white scale-110 border-yellow-500" 
              : "bg-white/90 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600 border-white"
          } hover:scale-110 active:scale-90`}
        >
           <Star className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm ${
              product.category === 'Electronics' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              product.category === 'Audio' ? 'bg-purple-50 text-purple-600 border-purple-100' :
              product.category === 'Accessories' ? 'bg-green-50 text-green-600 border-green-100' :
              product.category === 'Devices' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
              'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
                {product.category || 'Other'}
            </span>
            <p className="text-zinc-400 text-[9px] font-bold uppercase">Stock: {product.stock}</p>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.product_name}
        </h3>
        
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-zinc-50">
            <div>
                <p className="text-[9px] text-zinc-400 font-bold uppercase mb-0.5">Price</p>
                <p className="text-xl font-black text-zinc-900">RM {parseFloat(product.price).toFixed(2)}</p>
            </div>
            <button 
                onClick={() => addToCart(product.id)}
                disabled={addingToCart === product.id}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 group/btn"
            >
                {addingToCart === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        Add
                        <ShoppingCart className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Safe localStorage read on mount
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Wishlist parse error:", e);
      }
    }
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const updated = prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        // Build category list dynamically from real DB data
        const cats = Array.from(new Set((data as any[]).map((p: any) => p.category).filter(Boolean))) as string[];
        setCategories(["All", ...cats.sort()]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch products failure:", err);
        setLoading(false);
      });
  }, []);

  const { addToCart: contextAddToCart } = useCart();

  const handleAddToCart = async (productId: number) => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    setAddingToCart(productId);
    
    setTimeout(() => {
      try {
        contextAddToCart({
          product_id: product.id,
          product_name: product.product_name,
          price: parseFloat(product.price),
          image_url: product.image_url
        });
        alert("Added to cart!");
      } catch (err) {
        console.error("Add to cart error:", err);
      } finally {
        setAddingToCart(null);
      }
    }, 400);
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Initializing NovaMart Store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen pb-20 font-sans">
      {/* Header Section */}
      <div className="bg-zinc-900 text-white py-20 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h1 className="text-6xl font-black tracking-tight mb-4">NovaMart Store</h1>
            <p className="text-zinc-400 text-xl max-w-2xl font-medium">Explore our curated collection of premium products.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 sticky top-28">
               <h2 className="text-2xl font-black text-zinc-900 mb-8 flex items-center gap-4">
                 <Filter className="w-7 h-7 text-blue-600" /> Categories
               </h2>
               <div className="space-y-3">
                   {categories.map(cat => (
                     <button 
                       key={cat} 
                       onClick={() => setSelectedCategory(cat)}
                       className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 active:scale-95 group ${
                         selectedCategory === cat 
                         ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40' 
                         : 'text-zinc-500 hover:bg-zinc-50 hover:text-blue-600'
                       }`}
                     >
                        <div className="flex justify-between items-center">
                            <span>{cat === 'All' ? 'All Items' : cat}</span>
                            {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                     </button>
                  ))}
               </div>
            </div>
          </aside>

          {/* Product Feed */}
          <main className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  addToCart={handleAddToCart} 
                  addingToCart={addingToCart} 
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="py-40 text-center bg-white rounded-3xl border border-zinc-100 shadow-lg">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Filter className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Nothing here yet 👀</h3>
                    <p className="text-zinc-500 font-medium mb-10">Try another category or reset filters.</p>
                    <button 
                        onClick={() => setSelectedCategory("All")} 
                        className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/30 hover:bg-zinc-900 hover:shadow-zinc-900/20 transition-all active:scale-95"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
