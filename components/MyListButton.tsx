'use client';

import React from 'react';
import { useMyList } from './useMyList';

interface MyListButtonProps {
  animeId: string;
  animeTitle: string;
  animePoster?: string;
  animeUrl: string;
  className?: string;
}

export const MyListButton: React.FC<MyListButtonProps> = ({
  animeId,
  animeTitle,
  animePoster,
  animeUrl,
  className = ''
}) => {
  const { has, toggle, getItem, updateStatus } = useMyList();
  const isInList = has(animeUrl) || has(animeId);
  const existingItem = getItem(animeUrl) || getItem(animeId);
  const currentStatus = existingItem?.status || 'plan-to-watch';

  const handleToggleList = () => {
    toggle({
      id: animeId,
      title: animeTitle,
      poster: animePoster,
      image: animePoster,
      url: animeUrl,
      status: 'plan-to-watch'
    });
  };

  const handleStatusChange = (newStatus: 'plan-to-watch' | 'watching' | 'completed' | 'dropped') => {
    updateStatus(animeUrl, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'plan-to-watch':
        return 'bg-content-tertiary/10 text-content-tertiary border-content-tertiary/20';
      case 'dropped':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-bg-elevated text-content-tertiary border-border-subtle';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isInList ? (
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleList}
            className="group flex items-center justify-center w-12 h-12 bg-bg-surface border border-red-500/30 text-red-500 rounded-xl transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
            title="Remove from My List"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className={`h-12 pl-4 pr-10 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/40 border transition-all duration-300 appearance-none bg-bg-surface ${getStatusColor(currentStatus)}`}
            >
              <option value="plan-to-watch">Plan to Watch</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleToggleList}
          className="btn-outline h-12 min-w-[160px] flex items-center justify-center gap-2 group hover:border-accent/40 rounded-xl px-6 transition-all duration-300"
        >
          <svg className="w-5 h-5 text-accent transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-widest">
            Add to List
          </span>
        </button>
      )}
    </div>
  );
};
