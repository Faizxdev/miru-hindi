"use client";
import { useEffect, useState } from "react";

export type MyListItem = { 
  id?: string;
  url: string; 
  title: string | null; 
  image?: string | null; 
  poster?: string | null;
  postId?: number;
  status?: 'plan-to-watch' | 'watching' | 'completed' | 'dropped';
  addedAt?: number;
};

const KEY = "amai:mylist:v1";

export function useMyList() {
  const [list, setList] = useState<MyListItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: MyListItem[]) => {
    setList(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const add = (item: MyListItem) => {
    const existingIndex = list.findIndex((i) => i.url === item.url || (item.id && i.id === item.id));
    if (existingIndex >= 0) return;
    persist([{ ...item, addedAt: item.addedAt || Date.now(), status: item.status || 'plan-to-watch' }, ...list]);
  };

  const remove = (urlOrId: string) => {
    persist(list.filter((i) => i.url !== urlOrId && i.id !== urlOrId));
  };

  const toggle = (item: MyListItem) => {
    const exists = list.some((i) => i.url === item.url || (item.id && i.id === item.id));
    if (exists) remove(item.url);
    else add(item);
  };

  const updateStatus = (urlOrId: string, status: MyListItem['status']) => {
    persist(list.map((i) => (i.url === urlOrId || i.id === urlOrId) ? { ...i, status } : i));
  };

  const has = (urlOrId: string) => list.some((i) => i.url === urlOrId || i.id === urlOrId);
  const getItem = (urlOrId: string) => list.find((i) => i.url === urlOrId || i.id === urlOrId);

  return { list, add, remove, toggle, updateStatus, has, getItem };
}


