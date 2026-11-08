'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userDataService, MyListItem } from '@/lib/userDataService';

export const useMyList = () => {
  const { user } = useAuth();
  const [myList, setMyList] = useState<MyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMyList = async (status?: string) => {
    if (!user) {
      setMyList([]);
      return;
    }

    try {
      setIsLoading(true);
      const list = await userDataService.getMyList(user.uid, status);
      setMyList(list);
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToMyList = async (item: Omit<MyListItem, 'addedAt'>) => {
    if (!user) return;

    try {
      await userDataService.addToMyList(user.uid, item);
      await loadMyList(); // Reload to get updated list
    } catch (error) {
      console.error('Error adding to my list:', error);
    }
  };

  const updateMyListItem = async (itemId: string, updates: Partial<MyListItem>) => {
    if (!user) return;

    try {
      await userDataService.updateMyListItem(user.uid, itemId, updates);
      await loadMyList(); // Reload to get updated list
    } catch (error) {
      console.error('Error updating my list item:', error);
    }
  };

  const removeFromMyList = async (itemId: string) => {
    if (!user) return;

    try {
      await userDataService.removeFromMyList(user.uid, itemId);
      await loadMyList(); // Reload to get updated list
    } catch (error) {
      console.error('Error removing from my list:', error);
    }
  };

  const isInMyList = async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      return await userDataService.isInMyList(user.uid, itemId);
    } catch (error) {
      console.error('Error checking if in my list:', error);
      return false;
    }
  };

  useEffect(() => {
    loadMyList();
  }, [user]);

  return {
    myList,
    isLoading,
    addToMyList,
    updateMyListItem,
    removeFromMyList,
    isInMyList,
    loadMyList
  };
};
