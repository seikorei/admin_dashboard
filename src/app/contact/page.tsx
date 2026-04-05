import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">Get in Touch</h1>
          <p className="text-lg text-zinc-500">We'd love to hear from you. Please fill out this form or reach out directly.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8 pl-0 md:pl-10">
            <h3 className="text-2xl font-bold text-zinc-900">Contact Information</h3>
            <div className="flex items-center gap-4 text-zinc-600">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <p>123 Commerce Avenue<br/>San Francisco, CA 94103</p>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <p>support@novamart.com</p>
            </div>
          </div>
          
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Name</label>
                <input type="text" placeholder="Jane Doe" className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Email</label>
                <input type="email" placeholder="jane@example.com" className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Message</label>
                <textarea rows={4} placeholder="How can we help?" className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"></textarea>
              </div>
              <button type="button" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-600/30 transition-all duration-300 active:scale-95">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
