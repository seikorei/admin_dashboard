"use client";
import Link from "next/link";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getUser, logout } from "@/lib/auth";

import { useCart } from "@/context/CartContext";

export default function StoreNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Bring in totalItems mapped cleanly
  const { totalItems } = useCart();

  useEffect(() => {
    // Read on mount
    setUser(getUser());

    // React to login/logout from other tabs (storage event)
    // AND same-tab changes (userChanged custom event)
    const handleUserChange = () => setUser(getUser());
    window.addEventListener("storage", handleUserChange);
    window.addEventListener("userChanged", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleUserChange);
      window.removeEventListener("userChanged", handleUserChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("userChanged"));
  };

  return (
    <nav className="bg-zinc-900 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          <div className="flex-shrink-0 flex items-center">
            <Link href="/home" className="text-3xl font-extrabold tracking-tight text-white hover:text-blue-400 transition-colors flex items-center gap-2">
              <span className="text-blue-500">Nova</span>Mart
            </Link>
          </div>
          
          <div className="hidden lg:flex flex-1 justify-center space-x-8">
            <Link href="/home" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 hover:scale-105">Home</Link>
            <Link href="/shop" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 hover:scale-105">Shop</Link>
            <Link href="/cart" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 hover:scale-105">Cart</Link>
            <Link href="/checkout" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 hover:scale-105">Checkout</Link>
            <Link href="/about" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 hover:scale-105">About</Link>
            <Link href="/contact" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 hover:scale-105">Contact</Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/cart" className="text-sm font-semibold tracking-wide text-zinc-300 hover:text-blue-400 transition-all duration-300 flex items-center gap-2 group">
              <div className="relative group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 border-[2px] border-zinc-900 text-[10px] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/account" className="flex items-center gap-2 p-1 pr-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full transition-all duration-300 hover:scale-105 group">
                  <div className="p-2 bg-blue-600 rounded-full group-hover:bg-blue-500 transition-colors">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-zinc-200 group-hover:text-white">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-900/20 active:scale-95">
                Login
              </Link>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}
