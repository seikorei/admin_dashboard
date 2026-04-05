"use client";

import React from "react";

export default function RightPanel() {
  return (
    <div className="hidden h-screen w-16 flex-col border-l border-zinc-200 bg-white dark:border-slate-800 dark:bg-[#020617] lg:flex items-center pt-6 px-2">
      <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-[#0f172a] mb-6 flex items-center justify-center text-[10px] text-zinc-400 dark:text-slate-400 font-bold uppercase tracking-wider">
        AD
      </div>
      <div className="flex flex-col gap-4 w-full items-center">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="w-10 h-10 rounded-lg border border-dashed border-zinc-200 dark:border-slate-700 hover:dark:border-slate-600 bg-transparent flex items-center justify-center text-zinc-300 dark:text-slate-500 hover:dark:text-slate-400 transition-colors"
          >
            +
          </div>
        ))}
      </div>
    </div>
  );
}
