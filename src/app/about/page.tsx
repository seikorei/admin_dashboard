import { Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-zinc-50 border-b border-zinc-200 py-16 text-center">
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Our Story</h1>
        <p className="max-w-xl mx-auto mt-4 text-zinc-500 text-lg">We're on a mission to redefine commerce through curated selections and incredible shopping experiences.</p>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 bg-zinc-100 rounded-3xl h-64 w-full flex items-center justify-center text-6xl shadow-inner">
            🌍
          </div>
          <div className="flex-1 space-y-4 text-zinc-700">
            <h2 className="text-2xl font-bold text-zinc-900">Global Reach, Local Touch</h2>
            <p className="leading-relaxed">
              Founded in 2024, NovaMart began as a small passion project and has grown to serve thousands of customers worldwide. 
              We carefully source our products from trusted suppliers globally, ensuring the highest standards of quality are met.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse gap-10 items-center mt-12">
          <div className="flex-1 bg-blue-50 rounded-3xl h-64 w-full flex items-center justify-center text-6xl shadow-inner text-blue-500">
            <Heart className="w-20 h-20" />
          </div>
          <div className="flex-1 space-y-4 text-zinc-700">
            <h2 className="text-2xl font-bold text-zinc-900">Customer First</h2>
            <p className="leading-relaxed">
              Everything we do is designed around our customers. Our support team is active 24/7, and our intuitive application guarantees that shopping isn't just a transaction, but an experience you genuinely enjoy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
