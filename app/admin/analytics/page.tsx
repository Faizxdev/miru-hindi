"use client";
import React, { useState, useEffect } from 'react';
import { userDataService } from '@/lib/userDataService';

export default function AdminAnalyticsPage() {
  const [telemetry, setTelemetry] = useState<{ dau: number; topWatched: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await userDataService.getEngagementTelemetry();
      setTelemetry(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading || !telemetry) {
    return (
       <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-8 h-8 border-2 border-[#E8C97A]/20 border-t-[#E8C97A] rounded-full animate-spin" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Gathering Telemetry...</p>
       </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <header className="space-y-2">
         <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">Engagement Telemetry</h1>
         <p className="text-content-tertiary font-medium tracking-wide text-[10px] uppercase opacity-40">
           Real-time behavioral analysis & audience metrics.
         </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* DAU WIDGET */}
         <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-[#E8C97A]/40 transition-colors">
            <div className="relative z-10">
               <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Daily Active Users</p>
               <h3 className="text-5xl font-serif italic font-black text-[#E8C97A] mt-4">{telemetry.dau}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl grayscale opacity-5 group-hover:opacity-10 transition-opacity select-none">📊</div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest relative z-10">Cluster_Region: GLOBAL</p>
         </div>

         {/* TOTAL INTERACTIONS (MOCK) */}
         <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-[#E8C97A]/40 transition-colors">
            <div className="relative z-10">
               <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Total Stream Hits</p>
               <h3 className="text-5xl font-serif italic font-black text-white mt-4">{(telemetry.dau * 12.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl grayscale opacity-5 group-hover:opacity-10 transition-opacity select-none">⚡</div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest relative z-10">Sync_Status: NOMINAL</p>
         </div>

         {/* RETENTION METER (MOCK) */}
         <div className="bg-white/[0.02] border border-white/10 p-8 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-[#E8C97A]/40 transition-colors">
            <div className="relative z-10">
               <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Audience Retention</p>
               <h3 className="text-5xl font-serif italic font-black text-white mt-4">84%</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl grayscale opacity-5 group-hover:opacity-10 transition-opacity select-none">🎯</div>
            <div className="h-1 bg-white/5 w-full relative z-10">
               <div className="absolute inset-y-0 left-0 bg-[#E8C97A] w-[84%]" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* TOP WATCHED LIST */}
         <div className="bg-white/[0.02] border border-white/10 p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
               <p className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Top Trending Content</p>
               <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Last 24 Hours</span>
            </div>
            <div className="space-y-4">
               {telemetry.topWatched.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-6 group">
                     <span className="text-[9px] font-mono text-white/10 group-hover:text-[#E8C97A] transition-colors">0{i+1}</span>
                     <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                           <span className="text-white/80">{item.title}</span>
                           <span className="text-[#E8C97A]">{item.views.toLocaleString()} HITS</span>
                        </div>
                        <div className="h-1 bg-white/5 w-full">
                           <div 
                              className="h-full bg-white/20 group-hover:bg-[#E8C97A] transition-all duration-700"
                              style={{ width: `${(item.views / telemetry.topWatched[0].views) * 100}%` }}
                           />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* SYSTEM LOGS / RECENT EVENTS */}
         <div className="bg-white/[0.02] border border-white/10 flex flex-col">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
               <p className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Event Stream</p>
            </div>
            <div className="flex-1 p-8 space-y-6 font-mono text-[10px]">
               {[
                 { time: '18:42:01', event: 'NEW_USER_REGISTERED', origin: '192.168.1.4', status: 'SUCCESS' },
                 { time: '18:39:12', event: 'XP_GRANTED_MANUAL', origin: 'ADMIN_01', status: 'SUCCESS' },
                 { time: '18:35:45', event: 'BROADCAST_ENABLED', origin: 'SYSTEM', status: 'GLOBAL' },
                 { time: '18:30:11', event: 'DATABASE_BACKUP', origin: 'CRON_MASTER', status: 'COMPLETED' },
                 { time: '18:25:04', event: 'USER_LOGIN_STREAK', origin: 'USER_882', status: 'UNLOCKED' },
                 { time: '18:20:59', event: 'CACHE_NODE_PURGED', origin: 'ADMIN_01', status: 'SUCCESS' },
               ].map((log, i) => (
                  <div key={i} className="flex gap-6 border-l border-white/5 pl-6 hover:border-[#E8C97A]/40 transition-colors py-1">
                     <span className="text-white/10 shrink-0">[{log.time}]</span>
                     <div className="flex items-center gap-4">
                        <span className="text-white/60 font-black">{log.event}</span>
                        <span className="text-white/20 lowercase tracking-widest">{log.origin}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 border border-white/10 ${log.status === 'SUCCESS' || log.status === 'COMPLETED' ? 'text-green-500' : 'text-[#E8C97A]'}`}>{log.status}</span>
                     </div>
                  </div>
               ))}
               <div className="pt-8 italic text-white/5 select-none animate-pulse">Waiting for live events...</div>
            </div>
         </div>
      </div>
    </div>
  );
}
