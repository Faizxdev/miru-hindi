"use client";
import React, { useState, useEffect } from 'react';
import { settingsService } from '@/lib/settingsService';

export default function BroadcastBanner() {
  const [data, setData] = useState<{ enabled: boolean; message: string; type: string } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await settingsService.getSettings();
      if (s.broadcast_enabled && s.broadcast_message) {
        setData({
          enabled: true,
          message: s.broadcast_message,
          type: s.broadcast_type || 'info'
        });
      }
    }
    load();
  }, []);

  if (!data || !data.enabled || !isVisible) return null;

  const bgStyles = {
    info: 'bg-gradient-to-r from-blue-600/90 to-blue-800/90 border-blue-400/30',
    warning: 'bg-gradient-to-r from-amber-600/90 to-amber-700/90 border-amber-400/30',
    urgent: 'bg-gradient-to-r from-red-600/90 to-red-800/90 border-red-400/30'
  };

  const icon = {
    info: '💡',
    warning: '⚠️',
    urgent: '🚨'
  };

  return (
    <div className={`
      relative z-[60] py-1.5 px-6 border-b 
      overflow-hidden transition-all duration-500
      ${bgStyles[data.type as keyof typeof bgStyles]}
    `}>
      {/* Animated Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
           <span className="text-sm scale-110">{icon[data.type as keyof typeof icon]}</span>
           <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest leading-none">
              {data.message}
           </p>
        </div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/40 hover:text-white transition-colors p-1"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
