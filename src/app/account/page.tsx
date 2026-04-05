"use client";

import { useEffect, useState } from "react";
import { getUser, logout } from "@/lib/auth";
import { LogOut, User, Mail } from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedUser = getUser();
      if (!loggedUser) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch(`/api/auth/me?id=${loggedUser.id}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          fetchOrders(loggedUser.id);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchOrders = async (userId: number) => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?user_id=${userId}`);
      const data = await res.json();
      const fetchedOrders = data?.orders || [];
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-zinc-50 min-h-screen py-12 px-6">
      <div className="max-w-[400px] mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-white w-full p-8 rounded-[2rem] shadow-xl border border-zinc-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-600/20 rotate-3 translate-y-[-10px]">
            <User className="w-10 h-10 rotate-[-3deg]" />
          </div>
          
          <h1 className="text-3xl font-black text-zinc-900 mb-2 leading-tight">Welcome, {user.name}</h1>
          <p className="text-zinc-500 flex items-center justify-center gap-2 mb-10 text-sm">
            <Mail className="w-4 h-4 text-blue-500" /> {user.email}
          </p>

          <button 
            onClick={() => logout()}
            className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>

        {/* Order History Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight px-2">Order History</h2>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{orders.length} Orders</span>
            </div>

            {loadingOrders ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-zinc-100 italic text-zinc-400">Loading history...</div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-zinc-100 text-zinc-400 font-medium">No orders yet</div>
            ) : (
                (Array.isArray(orders) ? orders : []).map((order) => (
                    <div key={order.order_id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm font-black text-zinc-900 mb-1">Order #{order.order_id}</h3>
                                <p className="text-[10px] text-zinc-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                order.status === 'Completed' || order.status === 'Shipped' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                        
                        <ul className="space-y-2 mb-4 border-y border-zinc-50 py-3">
                            {order.items.map((item: any, i: number) => (
                                <li key={`${order.order_id}-${item.product_name}-${i}`} className="flex justify-between text-xs text-zinc-600">
                                    <span>{item.product_name} <span className="text-zinc-400 font-bold">x{item.quantity}</span></span>
                                    <span className="font-bold text-zinc-900">RM {item.price}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center pt-1">
                            <span className="text-xs font-bold text-zinc-400">Total Bill</span>
                            <span className="text-lg font-black text-blue-600 group-hover:scale-110 transition-transform origin-right">RM {order.total_amount}</span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
