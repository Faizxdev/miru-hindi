"use client";
import React, { useState, useEffect } from 'react';
import { animeCacheService } from '@/lib/animeCacheService';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAnime: 0,
    totalEpisodes: 0,
    lastSync: 'None',
    ongoingCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const all = await animeCacheService.getAllCached(5000);
      const totalEpisodes = all.reduce((acc, curr) => acc + (curr.episodes?.length || 0), 0);
      const lastSync = all.length > 0 ? new Date(Math.max(...all.map(a => new Date(a.lastFetched).getTime()))).toLocaleString() : 'Never';
      
      setStats({
        totalAnime: all.length,
        totalEpisodes,
        lastSync,
        ongoingCount: all.filter(a => a.status === 'Ongoing').length
      });
      setIsLoading(false);
    }
    loadStats();
  }, []);

  if (isLoading) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="w-10 h-10 border-2 border-white/5 border-t-[#E8C97A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <header>
         <h1 className="text-4xl font-serif font-black tracking-tighter text-white italic">Admin Terminal</h1>
         <p className="text-content-tertiary text-xs font-medium tracking-widest uppercase mt-2">Centralized Command & Control • V2.0.4</p>
      </header>

      {/* COMPACT STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total Entities', value: stats.totalAnime, emoji: '📁', color: 'border-blue-500/30' },
           { label: 'Neural Nodes', value: stats.totalEpisodes, emoji: '🧬', color: 'border-purple-500/30' },
           { label: 'Active Streams', value: stats.ongoingCount, emoji: '📡', color: 'border-green-500/30' },
           { label: 'Last Broadcast', value: stats.lastSync, emoji: '🕒', isDate: true, color: 'border-orange-500/30' }
         ].map((item, i) => (
           <div 
             key={i} 
             className={`p-6 bg-white/[0.02] border ${item.color} rounded-none hover:bg-white/[0.04] transition-all hover:border-[#E8C97A]/40 group`}
           >
              <div className="flex justify-between items-start mb-4">
                 <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{item.emoji}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#E8C97A] transition-colors" />
              </div>
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <p className={`font-black text-white ${item.isDate ? 'text-xs truncate' : 'text-2xl font-serif italic'}`}>{item.value}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* FAST ACTIONS */}
         <div className="lg:col-span-4 space-y-4">
            <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Quick Operations</h2>
            <Link href="/admin/content/sync" className="block p-6 bg-white/[0.03] border border-white/5 rounded-none hover:border-[#E8C97A]/40 transition-all group">
               <p className="text-xs font-black uppercase tracking-widest group-hover:text-[#E8C97A]">Start Bulk Sync ↗</p>
               <p className="text-[10px] text-white/20 mt-1 uppercase font-bold">Populate Library via Discovery Node</p>
            </Link>
            <Link href="/admin/content" className="block p-6 bg-white/[0.03] border border-white/5 rounded-none hover:border-blue-400/40 transition-all group">
               <p className="text-xs font-black uppercase tracking-widest group-hover:text-blue-400">View Catalog ↗</p>
               <p className="text-[10px] text-white/20 mt-1 uppercase font-bold">Manage 5,000+ cached entities</p>
            </Link>
            <Link href="/admin/settings" className="block p-6 bg-white/[0.03] border border-white/5 rounded-none hover:border-purple-400/40 transition-all group">
               <p className="text-xs font-black uppercase tracking-widest group-hover:text-purple-400">Global Config ↗</p>
               <p className="text-[10px] text-white/20 mt-1 uppercase font-bold">Adjust API Tokens & Feature Flags</p>
            </Link>
         </div>

         {/* RECENT MONITORING */}
         <div className="lg:col-span-8 space-y-4">
            <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">System Telemetry</h2>
            <div className="bg-white/[0.01] border border-white/5 rounded-none p-8 font-mono text-[10px] leading-relaxed text-white/40 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar-minimal shadow-inner">
               <p className="text-[#E8C97A]/60">[{new Date().toLocaleTimeString()}] AUTH_SUCCESS: SESSION_INITIALIZED_FOR_{auth.currentUser?.email?.toUpperCase()}</p>
               <p>[{new Date().toLocaleTimeString()}] FIRESTORE_UP: CLUSTER_READY_FOR_RW</p>
               <p>[{new Date().toLocaleTimeString()}] SCRAPER_IDLE: WAITING_FOR_SYNC_BROADCAST</p>
               <div className="pt-4 border-t border-white/5 text-white/10 uppercase tracking-widest text-[9px] font-bold">End of Log</div>
            </div>
         </div>
      </div>
    </div>
  );
}
