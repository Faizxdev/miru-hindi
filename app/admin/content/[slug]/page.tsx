"use client";
import React, { useState, useEffect } from 'react';
import { animeCacheService, CachedAnime } from '@/lib/animeCacheService';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditContentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  
  const [anime, setAnime] = useState<CachedAnime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadAnime() {
      if (!slug) return;
      const data = await animeCacheService.getCachedAnime(slug);
      if (data) {
        setAnime(data);
      }
      setIsLoading(false);
    }
    loadAnime();
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anime || !slug) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await animeCacheService.saveAnime(slug, anime);
      setMessage({ text: 'Neural metadata overridden successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ text: 'Protocol failure: Unable to write to Firestore.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="w-10 h-10 border-2 border-white/5 border-t-[#E8C97A] rounded-full animate-spin" />
    </div>
  );
  
  if (!anime) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
       <span className="text-4xl grayscale">🔌</span>
       <div className="text-center space-y-1">
          <p className="text-white font-serif text-xl font-black italic">Record Not Found</p>
          <p className="text-content-tertiary text-[10px] uppercase font-bold tracking-widest">The requested entity does not exist.</p>
       </div>
       <Link href="/admin/content" className="px-6 py-3 bg-white/5 border border-white/10 rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Back to Catalog</Link>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
              <Link 
                href="/admin/content" 
                className="w-10 h-10 bg-white/[0.02] border border-white/10 rounded-none flex items-center justify-center hover:bg-[#E8C97A] hover:text-black transition-all group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">Edit Entity</h1>
           </div>
           <p className="text-content-tertiary font-mono text-[9px] tracking-[0.2em] font-bold uppercase pl-13 opacity-40">{slug}</p>
        </div>
      </header>

      {message && (
        <div className={`p-5 rounded-none text-xs font-bold shadow-2xl ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <span className="tracking-wide uppercase font-black">{message.text}</span>
             </div>
             <button onClick={() => setMessage(null)} className="opacity-40 hover:opacity-100 transition-opacity">✕</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visuals */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white/[0.02] border border-white/10 p-6 shadow-2xl space-y-6 overflow-hidden relative">
              <div className="aspect-[2/3] relative rounded-none overflow-hidden bg-black/40 border border-white/5 group shadow-2xl">
                 <img src={anime.image || ''} alt={anime.title || 'Poster'} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">Image Endpoint</label>
                    <input 
                       type="text" 
                       value={anime.image || ''} 
                       onChange={e => setAnime({...anime, image: e.target.value})}
                       className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-none text-[10px] text-white/80 font-mono focus:border-[#E8C97A]/40 transition-all outline-none"
                    />
                 </div>
                 
                 <div className="p-4 bg-white/[0.02] border border-white/5 rounded-none space-y-0.5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">System ID</p>
                    <p className="text-[10px] text-white/60 font-mono font-bold truncate">{anime.postId || 'UNASSIGNED'}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Information Control */}
        <div className="lg:col-span-8 space-y-8">
           <div className="p-8 bg-white/[0.01] border border-white/5 rounded-none space-y-8 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="col-span-2 space-y-3">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] block pl-1">Display Title</label>
                    <input 
                       type="text" 
                       value={anime.title || ''} 
                       onChange={e => setAnime({...anime, title: e.target.value})}
                       className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-none text-xl font-serif italic font-black text-white focus:border-[#E8C97A]/40 transition-all shadow-inner"
                    />
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] block pl-1">Lifecycle Status</label>
                    <div className="relative group/select">
                       <select 
                          value={anime.status || ''} 
                          onChange={e => setAnime({...anime, status: e.target.value})}
                          className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-none text-white font-black uppercase tracking-[0.2em] text-[9px] focus:border-[#E8C97A]/40 appearance-none transition-all shadow-inner cursor-pointer"
                       >
                          <option value="Ongoing" className="text-black">Ongoing Operation</option>
                          <option value="Completed" className="text-black">Completed Project</option>
                          <option value="Airing" className="text-black">Live Broadcast</option>
                          <option value="Finished" className="text-black">Decommissioned</option>
                       </select>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover/select:text-[#E8C97A] transition-colors">
                          ▼
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] block pl-1">Temporal Marker (Year)</label>
                    <input 
                       type="number" 
                       value={anime.year || 0} 
                       onChange={e => setAnime({...anime, year: Number(e.target.value)})}
                       className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-none text-white font-black uppercase tracking-[0.4em] text-sm focus:border-[#E8C97A]/40 transition-all shadow-inner"
                    />
                 </div>
              </div>

              <div className="space-y-3 relative z-10">
                 <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] block pl-1">Abstract Analysis (Synopsis)</label>
                 <textarea 
                    value={anime.synopsis || ''} 
                    onChange={e => setAnime({...anime, synopsis: e.target.value})}
                    rows={6}
                    className="w-full px-8 py-6 bg-black/40 border border-white/10 rounded-none text-white/80 font-medium leading-relaxed text-xs focus:border-[#E8C97A]/40 resize-none shadow-inner"
                    placeholder="Enter entity description..."
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 relative z-10">
                 <button 
                  type="button"
                  onClick={() => setAnime({...anime, isFeatured: !anime.isFeatured})}
                  className={`flex items-center justify-between p-6 border transition-all ${
                    anime.isFeatured 
                      ? 'bg-[#E8C97A]/5 border-[#E8C97A]/30 shadow-lg shadow-[#E8C97A]/5' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                  }`}
                 >
                    <div className="text-left space-y-0.5">
                       <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${anime.isFeatured ? 'text-white' : 'text-white/30'}`}>Spotlight Protocol</p>
                       <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Discovery Banner</p>
                    </div>
                    <div className={`w-10 h-5 relative transition-all ${anime.isFeatured ? 'bg-[#E8C97A]' : 'bg-white/10'}`}>
                       <div className={`absolute top-0.5 w-4 h-4 rounded-none bg-black transition-all ${anime.isFeatured ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                 </button>

                 <button 
                   type="button"
                   onClick={() => setAnime({...anime, isPopular: !anime.isPopular})}
                   className={`flex items-center justify-between p-6 border transition-all ${
                     anime.isPopular 
                       ? 'bg-blue-500/5 border-blue-500/30' 
                       : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                   }`}
                 >
                    <div className="text-left space-y-0.5">
                       <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${anime.isPopular ? 'text-white' : 'text-white/30'}`}>Trend Magnet</p>
                       <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Priority Ranking</p>
                    </div>
                    <div className={`w-10 h-5 relative transition-all ${anime.isPopular ? 'bg-blue-500' : 'bg-white/10'}`}>
                       <div className={`absolute top-0.5 w-4 h-4 rounded-none bg-black transition-all ${anime.isPopular ? 'left-5.5' : 'left-0.5'}`} />
                    </div>
                 </button>
              </div>

              <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 relative z-10">
                 <button 
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 h-14 rounded-none font-black uppercase tracking-[0.3em] text-[10px] transition-all relative overflow-hidden group shadow-2xl ${
                      isSaving 
                        ? 'bg-white/5 text-content-tertiary cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-[#E8C97A] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                 >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                       {isSaving ? (
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                       ) : (
                          <span>COMMIT TO CLUSTER</span>
                       )}
                    </div>
                 </button>
                 
                 <button 
                    type="button"
                    onClick={() => window.open(`/watch?slug=${slug}`, '_blank')}
                    className="px-8 h-14 bg-white/[0.03] border border-white/10 rounded-none text-white font-black uppercase tracking-[0.2em] text-[9px] hover:bg-white/10 transition-all shadow-xl flex items-center justify-center gap-3 group"
                 >
                    Live Preview ↗
                 </button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
