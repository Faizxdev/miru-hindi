'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService, UserProfile } from '@/lib/userDataService';
import NewNavbar from '@/components/NewNavbar';
import NewBottomNav from '@/components/NewBottomNav';
import DesktopNav from '@/components/DesktopNav';
import Link from 'next/link';
import { getRandomAnimeAvatar } from '@/lib/animeAvatars';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Isekai', 'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Shonen', 'Shojo', 'Seinen'
];

const BANNER_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#1e293b', '#0f172a'
];

export default function EditProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [bannerColor, setBannerColor] = useState('#6366f1');

  useEffect(() => {
    if (user) loadProfile();
    else setIsLoading(false);
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const p = await userDataService.getUserProfile(user.uid);
      if (p) {
        setProfile(p);
        setDisplayName(p.displayName || '');
        setBio(p.bio || '');
        setFavoriteGenres(p.favoriteGenres || []);
        setSocialLinks(p.socialLinks || []);
        setBannerColor(p.bannerColor || '#6366f1');
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      const isPremium = profile?.tier === 'premium';

      const updates: any = { displayName };

      if (isPremium) {
        updates.bio = bio;
        updates.socialLinks = socialLinks.filter(s => s.url.trim());
        updates.bannerColor = bannerColor;
      }
      updates.favoriteGenres = favoriteGenres;

      await userDataService.updateUserProfileFields(user.uid, updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Check if social links achievement should trigger
      await userDataService.checkAndUnlockAchievements(user.uid);
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGenre = (genre: string) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else if (favoriteGenres.length < 5) {
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  const addSocialLink = () => {
    if (socialLinks.length < 5) {
      setSocialLinks([...socialLinks, { platform: '', url: '' }]);
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index][field] = value;
    setSocialLinks(updated);
  };

  const isPremium = profile?.tier === 'premium';

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base font-sans pb-32">
        <NewNavbar />
        <DesktopNav />
        <div className="max-w-[600px] mx-auto px-6 py-20 text-center space-y-6 pt-24 md:pt-20">
          <div className="text-6xl">🔒</div>
          <h1 className="section-heading text-2xl">Sign In Required</h1>
          <p className="section-subtitle">You need to be logged in to edit your profile.</p>
        </div>
        <NewBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans selection:bg-accent/30 selection:text-white pb-32">
      <NewNavbar />
      <DesktopNav />

      <main className="max-w-[600px] mx-auto px-6 py-12 space-y-10 pt-24 md:pt-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-heading text-2xl">Edit Profile</h1>
            <p className="section-subtitle text-sm mt-1">Customize your identity</p>
          </div>
          <Link href="/profile" className="btn-outline px-4 py-2 rounded-xl text-xs">
            ← Back
          </Link>
        </div>

        {/* Tier Badge */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${
          isPremium
            ? 'bg-yellow-500/5 border-yellow-500/20'
            : 'bg-bg-surface border-border-subtle'
        }`}>
          <span className="text-2xl">{isPremium ? '✦' : '🎭'}</span>
          <div className="flex-1">
            <p className={`font-bold text-sm ${isPremium ? 'text-yellow-400' : 'text-content-primary'}`}>
              {isPremium ? 'Premium Account' : 'Free Account'}
            </p>
            <p className="text-content-tertiary text-[10px]">
              {isPremium ? 'All features unlocked' : 'Upgrade to Premium for bio, social links, and custom banner'}
            </p>
          </div>
          {!isPremium && (
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">
              Upgrade
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-bg-surface rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Avatar Preview */}
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-3xl overflow-hidden border-2"
                style={{ borderColor: bannerColor }}
              >
                <img src={getRandomAnimeAvatar(user.uid)} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-content-primary font-bold">{displayName || 'Your Name'}</p>
                <p className="text-content-tertiary text-xs">{user.email}</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-content-primary text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Your display name"
              />
            </div>

            {/* Bio (Premium Only) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">
                  Bio
                </label>
                {!isPremium && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full">Premium</span>
                )}
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                disabled={!isPremium}
                className={`w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none h-24 ${
                  !isPremium ? 'opacity-40 cursor-not-allowed' : 'text-content-primary'
                }`}
                placeholder={isPremium ? 'Tell the world about your anime journey...' : 'Upgrade to Premium to add a bio'}
              />
              {isPremium && (
                <p className="text-content-tertiary text-[10px] text-right">{bio.length}/200</p>
              )}
            </div>

            {/* Favorite Genres */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">
                Favorite Genres <span className="text-content-tertiary/50">(max 5)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const isSelected = favoriteGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-accent/10 text-accent border-accent/30'
                          : 'bg-bg-surface text-content-tertiary border-border-subtle hover:border-accent/20'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner Color (Premium Only) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">
                  Banner Color
                </label>
                {!isPremium && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full">Premium</span>
                )}
              </div>
              <div className={`flex flex-wrap gap-3 ${!isPremium ? 'opacity-40 pointer-events-none' : ''}`}>
                {BANNER_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBannerColor(color)}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      bannerColor === color ? 'scale-110 ring-2 ring-white/20' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color, borderColor: bannerColor === color ? color : 'transparent' }}
                  />
                ))}
              </div>
            </div>

            {/* Social Links (Premium Only) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.25em] text-content-tertiary">
                    Social Links
                  </label>
                  {!isPremium && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full">Premium</span>
                  )}
                </div>
                {isPremium && socialLinks.length < 5 && (
                  <button onClick={addSocialLink} className="text-accent text-xs font-bold hover:underline">
                    + Add Link
                  </button>
                )}
              </div>
              <div className={`space-y-3 ${!isPremium ? 'opacity-40 pointer-events-none' : ''}`}>
                {socialLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <select
                      value={link.platform}
                      onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                      className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-2.5 text-content-primary text-xs focus:outline-none focus:border-accent w-28"
                    >
                      <option value="">Platform</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="mal">MyAnimeList</option>
                      <option value="anilist">AniList</option>
                      <option value="discord">Discord</option>
                      <option value="instagram">Instagram</option>
                    </select>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                      className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-3 py-2.5 text-content-primary text-xs focus:outline-none focus:border-accent"
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => removeSocialLink(i)}
                      className="text-content-tertiary hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {socialLinks.length === 0 && isPremium && (
                  <p className="text-content-tertiary text-xs">No social links yet. Click &quot;+ Add Link&quot; to add one.</p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary px-10 py-3 rounded-2xl text-sm font-bold disabled:opacity-50 transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveSuccess && (
                <span className="text-green-400 text-sm font-bold animate-fade-in">
                  ✓ Saved successfully!
                </span>
              )}
            </div>
          </div>
        )}
      </main>

      <NewBottomNav />
    </div>
  );
}
