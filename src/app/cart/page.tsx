"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-12">Your Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm">
            <ShoppingBag className="w-16 h-16 text-zinc-200 mx-auto mb-6" />
            <p className="text-zinc-500 font-medium mb-8">Your cart is currently empty</p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all active:scale-95">
               Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div key={item.product_id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-zinc-100 rounded-[2rem] hover:shadow-xl hover:shadow-blue-900/5 transition-all gap-6">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <img src={item.image_url} alt={item.product_name} className="w-24 h-24 object-cover rounded-2xl bg-zinc-100 shadow-inner" />
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 leading-tight">{item.product_name}</h3>
                      <p className="text-blue-600 font-black mt-2">RM {item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    <div className="flex items-center bg-zinc-50 rounded-xl p-1 border border-zinc-100">
                        <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center font-bold text-zinc-600 hover:text-blue-600 transition-colors"
                        >-</button>
                        <span className="w-10 text-center font-black text-zinc-900">{item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center font-bold text-zinc-600 hover:text-blue-600 transition-colors"
                        >+</button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product_id)}
                      className="p-3 text-zinc-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all active:scale-95 shadow-sm bg-white"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 sticky top-28 shadow-xl shadow-blue-900/5">
                <h2 className="text-xl font-black text-zinc-900 mb-8 tracking-tight">Order Summary</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-zinc-500"><span className="font-medium">Subtotal</span> <span className="font-bold text-zinc-900 underline underline-offset-4 decoration-zinc-200">RM {cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-zinc-500"><span className="font-medium">Shipping</span> <span className="text-green-600 font-black">Free</span></div>
                  <div className="h-px bg-zinc-100 my-2"></div>
                  <div className="flex justify-between text-xl font-black text-zinc-900">
                    <span>Total</span>
                    <span className="text-blue-600">RM {cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-zinc-900/10 transition-all duration-300 active:scale-95 group">
                   Proceed to Checkout
                   <ShoppingBag className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
