"use client";
import React, { useState, useEffect } from 'react';
import { settingsService, SiteSettings } from '@/lib/settingsService';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const s = await settingsService.getSettings();
      setSettings(s);
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await settingsService.updateSettings(settings);
      setMessage({ text: 'System configuration updated successfully.', type: 'success' });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ text: 'Update failed: Unable to save configuration.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-[400px] flex items-center justify-center">
       <div className="w-10 h-10 border-2 border-white/5 border-t-[#E8C97A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
           <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">Site Configuration</h1>
           <p className="text-content-tertiary font-medium tracking-wide max-w-xl text-[10px] uppercase opacity-40">
             Configure core site parameters via the Firestore dynamic layer.
           </p>
        </div>
      </header>

      {message && (
        <div className={`p-5 rounded-none text-xs font-bold shadow-2xl ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <span className="tracking-wide uppercase font-black">{message.text}</span>
             </div>
             <button onClick={() => setMessage(null)} className="opacity-40 hover:opacity-100 transition-opacity">✕</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-8 bg-white/[0.01] border border-white/5 rounded-none space-y-8 shadow-2xl relative overflow-hidden">
           {/* Section: API Endpoints */}
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white/40 border-b border-white/5 pb-4">
                 <span className="text-lg">🔌</span>
                 <h2 className="text-[9px] font-black uppercase tracking-[0.4em]">Infrastructure</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">Primary Scrape Target (SITE_BASE)</label>
                    <input
                      type="text"
                      value={settings?.site_base || ''}
                      onChange={e => setSettings(prev => prev ? { ...prev, site_base: e.target.value } : null)}
                      placeholder="https://example.com"
                      className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-none text-white font-mono text-[10px] focus:border-[#E8C97A]/40 transition-all outline-none"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">TMDB API Integration Key</label>
                    <input
                      type="text"
                      value={settings?.tmdb_api_key || ''}
                      onChange={e => setSettings(prev => prev ? { ...prev, tmdb_api_key: e.target.value } : null)}
                      placeholder="API_KEY_HIDDEN"
                      className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-none text-white font-mono text-[10px] focus:border-[#E8C97A]/40 transition-all outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Section: Feature Visibility */}
           <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 text-white/40 border-b border-white/5 pb-4">
                 <span className="text-lg">🎭</span>
                 <h2 className="text-[9px] font-black uppercase tracking-[0.4em]">Feature Access</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button
                    type="button"
                    onClick={() => setSettings(prev => prev ? { ...prev, hide_schedule: !prev.hide_schedule } : null)}
                    className={`flex items-center justify-between p-6 border transition-all rounded-none ${
                      settings?.hide_schedule 
                        ? 'bg-red-500/5 border-red-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                    }`}
                 >
                    <div className="text-left space-y-0.5">
                       <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${settings?.hide_schedule ? 'text-red-400' : 'text-white/30'}`}>Global Schedule</p>
                       <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{settings?.hide_schedule ? 'DISABLED' : 'ACTIVE'}</p>
                    </div>
                    <div className={`w-8 h-4 relative transition-all ${settings?.hide_schedule ? 'bg-red-500' : 'bg-white/10'}`}>
                       <div className={`absolute top-0.5 w-3 h-3 bg-black transition-all ${settings?.hide_schedule ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                 </button>

                 <button
                    type="button"
                    onClick={() => setSettings(prev => prev ? { ...prev, hide_upcoming: !prev.hide_upcoming } : null)}
                    className={`flex items-center justify-between p-6 border transition-all rounded-none ${
                      settings?.hide_upcoming 
                        ? 'bg-orange-500/5 border-orange-500/30' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/20'
                    }`}
                 >
                    <div className="text-left space-y-0.5">
                       <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${settings?.hide_upcoming ? 'text-orange-400' : 'text-white/30'}`}>Upcoming Feed</p>
                       <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">{settings?.hide_upcoming ? 'DISABLED' : 'ACTIVE'}</p>
                    </div>
                    <div className={`w-8 h-4 relative transition-all ${settings?.hide_upcoming ? 'bg-orange-500' : 'bg-white/10'}`}>
                       <div className={`absolute top-0.5 w-3 h-3 bg-black transition-all ${settings?.hide_upcoming ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                 </button>
              </div>
           </div>

           <div className="pt-4 relative z-10">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-5 rounded-none font-black uppercase tracking-[0.3em] text-[10px] transition-all relative overflow-hidden group shadow-2xl ${
                  isSaving 
                    ? 'bg-white/5 text-content-tertiary cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-[#E8C97A] hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-4">
                    {isSaving ? (
                       <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                       <span>SAVE CONFIGURATION</span>
                    )}
                </div>
              </button>
           </div>
        </div>
        
        <div className="p-6 bg-white/[0.01] border border-white/5 rounded-none flex items-center justify-center gap-4">
           <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">System V2.0.4 • Firebase Dynamic Config</p>
        </div>
      </form>
    </div>
  );
}
