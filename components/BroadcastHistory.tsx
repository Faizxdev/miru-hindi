"use client";
import React, { useState, useEffect } from 'react';
import { settingsService } from '@/lib/settingsService';

export default function BroadcastHistory() {
  const [history, setHistory] = useState<{ message: string; type: string; timestamp: number }[]>([]);
  const [current, setCurrent] = useState<{ message: string; type: string; enabled: boolean } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await settingsService.getSettings();
      setHistory(s.broadcast_history || []);
      setCurrent({
        message: s.broadcast_message,
        type: s.broadcast_type,
        enabled: s.broadcast_enabled
      });
    }
    load();
  }, []);

  if (!current?.enabled && history.length === 0) return null;

  const typeStyles: Record<string, string> = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    urgent: 'bg-red-500/10 border-red-500/30 text-red-100',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
         {/* ACTIVE BROADCAST */}
         {current?.enabled && (
            <div className={`p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 ${typeStyles[current.type]}`}>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                     <span className="animate-pulse">📢</span>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Live Broadcast</p>
                     <p className="text-sm md:text-base font-bold tracking-tight">{current.message}</p>
                  </div>
               </div>
               {history.length > 0 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-all"
                  >
                     {isExpanded ? 'Hide History' : 'View Past Updates'}
                  </button>
               )}
            </div>
         )}

         {/* HISTORY LOG */}
         {(isExpanded || (!current?.enabled && history.length > 0)) && (
            <div className="p-6 bg-black/40 space-y-4">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Announcement History</p>
                  {!current?.enabled && (
                     <span className="text-[9px] font-bold text-accent border border-accent/20 px-2 py-0.5 rounded">ARCHIVE</span>
                  )}
               </div>
               
               <div className="space-y-3">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-start gap-6 group hover:bg-white/5 p-4 rounded-xl transition-all border border-transparent hover:border-white/5">
                       <span className="text-[10px] font-mono text-white/10 group-hover:text-[#E8C97A] shrink-0 mt-1">
                          {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                       <div className="flex-1 space-y-1">
                          <p className="text-[11px] md:text-xs font-medium text-white/70 leading-relaxed capitalize">{item.message}</p>
                          <div className={`text-[8px] font-black uppercase tracking-widest inline-block ${item.type === 'urgent' ? 'text-red-500' : 'text-white/20'}`}>
                             Type: {item.type}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
