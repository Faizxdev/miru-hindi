'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService, UserProfile, RANKS } from '@/lib/userDataService';
import NewNavbar from '@/components/NewNavbar';
import NewBottomNav from '@/components/NewBottomNav';
import DesktopNav from '@/components/DesktopNav';
import Link from 'next/link';
import { getRandomAnimeAvatar } from '@/lib/animeAvatars';

type LeaderboardUser = UserProfile & { position: number };

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await userDataService.getGlobalLeaderboard(50);
      setLeaderboard(data);
      
      if (user) {
        const pos = data.findIndex(u => u.uid === user.uid);
        setUserPosition(pos !== -1 ? pos + 1 : null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankInfo = (xp: number) => userDataService.calculateRank(xp);

  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return '👑';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  const getMedalGlow = (pos: number) => {
    if (pos === 1) return 'ring-2 ring-yellow-400/50 shadow-[0_0_40px_rgba(250,204,21,0.15)]';
    if (pos === 2) return 'ring-2 ring-slate-300/30 shadow-[0_0_30px_rgba(148,163,184,0.1)]';
    if (pos === 3) return 'ring-2 ring-amber-600/30 shadow-[0_0_30px_rgba(217,119,6,0.1)]';
    return '';
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans selection:bg-accent/30 selection:text-white pb-32">
      <NewNavbar />
      <DesktopNav />
      
      <main className="max-w-[1000px] mx-auto px-6 py-12 space-y-12 pt-24 md:pt-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <span className="text-2xl">🏆</span>
            <span className="text-accent text-[11px] font-black uppercase tracking-[0.3em]">Global Rankings</span>
          </div>
          <h1 className="section-heading text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Leaderboard
          </h1>
          <p className="section-subtitle text-lg max-w-md mx-auto">
            The top otaku in the Miru Hindi community. Watch more to climb the ranks!
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse h-20 bg-bg-surface border border-border-subtle rounded-2xl" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="text-6xl">🏜️</div>
            <h2 className="section-heading text-2xl">No Rankings Yet</h2>
            <p className="section-subtitle">Be the first to earn XP and claim the #1 spot!</p>
            <Link href="/" className="btn-primary inline-flex px-10 h-12 items-center rounded-2xl">
              Start Watching
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 md:gap-6 items-end">
                {/* 2nd Place */}
                <div className="flex flex-col items-center space-y-3 pt-6">
                  <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-2 border-slate-400/30 ${getMedalGlow(2)}`}>
                    <img
                      src={getRandomAnimeAvatar(leaderboard[1].uid)}
                      alt={leaderboard[1].displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -top-1 -left-1 w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-content-primary font-bold text-sm truncate max-w-[100px]">{leaderboard[1].displayName || 'Anonymous'}</p>
                    <p className="text-content-tertiary text-[11px] font-bold">{Math.round(leaderboard[1].stats?.xp || 0).toLocaleString()} XP</p>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 inline-block"
                      style={{ backgroundColor: `${getRankInfo(leaderboard[1].stats?.xp || 0).color}20`, color: getRankInfo(leaderboard[1].stats?.xp || 0).color }}
                    >
                      {leaderboard[1].stats?.rank || 'Newbie'}
                    </span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-4xl mb-1">👑</div>
                  <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-2 border-yellow-400/40 ${getMedalGlow(1)}`}>
                    <img
                      src={getRandomAnimeAvatar(leaderboard[0].uid)}
                      alt={leaderboard[0].displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -top-1 -left-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-black shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-content-primary font-bold text-base truncate max-w-[120px]">{leaderboard[0].displayName || 'Anonymous'}</p>
                    <p className="text-accent text-sm font-bold">{Math.round(leaderboard[0].stats?.xp || 0).toLocaleString()} XP</p>
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 inline-block"
                      style={{ backgroundColor: `${getRankInfo(leaderboard[0].stats?.xp || 0).color}20`, color: getRankInfo(leaderboard[0].stats?.xp || 0).color }}
                    >
                      {leaderboard[0].stats?.rank || 'Newbie'}
                    </span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center space-y-3 pt-10">
                  <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-2 border-amber-600/30 ${getMedalGlow(3)}`}>
                    <img
                      src={getRandomAnimeAvatar(leaderboard[2].uid)}
                      alt={leaderboard[2].displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute -top-1 -left-1 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-content-primary font-bold text-sm truncate max-w-[100px]">{leaderboard[2].displayName || 'Anonymous'}</p>
                    <p className="text-content-tertiary text-[11px] font-bold">{Math.round(leaderboard[2].stats?.xp || 0).toLocaleString()} XP</p>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 inline-block"
                      style={{ backgroundColor: `${getRankInfo(leaderboard[2].stats?.xp || 0).color}20`, color: getRankInfo(leaderboard[2].stats?.xp || 0).color }}
                    >
                      {leaderboard[2].stats?.rank || 'Newbie'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Your Position Card */}
            {user && userPosition && (
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center gap-5">
                <div className="text-accent text-2xl font-black">#{userPosition}</div>
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-accent/30">
                  <img src={getRandomAnimeAvatar(user.uid)} alt="You" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-content-primary font-bold">{user.displayName || 'You'}</p>
                  <p className="text-accent text-xs font-bold">Your Current Position</p>
                </div>
                <Link href="/profile" className="btn-outline px-4 py-2 rounded-xl text-xs">
                  View Profile
                </Link>
              </div>
            )}

            {user && !userPosition && (
              <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-center gap-5">
                <div className="text-content-tertiary text-2xl">🎯</div>
                <div className="flex-1">
                  <p className="text-content-primary font-bold">You&apos;re not on the board yet!</p>
                  <p className="text-content-tertiary text-xs">Watch anime to earn XP and climb the rankings</p>
                </div>
                <Link href="/" className="btn-primary px-4 py-2 rounded-xl text-xs">
                  Start Watching
                </Link>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">Full Rankings</h2>
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const rankInfo = getRankInfo(entry.stats?.xp || 0);
                  const isCurrentUser = user?.uid === entry.uid;
                  const watchHours = Math.floor((entry.stats?.totalMinutesWatched || 0) / 60);
                  const watchMins = Math.round((entry.stats?.totalMinutesWatched || 0) % 60);

                  return (
                    <div
                      key={entry.uid}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
                        isCurrentUser
                          ? 'bg-accent/5 border-accent/30 ring-1 ring-accent/20'
                          : 'bg-bg-surface border-border-subtle hover:border-accent/20'
                      } ${getMedalGlow(entry.position)}`}
                    >
                      {/* Rank Number */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                        entry.position <= 3 ? 'text-2xl' : 'bg-bg-elevated text-content-tertiary border border-border-subtle'
                      }`}>
                        {getMedalEmoji(entry.position)}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border-subtle shrink-0">
                        <img
                          src={getRandomAnimeAvatar(entry.uid)}
                          alt={entry.displayName || 'User'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold truncate ${isCurrentUser ? 'text-accent' : 'text-content-primary'}`}>
                            {entry.displayName || 'Anonymous Otaku'}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent/20 text-accent rounded-full border border-accent/20 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10"
                            style={{ backgroundColor: `${rankInfo.color}20`, color: rankInfo.color }}
                          >
                            {entry.stats?.rank || 'Newbie'}
                          </span>
                          <span className="text-content-tertiary text-[10px] font-medium">
                            {watchHours > 0 ? `${watchHours}h ${watchMins}m watched` : `${watchMins}m watched`}
                          </span>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-serif ${isCurrentUser ? 'text-accent' : 'text-content-primary'}`}>
                          {Math.round(entry.stats?.xp || 0).toLocaleString()}
                        </p>
                        <p className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rank Guide */}
            <div className="space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">Rank Tiers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {RANKS.map((r) => (
                  <div key={r.name} className="p-4 bg-bg-surface border border-border-subtle rounded-2xl text-center space-y-2 hover:border-accent/20 transition-all">
                    <div 
                      className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${r.color}20`, color: r.color }}
                    >
                      ✦
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-content-primary">{r.name}</div>
                    <div className="text-[9px] font-bold text-content-tertiary">{r.minXP.toLocaleString()} XP</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <NewBottomNav />
    </div>
  );
}
