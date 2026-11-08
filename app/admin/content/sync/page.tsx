"use client";
import React, { useState, useEffect, useRef } from 'react';
import { animeCacheService } from '@/lib/animeCacheService';
import { settingsService, SiteSettings } from '@/lib/settingsService';

export default function AdminSyncPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [deepSync, setDeepSync] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [authKey, setAuthKey] = useState('');
  const [targetPages, setTargetPages] = useState(1);
  const [targetCategory, setTargetCategory] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const s = await settingsService.getSettings();
      setSiteSettings(s);
    }
    load();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSync = async () => {
    if (!authKey) {
        alert('Please enter your Secret Auth Key.');
        return;
    }
    setIsSyncing(true);
    setLogs([]);
    addLog(`STARTING SYNC: CATEGORY=${targetCategory.toUpperCase()}, PAGES=${targetPages}, DEEP_SCAN=${deepSync}`);

    try {
      const response = await fetch('/api/admin/bulk-sync', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authKey}`
        },
        body: JSON.stringify({ 
          pages: targetPages, 
          deepSync,
          category: targetCategory === 'all' ? undefined : targetCategory
        })
      });

      if (!response.ok) {
        throw new Error(`Synchronization failure with status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to open stream reader.');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.log) addLog(data.log);
            if (data.progress) {
              setProgress({
                current: data.progress.current,
                total: data.progress.total,
                percentage: Math.round((data.progress.current / data.progress.total) * 100)
              });
            }
          } catch (e) {
            addLog(line);
          }
        }
      }
      addLog('SYNC COMPLETED SUCCESSFULLY');
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearCache = async () => {
    if (confirm('🚨 DANGER: This will purge ALL cached data from Firestore. This action is irreversible. Proceed?')) {
       addLog('PURGING_CACHE: INITIATING_DESTRUCTION...');
       const results = await animeCacheService.getAllCached(10000);
       for (const a of results) {
          await animeCacheService.deleteCache(a.id);
          addLog(`PURGED: ${a.id}`);
       }
       addLog('PURGE_COMPLETE: CLUSTER_ZEROED');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">Sync Engine</h1>
           <p className="text-content-tertiary font-medium tracking-wide max-w-xl text-[10px] uppercase opacity-40">
             High-performance data ingestion & cache synchronization toolkit.
           </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* CONTROL PANEL */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-white/[0.02] border border-white/10 p-6 space-y-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">Secret Auth Token</label>
                    <input 
                       type="password" 
                       value={authKey}
                       onChange={e => setAuthKey(e.target.value)}
                       placeholder="Enter Bearer Token"
                       className="w-full px-5 py-3 bg-black/40 border border-white/10 text-white font-mono text-[10px] focus:border-[#E8C97A]/40 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">Page Depth</label>
                       <input 
                         type="number" 
                         value={targetPages}
                         onChange={e => setTargetPages(Number(e.target.value))}
                         className="w-full px-5 py-3 bg-black/40 border border-white/10 text-white font-black text-xs outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">Category</label>
                       <select 
                         value={targetCategory}
                         onChange={e => setTargetCategory(e.target.value)}
                         className="w-full px-4 py-3 bg-black/40 border border-white/10 text-white font-black uppercase text-[9px] tracking-widest outline-none appearance-none"
                       >
                          <option value="all">Global</option>
                          <option value="anime-series">Series</option>
                          <option value="anime-movies">Movies</option>
                          <option value="completed-anime">Completed</option>
                       </select>
                    </div>
                 </div>

                 <button
                    onClick={() => setDeepSync(!deepSync)}
                    className={`w-full flex items-center justify-between p-4 border transition-all ${
                        deepSync ? 'bg-[#E8C97A]/5 border-[#E8C97A]' : 'bg-black/20 border-white/5'
                    }`}
                 >
                    <div className="text-left">
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Deep Player Cache</p>
                       <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Prefetch all episode links</p>
                    </div>
                    <div className={`w-8 h-4 relative transition-all ${deepSync ? 'bg-[#E8C97A]' : 'bg-white/10'}`}>
                       <div className={`absolute top-0.5 w-3 h-3 bg-black transition-all ${deepSync ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                 </button>
              </div>

              <div className="pt-4 space-y-3">
                 <button 
                   onClick={handleSync}
                   disabled={isSyncing}
                   className={`w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl ${
                     isSyncing ? 'bg-white/5 text-white/20' : 'bg-[#E8C97A] text-black hover:bg-white'
                   }`}
                 >
                    {isSyncing ? 'SYNCHRONIZING...' : 'START SYNCHRONIZATION'}
                 </button>
                 <button 
                   onClick={clearCache}
                   disabled={isSyncing}
                   className="w-full py-4 bg-white/[0.03] text-white/40 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all"
                 >
                    Clear Cache Cluster
                 </button>
              </div>
           </div>
        </div>

        {/* TERMINAL OUTPUT */}
        <div className="xl:col-span-8 flex flex-col h-[600px]">
           <div className="bg-black/60 border border-white/10 flex-1 flex flex-col overflow-hidden relative group/terminal">
              <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                       <div className="w-2 h-2 bg-red-500/40" />
                       <div className="w-2 h-2 bg-orange-500/40" />
                       <div className="w-2 h-2 bg-green-500/40" />
                    </div>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Live Monitoring Console</p>
                 </div>
                 {isSyncing && <div className="text-[8px] font-black text-[#E8C97A] animate-pulse tracking-widest">SYNCING_ACTIVE</div>}
              </div>

              <div ref={scrollRef} className="flex-1 p-6 font-mono text-[10px] space-y-1.5 overflow-y-auto custom-scrollbar-minimal bg-[#050505]">
                 {logs.length === 0 && <p className="text-white/10 italic select-none">Waiting for synchronization to start...</p>}
                 {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 border-l border-white/5 pl-4 hover:border-[#E8C97A]/40 transition-colors">
                       <span className="text-white/10 shrink-0 select-none">[{i.toString().padStart(4, '0')}]</span>
                       <span className={`break-all ${log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('COMPLETED') ? 'text-green-400' : 'text-white/60'}`}>{log}</span>
                    </div>
                 ))}
              </div>

              {isSyncing && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-4">
                   <div className="flex justify-between text-[9px] font-black text-white/40 uppercase tracking-widest mb-3 pr-2">
                      <span>Progress Status: {progress.percentage}%</span>
                      <span>Item {progress.current} of {progress.total}</span>
                   </div>
                   <div className="h-1 bg-white/5 w-full relative overflow-hidden">
                      <div 
                         className="absolute inset-y-0 left-0 bg-[#E8C97A] transition-all duration-300"
                         style={{ width: `${progress.percentage}%` }}
                      />
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
