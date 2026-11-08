"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { SettingsProvider } from '@/contexts/SettingsContext';

const navItems = [
  { name: 'Terminal', path: '/admin', emoji: '📟' },
  { name: 'Catalog', path: '/admin/content', emoji: '📁' },
  { name: 'Sync Engine', path: '/admin/content/sync', emoji: '📡' },
  { name: 'Users', path: '/admin/users', emoji: '👥' },
  { name: 'Broadcast', path: '/admin/broadcast', emoji: '📢' },
  { name: 'Analytics', path: '/admin/analytics', emoji: '📈' },
  { name: 'Vault Config', path: '/admin/settings', emoji: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SettingsProvider>
      <AdminGuard>
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#E8C97A]/30">
          {/* Global Cinematic Background */}
          <div 
            className="fixed inset-0 pointer-events-none z-0"
            style={{ 
              backgroundImage: 'url("/Background.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15
            }}
          />
          <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-0" />

          <div className="flex relative z-10">
            {/* COMPACT SIDEBAR */}
            <aside className="w-64 h-screen sticky top-0 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col group transition-all duration-500">
               <div className="p-8 border-b border-white/5">
                  <Link href="/" className="flex items-center gap-3 group/logo">
                     <div className="w-8 h-8 relative">
                        <img src="/Logo.jpg" alt="Logo" className="object-contain" />
                     </div>
                     <p className="text-sm font-black tracking-[0.2em] uppercase group-hover/logo:text-accent transition-colors">MIRU <span className="text-accent">HINDI</span></p>
                  </Link>
               </div>

               <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link 
                        key={item.path} 
                        href={item.path}
                        className={`
                          flex items-center gap-4 px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all 
                          ${isActive 
                            ? 'bg-[#E8C97A] text-black shadow-lg shadow-[#E8C97A]/10' 
                            : 'text-white/40 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                         <span className={`text-base grayscale-[0.5] ${isActive ? 'grayscale-0' : ''}`}>{item.emoji}</span>
                         {item.name}
                      </Link>
                    );
                  })}
               </nav>

               <div className="p-8 border-t border-white/5 bg-black/20">
                  <div className="flex flex-col gap-1">
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Operator Access</p>
                     <p className="text-[10px] font-bold text-[#E8C97A] truncate">ADMIN_LEVEL_01</p>
                  </div>
               </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 min-h-screen">
               <div className="p-10 max-w-7xl mx-auto">
                  {children}
               </div>
            </main>
          </div>
        </div>
      </AdminGuard>
    </SettingsProvider>
  );
}
