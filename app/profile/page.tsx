'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService, UserProfile, RANKS } from '@/lib/userDataService';
import { ACHIEVEMENTS, getCurrentWeekChallenge } from '@/lib/achievements';
import NewNavbar from '@/components/NewNavbar';
import NewBottomNav from '@/components/NewBottomNav';
import DesktopNav from '@/components/DesktopNav';
import Link from 'next/link';
import { getRandomAnimeAvatar } from '@/lib/animeAvatars';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [profile, userStats] = await Promise.all([
        userDataService.getUserProfile(user.uid),
        userDataService.getUserStats(user.uid)
      ]);
      setUserProfile(profile);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-bg-base font-sans mt-20 md:mt-0">
        <NewNavbar />
        <DesktopNav />
        <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-16 pt-24 md:pt-12">
          {!user && !isLoading ? (
            <div className="max-w-screen-xl mx-auto px-4 py-32 text-center space-y-8">
              <div className="w-24 h-24 bg-bg-surface border border-border-subtle rounded-full flex items-center justify-center mx-auto text-content-tertiary">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="space-y-4">
                <h1 className="section-heading text-4xl">Your Profile</h1>
                <p className="section-subtitle text-lg">Sign in to track your stats and unlock ranks</p>
              </div>
              <Link href="/signin" className="btn-primary inline-flex px-12 h-14 items-center rounded-2xl shadow-2xl shadow-accent/20">
                Sign In to Continue
              </Link>
            </div>
          ) : (
            <div className="animate-pulse space-y-12">
              <div className="h-64 bg-bg-surface border border-border-subtle rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="h-40 bg-bg-surface border border-border-subtle rounded-3xl" />
                <div className="h-40 bg-bg-surface border border-border-subtle rounded-3xl" />
                <div className="h-40 bg-bg-surface border border-border-subtle rounded-3xl" />
              </div>
            </div>
          )}
        </main>
        <NewBottomNav />
      </div>
    );
  }

  const rankInfo = stats ? userDataService.calculateRank(stats.xp) : null;
  const isPremium = userProfile?.tier === 'premium';
  const weeklyChallenge = getCurrentWeekChallenge();
  const weeklyProgress = userProfile?.weeklyProgress;
  const unlockedAchievements = userProfile?.achievements || [];

  // Calculate weekly challenge current value
  let weeklyCurrent = 0;
  if (weeklyProgress?.weekId === weeklyChallenge.weekId) {
    if (weeklyChallenge.type === 'episodes') weeklyCurrent = weeklyProgress.episodes;
    else if (weeklyChallenge.type === 'minutes') weeklyCurrent = weeklyProgress.minutesWatched;
    else if (weeklyChallenge.type === 'list_adds') weeklyCurrent = weeklyProgress.listAdds;
  }
  const weeklyPercent = Math.min(100, (weeklyCurrent / weeklyChallenge.target) * 100);
  const weeklyCompleted = weeklyProgress?.completed && weeklyProgress?.weekId === weeklyChallenge.weekId;

  return (
    <div className="min-h-screen bg-bg-base font-sans selection:bg-accent/30 selection:text-white pb-32">
      <NewNavbar />
      <DesktopNav />
      
      <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 pt-24 md:pt-12">
        {/* Header Section */}
        <div 
          className="relative border border-border-subtle p-8 md:p-12 rounded-[40px] overflow-hidden group"
          style={{ background: `linear-gradient(135deg, ${userProfile?.bannerColor || '#6366f1'}08, transparent 60%)` }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${userProfile?.bannerColor || '#6366f1'}10` }} />
          
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar & Rank Plate */}
            <div className="relative shrink-0">
              <div 
                className="w-32 h-32 md:w-40 md:h-40 p-1.5 rounded-[40px] shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${userProfile?.bannerColor || 'var(--accent)'}, transparent)` }}
              >
                <img
                  src={getRandomAnimeAvatar(user.uid)}
                  alt={user.displayName || 'User'}
                  className="w-full h-full rounded-[35px] object-cover border-4 border-bg-surface shadow-inner"
                />
              </div>
              <div 
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full border border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: `${rankInfo?.color}20`, borderColor: `${rankInfo?.color}40` }}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">Rank</span>
                <span className="text-[12px] font-bold text-white uppercase" style={{ color: rankInfo?.color }}>
                  {rankInfo?.name || 'Newbie'}
                </span>
              </div>
            </div>

            {/* Info & Progress */}
            <div className="flex-1 text-center md:text-left space-y-6 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="section-heading text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight">
                    {userProfile?.displayName || user.displayName || 'Anime Legend'}
                  </h1>
                  {isPremium && (
                    <span className="text-yellow-400 text-lg" title="Premium">✦</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                    isPremium ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-bg-elevated text-content-tertiary border-border-subtle'
                  }`}>
                    {isPremium ? '✦ Premium' : 'Free Tier'}
                  </span>
                  {userProfile?.bio && (
                    <span className="text-content-secondary text-xs">{userProfile.bio}</span>
                  )}
                </div>
                {/* Favorite Genres */}
                {(userProfile?.favoriteGenres || []).length > 0 && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                    {userProfile!.favoriteGenres!.map(g => (
                      <span key={g} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-3 max-w-xl mx-auto md:mx-0">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-content-tertiary">Current XP</div>
                    <div className="text-2xl font-serif text-accent">{Math.round(stats?.xp || 0).toLocaleString()}</div>
                  </div>
                  {rankInfo?.nextRank && (
                    <div className="text-right space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-content-tertiary">Next: {rankInfo.nextRank.name}</div>
                      <div className="text-xs font-bold text-content-secondary">
                        {(rankInfo.nextRank.minXP - Math.round(stats?.xp || 0)).toLocaleString()} XP to go
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-3 w-full bg-bg-base/50 rounded-full overflow-hidden border border-border-subtle/30 shadow-inner">
                  <div 
                    className="h-full shadow-lg transition-all duration-1000 ease-out relative rounded-full"
                    style={{ width: `${Math.round(rankInfo?.progressToNext || 0)}%`, backgroundColor: rankInfo?.color }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-transparent animate-shimmer rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex md:flex-col gap-3">
              <Link
                href="/profile/edit"
                className="h-12 px-6 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-accent hover:text-white transition-all duration-500 flex items-center justify-center"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="h-12 px-6 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Login Streak & Weekly Challenge Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Streak */}
          <div className="bg-bg-surface border border-border-subtle p-7 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-content-tertiary">Login Streak</div>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-serif text-content-primary">{userProfile?.loginStreak || 0}</span>
              <span className="text-content-tertiary text-sm font-bold mb-1">days</span>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    i < ((userProfile?.loginStreak || 0) % 7 || 7)
                      ? 'bg-orange-400'
                      : 'bg-bg-elevated'
                  }`}
                />
              ))}
            </div>
            <p className="text-content-tertiary text-[10px] font-bold">
              {((userProfile?.loginStreak || 0) % 7 === 0) ? '🎉 Weekly bonus earned!' : `${7 - ((userProfile?.loginStreak || 0) % 7)} days until weekly bonus`}
            </p>
          </div>

          {/* Weekly Challenge */}
          <div className={`border p-7 rounded-3xl space-y-4 ${
            weeklyCompleted ? 'bg-green-500/5 border-green-500/20' : 'bg-bg-surface border-border-subtle'
          }`}>
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-content-tertiary">Weekly Challenge</div>
              <span className="text-2xl">{weeklyCompleted ? '✅' : '🎯'}</span>
            </div>
            <div>
              <h3 className="text-content-primary font-bold text-lg">{weeklyChallenge.name}</h3>
              <p className="text-content-tertiary text-xs">{weeklyChallenge.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-content-tertiary">{Math.round(weeklyCurrent)} / {weeklyChallenge.target}</span>
                <span className={weeklyCompleted ? 'text-green-400' : 'text-accent'}>{Math.round(weeklyPercent)}%</span>
              </div>
              <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${weeklyCompleted ? 'bg-green-400' : 'bg-accent'}`}
                  style={{ width: `${weeklyPercent}%` }}
                />
              </div>
              <p className="text-content-tertiary text-[10px]">Reward: <span className="text-accent font-bold">{weeklyChallenge.xpReward} XP</span></p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Watch Time', value: `${Math.round((stats?.totalMinutesWatched || 0) / 60)}h ${Math.round((stats?.totalMinutesWatched || 0) % 60)}m`, icon: '⏱️' },
            { label: 'In Library', value: stats?.totalInList || 0, icon: '🔖' },
            { label: 'Watching', value: stats?.watchingCount || 0, icon: '📺' },
            { label: 'Completed', value: stats?.completedCount || 0, icon: '🎖️' }
          ].map((s, idx) => (
            <div key={idx} className="bg-bg-surface border border-border-subtle p-6 rounded-3xl space-y-3 hover:border-accent/30 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-content-tertiary">{s.label}</span>
                <span className="text-xl">{s.icon}</span>
              </div>
              <div className="text-3xl font-serif text-content-primary">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">
              Achievements — {unlockedAchievements.length}/{ACHIEVEMENTS.filter(a => a.tier === 'free' || isPremium).length}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const isUnlocked = unlockedAchievements.includes(a.id);
              const isLocked = a.tier === 'premium' && !isPremium;
              return (
                <div
                  key={a.id}
                  className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
                    isUnlocked
                      ? 'bg-accent/5 border-accent/20'
                      : isLocked
                        ? 'bg-bg-surface/30 border-border-subtle/30 opacity-40'
                        : 'bg-bg-surface border-border-subtle opacity-60'
                  }`}
                >
                  <div className="text-3xl">{isUnlocked ? a.icon : isLocked ? '🔒' : '❓'}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-content-primary">{a.name}</div>
                  <div className="text-[9px] text-content-tertiary">{a.description}</div>
                  {isUnlocked && (
                    <div className="text-[9px] font-bold text-accent">+{a.xpReward} XP</div>
                  )}
                  {isLocked && (
                    <div className="text-[8px] font-bold text-yellow-400">PREMIUM</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Links */}
        {(userProfile?.socialLinks || []).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">Social Links</h2>
            <div className="flex flex-wrap gap-3">
              {userProfile!.socialLinks!.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-xl text-xs font-bold text-content-secondary hover:text-accent hover:border-accent/30 transition-all"
                >
                  {link.platform || 'Link'} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rank Progression */}
        <div className="space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">Rank Progression</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {RANKS.map((r) => {
              const isUnlocked = (stats?.xp || 0) >= r.minXP;
              const isCurrent = rankInfo?.name === r.name;
              return (
                <div 
                  key={r.name} 
                  className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${isUnlocked ? 'bg-bg-surface border-border-subtle' : 'bg-transparent border-border-subtle/10 opacity-30'} ${isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg-base' : ''}`}
                >
                  <div 
                    className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-lg shadow-lg"
                    style={{ backgroundColor: isUnlocked ? `${r.color}20` : '#1a1a1a', color: r.color }}
                  >
                    {isUnlocked ? '✨' : '🔒'}
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-content-primary' : 'text-content-tertiary'}`}>{r.name}</div>
                  <div className="text-[9px] font-bold text-content-tertiary">{r.minXP.toLocaleString()} XP</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/my-list" className="p-5 bg-bg-surface border border-border-subtle rounded-2xl text-center space-y-2 hover:border-accent/30 transition-all">
            <span className="text-2xl">📋</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-content-primary">My List</p>
          </Link>
          <Link href="/watch-history" className="p-5 bg-bg-surface border border-border-subtle rounded-2xl text-center space-y-2 hover:border-accent/30 transition-all">
            <span className="text-2xl">📜</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-content-primary">History</p>
          </Link>
          <Link href="/leaderboard" className="p-5 bg-bg-surface border border-border-subtle rounded-2xl text-center space-y-2 hover:border-accent/30 transition-all">
            <span className="text-2xl">🏆</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-content-primary">Leaderboard</p>
          </Link>
          <Link href="/profile/edit" className="p-5 bg-bg-surface border border-border-subtle rounded-2xl text-center space-y-2 hover:border-accent/30 transition-all">
            <span className="text-2xl">✏️</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-content-primary">Edit Profile</p>
          </Link>
        </div>
      </main>

      <NewBottomNav />
    </div>
  );
}
