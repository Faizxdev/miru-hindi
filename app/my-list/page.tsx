'use client';

import React, { useState } from 'react';
import { useMyList, MyListItem } from '@/components/useMyList';
import NewNavbar from '@/components/NewNavbar';
import NewBottomNav from '@/components/NewBottomNav';
import DesktopNav from '@/components/DesktopNav';
import Link from 'next/link';
import Image from 'next/image';
import { generateSlug } from '@/lib/utils';

export default function MyListPage() {
  const { list: myList, remove } = useMyList();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'plan-to-watch', label: 'Plan to Watch' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'dropped', label: 'Dropped' }
  ];

  const getStatusColor = (status?: MyListItem['status']) => {
    switch (status) {
      case 'watching':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'plan-to-watch':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'dropped':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-content-tertiary/20 text-content-tertiary border-content-tertiary/30';
    }
  };

  const getStatusText = (status?: MyListItem['status']) => {
    switch (status) {
      case 'watching':
        return 'Watching';
      case 'completed':
        return 'Completed';
      case 'plan-to-watch':
        return 'Plan to Watch';
      case 'dropped':
        return 'Dropped';
      default:
        return 'Saved';
    }
  };

  const filteredList = selectedStatus ? myList.filter(item => (item.status || 'plan-to-watch') === selectedStatus) : myList;

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />
      <DesktopNav />
      
      <main className="w-full px-5 md:px-12 py-12 pb-32">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="section-heading text-4xl">My List</h1>
            <p className="section-subtitle">
              You have {filteredList.length} {selectedStatus ? getStatusText(selectedStatus as MyListItem['status']) : 'total'} anime saved in your browser cache
            </p>
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-5 h-10 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                  selectedStatus === option.value
                    ? 'bg-accent border-accent text-white font-bold'
                    : 'bg-bg-surface border-border-subtle text-content-secondary hover:border-border-medium hover:text-content-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12">
          {filteredList.length === 0 ? (
            <div className="text-center py-24 space-y-6 bg-bg-surface border border-border-subtle rounded-md">
              <div className="w-20 h-20 mx-auto text-content-tertiary opacity-20">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="section-heading text-2xl">Your list is empty</h3>
                <p className="section-subtitle max-w-xs mx-auto">
                  {selectedStatus 
                    ? `No anime matches the filter "${getStatusText(selectedStatus as MyListItem['status'])}"`
                    : 'Explore the library and click "Add to List" on any anime to save it here.'
                  }
                </p>
              </div>
              <Link href="/" className="btn-primary inline-flex px-8 h-12 items-center">
                Browse Anime
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredList.map((item) => {
                const poster = item.poster || item.image;
                const targetUrl = item.url.startsWith('/') 
                  ? (item.url.startsWith('/title/') ? item.url : `/title/${generateSlug(item.title || '')}`)
                  : `/title/${generateSlug(item.title || '')}`;

                return (
                  <div key={item.url} className="group relative block space-y-3">
                    <Link
                      href={targetUrl}
                      className="block focus:outline-none"
                    >
                      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-bg-surface border border-border-subtle shadow-md transition-all duration-300 group-hover:border-border-medium group-hover:shadow-xl">
                        {poster ? (
                          <Image
                            unoptimized
                            src={poster.startsWith('data:') ? poster : `/api/image?src=${encodeURIComponent(poster)}`}
                            alt={item.title || 'Anime'}
                            fill
                            className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-content-tertiary text-xs">NO POSTER</div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm backdrop-blur-md border ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>

                        {/* Hover Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <Link href={targetUrl}>
                          <h3 className="text-content-primary font-medium text-[13px] leading-snug line-clamp-2 transition-colors group-hover:text-accent">
                            {item.title || 'Untitled'}
                          </h3>
                        </Link>
                        {item.addedAt && (
                          <div className="text-content-tertiary text-[11px]">
                            Saved {new Date(item.addedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => remove(item.url)}
                        className="text-content-tertiary hover:text-red-400 p-1 transition-colors"
                        title="Remove from list"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <NewBottomNav />
    </div>
  );
}
