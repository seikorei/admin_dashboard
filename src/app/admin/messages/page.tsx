"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { Mail, Clock, ShieldAlert, Loader2, RefreshCw } from "lucide-react";

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.error || "Failed to load messages.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title="Customer Messages" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Mail className="w-6 h-6 text-indigo-400" />
                  Inbox
                </h1>
                <p className="text-sm text-slate-400 mt-1">Review and manage contact form submissions.</p>
              </div>
              <button
                onClick={fetchMessages}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Loading Data */}
            {loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                <p>Loading your messages...</p>
              </div>
            )}

            {/* Message List */}
            {!loading && messages.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 bg-[#0f172a] rounded-2xl border border-slate-800">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white">No messages yet</h3>
                <p className="text-sm text-slate-400 mt-1">When customers contact you, they'll appear here.</p>
              </div>
            )}

            {messages.length > 0 && (
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        <th className="px-6 py-4">Sender Info</th>
                        <th className="px-6 py-4">Message</th>
                        <th className="px-6 py-4">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-slate-800/30 transition-colors group">
                          
                          <td className="px-6 py-4 align-top w-1/4">
                            <p className="font-bold text-white text-sm">{msg.name}</p>
                            <a href={`mailto:${msg.email}`} className="text-xs text-indigo-400 hover:text-indigo-300 truncate block mt-0.5 max-w-[200px]">
                              {msg.email}
                            </a>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words max-w-2xl">
                              {msg.message}
                            </p>
                          </td>

                          <td className="px-6 py-4 align-top w-48 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(msg.created_at).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
