'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService, UserProfile as UserProfileType } from '@/lib/userDataService';
import { AuthModal } from './AuthModal';
import { getRandomAnimeAvatar } from '@/lib/animeAvatars';

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const profile = await userDataService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/signin';
    setShowDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 opacity-20">
        <div className="w-8 h-8 bg-bg-elevated rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-bg-elevated rounded animate-pulse"></div>
      </div>
    );
  }
  if (!user) {
    return (
      <>
        <button
          onClick={handleSignIn}
          className="btn-primary px-5 py-2 rounded-xl flex items-center space-x-2 shadow-xl shadow-accent/5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="font-bold text-sm tracking-tight">Sign In</span>
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 hover:bg-bg-elevated p-1.5 pr-3 rounded-2xl transition-all duration-300 border border-transparent hover:border-border-subtle"
      >
        <div className="relative">
          <img
            src={getRandomAnimeAvatar(user.uid)}
            alt={user.displayName || 'User'}
            className="w-9 h-9 rounded-xl object-cover border border-border-subtle shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center hidden"
            style={{ display: 'none' }}
          >
            <span className="text-bg-base text-sm font-bold">
              {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-bg-surface rounded-full"></div>
        </div>
        <span className="text-content-primary text-sm font-bold tracking-tight hidden md:block">
          {user.displayName || user.email?.split('@')[0] || 'User'}
        </span>
        <svg className={`w-4 h-4 text-content-tertiary transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-72 bg-bg-elevated/95 backdrop-blur-xl border border-border-subtle rounded-2xl shadow-3xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-border-subtle bg-bg-surface/50">
            <div className="flex items-center space-x-4">
              <img
                src={getRandomAnimeAvatar(user.uid)}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-2xl object-cover border border-border-subtle"
              />
              <div className="space-y-1">
                <p className="text-content-primary font-bold tracking-tight">
                  {user.displayName || 'Premium Member'}
                </p>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10"
                    style={{ 
                      backgroundColor: `${userDataService.calculateRank(userProfile?.stats?.xp || 0).color}20`,
                      color: userDataService.calculateRank(userProfile?.stats?.xp || 0).color 
                    }}
                  >
                    {userProfile?.stats?.rank || 'Newbie'}
                  </span>
                  <span className="text-content-tertiary text-[10px] font-bold">
                    {Math.round(userProfile?.stats?.xp || 0).toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/profile';
              }}
              className="w-full px-6 py-3 text-left text-content-secondary hover:bg-bg-surface hover:text-content-primary transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-content-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-bold">Profile</span>
              </div>
            </button>

            <button
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/my-list';
              }}
              className="w-full px-6 py-3 text-left text-content-secondary hover:bg-bg-surface hover:text-content-primary transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-content-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-bold">My List</span>
              </div>
            </button>

            <button
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/watch-history';
              }}
              className="w-full px-6 py-3 text-left text-content-secondary hover:bg-bg-surface hover:text-content-primary transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-content-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold">Watch History</span>
              </div>
            </button>

            <div className="border-t border-border-subtle my-2"></div>

            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-bold">Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
