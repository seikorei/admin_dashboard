"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { useCart } from "@/context/CartContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  const { cart: cartItems, cartTotal: total, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zip: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  if (!user) {
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
  }
  if (!formData.firstName.trim()) errors.firstName = "First name is required";
  if (!formData.lastName.trim()) errors.lastName = "Last name is required";
  if (!formData.street.trim()) errors.street = "Address is required";
  if (!formData.city.trim()) errors.city = "City is required";
  if (!formData.zip.trim()) errors.zip = "ZIP code is required";

  const isValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  useEffect(() => {
    const loggedUser = getUser();
    if (loggedUser) {
      setUser(loggedUser);
      // Auto-fill from logged-in user
      const nameParts = (loggedUser.name || "").split(" ");
      setFormData({
        email: loggedUser.email || "",
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        street: loggedUser.address || "",
        city: loggedUser.city || "",
        zip: loggedUser.zip || "",
      });
    }

    setLoading(false);
  }, []);

  // Show PayPal only once cart is loaded & total > 0
  useEffect(() => {
    if (!loading && cartItems.length > 0 && total > 0) {
      setPaypalReady(true);
    } else {
      setPaypalReady(false);
    }
  }, [loading, cartItems.length, total]);

  const saveOrder = async (paymentId: string) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          items: cartItems,
          total: total,
          paymentId,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: user ? user.email : formData.email,
          city: formData.city,
          address: `${formData.street}, ${formData.zip}`,
        }),
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };

  const handlePayPalApprove = async (details: any) => {
    await saveOrder(details.id || "paypal-" + Date.now());
    clearCart();
    window.location.href = "/account";
  };

  const handleSimulatePayment = async () => {
    if (cartItems.length === 0) { alert("Your cart is empty."); return; }
    await saveOrder("simulated-" + Date.now());
    clearCart();
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-2xl">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-500/20">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">Order Placed!</h1>
          <p className="text-zinc-500 font-medium mb-10 leading-relaxed">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => (window.location.href = "/account")}
              className="w-full py-5 bg-zinc-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              View Order History
            </button>
            <button
              onClick={() => (window.location.href = "/shop")}
              className="w-full py-4 text-zinc-500 font-bold hover:text-zinc-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left: Form */}
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-4">Secure Checkout</h1>
            <p className="text-zinc-500 mb-12">Complete your details below to finalize your order.</p>

            <div className="space-y-12">
              {/* Contact */}
              <section>
                <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">
                    01
                  </span>
                  Contact Information
                </h2>
                <div className="pl-12">
                  {user ? (
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-2xl outline-none cursor-not-allowed"
                    />
                  ) : (
                    <>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        className={`w-full px-5 py-4 bg-white border ${touched.email && errors.email ? "border-red-500" : "border-zinc-200"} text-zinc-900 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none`}
                      />
                      {touched.email && errors.email && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.email}</p>}
                    </>
                  )}
                </div>
              </section>

              {/* Shipping */}
              <section>
                <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">
                    02
                  </span>
                  Shipping Details
                </h2>
                <div className="pl-12 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input type="text" placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} onBlur={() => handleBlur("firstName")} className={`w-full px-5 py-4 bg-white border ${touched.firstName && errors.firstName ? "border-red-500" : "border-zinc-200"} text-zinc-900 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none`} />
                      {touched.firstName && errors.firstName && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <input type="text" placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} onBlur={() => handleBlur("lastName")} className={`w-full px-5 py-4 bg-white border ${touched.lastName && errors.lastName ? "border-red-500" : "border-zinc-200"} text-zinc-900 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none`} />
                      {touched.lastName && errors.lastName && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <input type="text" placeholder="Street Address" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} onBlur={() => handleBlur("street")} className={`w-full px-5 py-4 bg-white border ${touched.street && errors.street ? "border-red-500" : "border-zinc-200"} text-zinc-900 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none`} />
                    {touched.street && errors.street && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.street}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} onBlur={() => handleBlur("city")} className={`w-full px-5 py-4 bg-white border ${touched.city && errors.city ? "border-red-500" : "border-zinc-200"} text-zinc-900 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none`} />
                      {touched.city && errors.city && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.city}</p>}
                    </div>
                    <div>
                      <input type="text" placeholder="ZIP Code" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} onBlur={() => handleBlur("zip")} className={`w-full px-5 py-4 bg-white border ${touched.zip && errors.zip ? "border-red-500" : "border-zinc-200"} text-zinc-900 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none`} />
                      {touched.zip && errors.zip && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.zip}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">
                    03
                  </span>
                  Payment
                </h2>
                <div className="pl-12 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-zinc-400 font-medium">Your cart is empty.</p>
                      <a href="/shop" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">
                        Back to shop →
                      </a>
                    </div>
                  ) : paypalReady ? (
                    <>
                      {!isValid && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold mb-4">
                          Please complete all valid contact and shipping details to enable payment.
                        </div>
                      )}
                      <div className={!isValid ? "opacity-50 pointer-events-none grayscale transition-all" : "transition-all"}>
                        <PayPalScriptProvider
                          options={{
                            clientId: "test",
                            currency: "USD",
                            intent: "capture",
                          }}
                        >
                          <PayPalButtons
                            style={{ layout: "vertical", shape: "rect", label: "pay", color: "gold" }}
                            forceReRender={[total]}
                            disabled={!isValid}
                            createOrder={(_data: any, actions: any) => {
                              return actions.order.create({
                                purchase_units: [
                                  {
                                    amount: {
                                      value: total.toFixed(2),
                                      currency_code: "USD",
                                    },
                                  },
                                ],
                              });
                            }}
                            onApprove={(_data: any, actions: any) => {
                              return actions.order!.capture().then((details: any) => {
                                handlePayPalApprove(details);
                              });
                            }}
                            onError={(err: any) => {
                              console.error("PayPal Error:", err);
                            }}
                          />
                        </PayPalScriptProvider>

                        {/* Divider */}
                        <div className="relative flex items-center py-3">
                          <div className="flex-grow border-t border-zinc-200"></div>
                          <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-bold uppercase tracking-wider">or</span>
                          <div className="flex-grow border-t border-zinc-200"></div>
                        </div>

                        {/* Simulate Credit Card – works immediately */}
                        <button
                          type="button"
                          onClick={handleSimulatePayment}
                          disabled={!isValid}
                          className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:active:scale-100"
                        >
                          💳 Simulate Card Payment (Test)
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="ml-3 text-zinc-400 font-medium">Loading payment options...</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:pt-20">
            <div className="bg-zinc-50 border border-zinc-100 rounded-[3rem] p-10 shadow-inner sticky top-28">
              <h3 className="text-xl font-black text-zinc-900 mb-8 border-b border-zinc-200 pb-4">
                Order Summary
              </h3>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-8">
                {cartItems.map((item: any) => (
                  <div key={item.product_id} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl border border-zinc-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = "https://via.placeholder.com/56x56?text=?";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{item.product_name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-black text-zinc-900">
                      RM {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-zinc-400 text-center py-8">No items in cart</p>
                )}
              </div>
              <div className="space-y-3 pt-6 border-t border-zinc-200">
                <div className="flex justify-between text-sm text-zinc-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-bold">RM {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500 font-medium">
                  <span>Shipping</span>
                  <span className="text-green-600 font-black">Free</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-zinc-900 pt-3">
                  <span>Total Bill</span>
                  <span className="text-blue-600">RM {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
