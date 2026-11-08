'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService, WatchHistoryItem } from '@/lib/userDataService';

export const useWatchHistory = () => {
  const { user } = useAuth();
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadWatchHistory = async () => {
    if (!user) {
      setWatchHistory([]);
      return;
    }

    try {
      setIsLoading(true);
      const history = await userDataService.getWatchHistory(user.uid);
      setWatchHistory(history);
    } catch (error) {
      console.error('Error loading watch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchHistory = async (item: Omit<WatchHistoryItem, 'watchedAt'>) => {
    if (!user) return;

    try {
      await userDataService.addToWatchHistory(user.uid, item);
      await loadWatchHistory(); // Reload to get updated history
    } catch (error) {
      console.error('Error adding to watch history:', error);
    }
  };

  const updateWatchProgress = async (
    itemId: string, 
    progress: number, 
    durationSeconds: number,
    fallbackData?: Omit<WatchHistoryItem, 'watchedAt' | 'progress' | 'duration'>,
    isHeartbeat: boolean = false
  ) => {
    if (!user) return;

    try {
      await userDataService.updateWatchProgress(user.uid, itemId, progress, durationSeconds, fallbackData, isHeartbeat);
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  const clearWatchHistory = async () => {
    if (!user) return;

    try {
      await userDataService.clearWatchHistory(user.uid);
      setWatchHistory([]);
    } catch (error) {
      console.error('Error clearing watch history:', error);
    }
  };

  useEffect(() => {
    loadWatchHistory();
  }, [user]);

  return {
    watchHistory,
    isLoading,
    addToWatchHistory,
    updateWatchProgress,
    clearWatchHistory,
    loadWatchHistory
  };
};
