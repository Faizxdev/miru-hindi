"use client";
import React, { useState, useEffect } from 'react';
import { settingsService, SiteSettings } from '@/lib/settingsService';

export default function AdminBroadcastPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState<'info' | 'warning' | 'urgent'>('info');

  useEffect(() => {
    async function load() {
      const s = await settingsService.getSettings();
      setSettings(s);
      setMessage(s.broadcast_message || '');
      setEnabled(s.broadcast_enabled || false);
      setType(s.broadcast_type || 'info');
    }
    load();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const s = await settingsService.getSettings();
      const history = s.broadcast_history || [];
      const newHistory = [...history];

      // Add to history if there was a previous message
      if (s.broadcast_message && s.broadcast_message !== message) {
        newHistory.unshift({
          message: s.broadcast_message,
          type: s.broadcast_type,
          timestamp: Date.now()
        });
      }

      await settingsService.updateSettings({
        broadcast_enabled: enabled,
        broadcast_message: message,
        broadcast_type: type,
        broadcast_history: newHistory.slice(0, 10)
      });
      alert('Announcement settings updated successfully.');
    } catch (e) {
      alert('Failed to update broadcast settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20">
      <header className="space-y-2">
         <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">Announcement Manager</h1>
         <p className="text-content-tertiary font-medium tracking-wide text-[10px] uppercase opacity-40">
           Global announcement & emergency notification system.
         </p>
      </header>

      <div className="bg-white/[0.02] border border-white/10 p-8 space-y-8">
         <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5">
                <div>
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Public Visibility</p>
                   <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Toggle site-wide announcement</p>
                </div>
                <button 
                   onClick={() => setEnabled(!enabled)}
                   className={`w-12 h-6 relative transition-all duration-500 ${enabled ? 'bg-[#E8C97A]' : 'bg-white/10'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-black transition-all duration-300 ${enabled ? 'left-7' : 'left-1'}`} />
                </button>
            </div>

            <div className="space-y-2">
               <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] block pl-1">Message Content</label>
               <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter broadcast content..."
                  className="w-full h-32 px-5 py-4 bg-black/40 border border-white/10 text-white font-mono text-[11px] focus:border-[#E8C97A]/40 outline-none resize-none leading-relaxed"
               />
            </div>

            <div className="grid grid-cols-3 gap-3">
               {(['info', 'warning', 'urgent'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => setType(t)}
                    className={`
                      py-3 text-[9px] font-black uppercase tracking-widest border transition-all
                      ${type === t 
                        ? 'bg-[#E8C97A] border-[#E8C97A] text-black shadow-lg shadow-[#E8C97A]/10' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                      }
                    `}
                  >
                     {t}
                  </button>
               ))}
            </div>
         </div>

         <div className="pt-4">
            <button 
               onClick={handleUpdate}
               disabled={isUpdating}
               className={`
                 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all 
                 ${isUpdating 
                   ? 'bg-white/5 text-white/20' 
                   : 'bg-[#E8C97A] text-black hover:bg-white active:scale-[0.98]'
                 }
               `}
            >
               {isUpdating ? 'SAVING CHANGES...' : 'UPDATE ANNOUNCEMENT'}
            </button>
         </div>
      </div>

      <div className="p-6 bg-[#E8C97A]/5 border border-[#E8C97A]/20">
         <p className="text-[9px] font-black text-[#E8C97A] uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#E8C97A] animate-pulse rounded-full" />
            Live Preview
         </p>
         <div className={`
            p-4 border-l-4 text-[11px] font-bold tracking-wide
            ${type === 'info' ? 'bg-blue-500/10 border-blue-500 text-blue-200' : ''}
            ${type === 'warning' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-200' : ''}
            ${type === 'urgent' ? 'bg-red-500/10 border-red-500 text-red-200' : ''}
         `}>
            {message || 'NO MESSAGE ENTERED'}
         </div>
      </div>
    </div>
  );
}
