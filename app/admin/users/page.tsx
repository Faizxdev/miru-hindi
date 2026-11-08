"use client";
import React, { useState, useEffect } from 'react';
import { userDataService, UserProfile, RANKS } from '@/lib/userDataService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grantAmount, setGrantAmount] = useState(500);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isOperating, setIsOperating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setIsLoading(true);
    const results = await userDataService.getAllUsers(50);
    setUsers(results);
    setIsLoading(false);
  }

  const handleGrantXP = async (uid: string) => {
    setIsOperating(true);
    try {
      await userDataService.grantManualXP(uid, grantAmount);
      // Refresh user list to see updated XP
      await loadUsers();
      alert('XP Granted successfully.');
    } catch (e) {
      alert('Failed to grant XP.');
    } finally {
      setIsOperating(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <h1 className="text-3xl font-serif font-black tracking-tighter text-white italic">User Management</h1>
           <p className="text-content-tertiary font-medium tracking-wide max-w-xl text-[10px] uppercase opacity-40">
             Monitor community growth and manage user attributes.
           </p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white/5 border border-white/10 px-4 py-2 flex flex-col items-end">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Global Population</p>
              <p className="text-xl font-serif italic font-black text-[#E8C97A]">{users.length}</p>
           </div>
        </div>
      </header>

      <div className="bg-white/[0.02] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Level & Rank</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Total XP</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Last Activity</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-6 h-6 border-2 border-[#E8C97A]/20 border-t-[#E8C97A] rounded-full animate-spin" />
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center">Decrypting User Data...</p>
                      </div>
                   </td>
                </tr>
              ) : users.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-[10px] text-white/20 uppercase font-black tracking-widest italic">
                       No inhabitants detected in the cluster.
                    </td>
                 </tr>
              ) : (
                users.map((u) => {
                  const rankInfo = RANKS.find(r => r.name === u.stats?.rank) || RANKS[0];
                  return (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-black/40 border border-white/10 overflow-hidden relative">
                             {u.photoURL ? (
                               <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/20 uppercase">
                                  {u.displayName?.charAt(0) || '?'}
                               </div>
                             )}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white truncate max-w-[150px]">{u.displayName}</p>
                            <p className="text-[9px] text-white/30 font-medium truncate max-w-[150px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-white flex items-center gap-2">
                             LEVEL {u.stats?.level || 1}
                             <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rankInfo.color }} />
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: rankInfo.color }}>{u.stats?.rank || 'Newbie'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-[11px] font-mono text-[#E8C97A] font-black">{u.stats?.xp?.toLocaleString() || 0} XP</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                           {u.lastLoginDate || 'NEVER'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           {selectedUser === u.uid ? (
                              <div className="flex items-center gap-2 bg-black border border-white/10 p-1 pr-2">
                                 <input 
                                    type="number" 
                                    value={grantAmount} 
                                    onChange={e => setGrantAmount(Number(e.target.value))}
                                    className="w-20 bg-transparent text-right text-[10px] font-black text-[#E8C97A] outline-none"
                                 />
                                 <button 
                                    onClick={() => handleGrantXP(u.uid)}
                                    disabled={isOperating}
                                    className="text-[9px] font-black text-green-500 uppercase hover:text-white"
                                 >
                                    CONFIRM
                                 </button>
                                 <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="text-[9px] font-black text-red-500 uppercase hover:text-white"
                                 >
                                    CANCEL
                                 </button>
                              </div>
                           ) : (
                              <button 
                                onClick={() => setSelectedUser(u.uid)}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-[#E8C97A] hover:text-black transition-all"
                              >
                                Grant XP
                              </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
