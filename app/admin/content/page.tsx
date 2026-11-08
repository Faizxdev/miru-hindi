"use client";
import React, { useState, useEffect } from 'react';
import { animeCacheService, CachedAnime } from '@/lib/animeCacheService';
import Link from 'next/link';

export default function AdminContentPage() {
  const [animes, setAnimes] = useState<CachedAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAnimes() {
      const all = await animeCacheService.getAllCached(100);
      setAnimes(all);
      setIsLoading(false);
    }
    loadAnimes();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      const all = await animeCacheService.getAllCached(100);
      setAnimes(all);
      return;
    }
    setIsLoading(true);
    const results = await animeCacheService.searchCached(searchTerm);
    setAnimes(results);
    setIsLoading(false);
  };

  const handleDelete = async (slug: string) => {
    if (confirm('🚨 PERMANENT DELETE: Are you sure you want to remove this entry from the cache? This will break internal search for this item until re-synced.')) {
      await animeCacheService.deleteCache(slug);
      setAnimes(prev => prev.filter(a => a.id !== slug));
    }
  };

  if (isLoading && animes.length === 0) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
       <div className="w-10 h-10 border-2 border-white/5 border-t-[#E8C97A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2">
           <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">Entity Catalog</h1>
           <p className="text-content-tertiary font-medium tracking-wide max-w-xl leading-relaxed text-[11px] uppercase opacity-40">
              Direct access to the Firestore high-performance cache cluster.
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
           <form onSubmit={handleSearch} className="relative w-full sm:w-80 group">
             <input
               type="text"
               placeholder="Filter sequence..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full px-5 py-3 bg-white/[0.02] border border-white/10 rounded-none focus:outline-none focus:border-[#E8C97A]/40 transition-all pl-10 text-white font-medium text-xs placeholder:text-white/10"
             />
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-[#E8C97A] transition-colors text-xs">🔍</span>
           </form>

           <Link 
             href="/admin/content/sync" 
             className="w-full sm:w-auto px-6 py-3 bg-[#E8C97A] text-black rounded-none font-black uppercase tracking-[0.1em] text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg"
           >
              Bulk Sync Engine
           </Link>
        </div>
      </header>

      <div className="bg-white/[0.01] border border-white/5 rounded-none overflow-hidden relative group/table">
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-white/30 text-[9px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-6 py-4">Node Identity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Vectors</th>
                <th className="px-6 py-4">Telemetry</th>
                <th className="px-6 py-4 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {animes.map((anime) => (
                <tr key={anime.id} className="hover:bg-white/[0.02] transition-colors group/row">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                       <div className="relative w-10 h-14 shrink-0">
                          <img src={anime.image || ''} alt="" className="w-full h-full object-cover rounded-none bg-white/5 grayscale-[0.5] group-hover/row:grayscale-0 transition-all border border-white/5" />
                       </div>
                      <div className="space-y-0.5 max-w-xs">
                        <p className="text-xs font-black text-white group-hover/row:text-[#E8C97A] transition-colors line-clamp-1">{anime.title}</p>
                        <p className="text-[8px] text-white/20 font-mono font-bold tracking-widest uppercase">{anime.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-none border text-[8px] font-black uppercase tracking-widest ${
                      anime.status === 'Ongoing' 
                        ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                        : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                    }`}>
                       <span className={`w-1 h-1 rounded-full ${anime.status === 'Ongoing' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`} />
                       {anime.status || 'OFFLINE'}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-white italic">{anime.episodes?.length || 0}</span>
                       <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Cached</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-white/60">{new Date(anime.lastFetched).toLocaleDateString()}</span>
                       <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-0.5">{new Date(anime.lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all">
                      <Link 
                        href={`/admin/content/${anime.id}`}
                        className="p-2 bg-white/[0.03] hover:bg-[#E8C97A] text-white hover:text-black border border-white/5 rounded-none transition-all shadow-xl active:scale-95"
                        title="Edit Node"
                      >
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                         </svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(anime.id)}
                        className="p-2 bg-white/[0.03] hover:bg-red-500 text-white border border-white/5 rounded-none transition-all shadow-xl active:scale-95"
                        title="Purge"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m3 3h4M3 7h16" />
                         </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {animes.length === 0 && !isLoading && (
            <div className="p-20 text-center space-y-6 group/empty">
               <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-none flex items-center justify-center mx-auto text-3xl shadow-2xl">
                 📁
               </div>
               <div className="space-y-1">
                 <h3 className="text-xl font-serif font-black text-white italic">Vault Empty</h3>
                 <p className="text-content-tertiary font-medium tracking-wide text-[10px] uppercase opacity-40">
                    No active records found in cluster.
                 </p>
               </div>
               <Link href="/admin/content/sync" className="inline-block px-8 py-3 bg-white/[0.05] hover:bg-white text-white hover:text-black border border-white/10 rounded-none font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all">
                  Initialize Sync
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
