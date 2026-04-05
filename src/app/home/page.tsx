import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldCheck, Truck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-white text-zinc-900">
      {/* Hero Section */}
      <section className="bg-white min-h-[80vh] flex items-center py-20 px-5 lg:px-20 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-[40px] w-full">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-tight">
              Modern Tech <span className="text-blue-600">Essentials.</span>
            </h1>
            <p className="max-w-xl text-xl text-zinc-500 mb-10 leading-relaxed">
              Discover premium electronics and lifestyle products curated for the modern era. Quality guaranteed on every order.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/shop" className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 hover:scale-105 active:scale-95 text-center">
                Shop Now
              </Link>
              <Link href="/about" className="px-10 py-4 bg-white border-2 border-zinc-200 hover:border-blue-600 hover:text-blue-600 text-zinc-900 font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 text-center">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end">
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da" 
              alt="Premium Bag" 
              className="w-full max-w-[450px] rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* Spacing for lower content */}
      <div className="mt-[60px]"></div>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-zinc-50 transition-colors">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
              <p className="text-zinc-500">We carefully curate and inspect every item to ensure it meets our highest standards of quality.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-zinc-50 transition-colors">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-zinc-500">Enjoy lightning-fast delivery options for local and international orders across the globe.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-zinc-50 transition-colors">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Checkout</h3>
              <p className="text-zinc-500">Your privacy and security are our top priority. Shop with peace of mind every single time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
