import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';

export interface WatchlistItem {
  id: string; // The anime's unique slug or post ID
  title: string;
  image?: string;
  url?: string;
  addedAt: number;
}

/**
 * Adds an anime to the user's watchlist in Firestore.
 */
export async function addToWatchlist(userId: string, item: Omit<WatchlistItem, 'addedAt'>) {
  if (!userId) return;
  const watchlistRef = doc(db, 'users', userId, 'watchlist', String(item.id));
  
  await setDoc(watchlistRef, {
    ...item,
    addedAt: Date.now()
  });
}

/**
 * Removes an anime from the user's watchlist in Firestore.
 */
export async function removeFromWatchlist(userId: string, itemId: string) {
  if (!userId) return;
  const watchlistRef = doc(db, 'users', userId, 'watchlist', String(itemId));
  await deleteDoc(watchlistRef);
}

/**
 * Checks if an anime exists in the user's watchlist.
 */
export async function isInWatchlist(userId: string, itemId: string): Promise<boolean> {
  if (!userId) return false;
  const watchlistRef = doc(db, 'users', userId, 'watchlist', String(itemId));
  const docSnap = await getDoc(watchlistRef);
  return docSnap.exists();
}

/**
 * Fetches the user's entire watchlist from Firestore.
 */
export async function fetchWatchlist(userId: string): Promise<WatchlistItem[]> {
  if (!userId) return [];
  const watchlistCol = collection(db, 'users', userId, 'watchlist');
  const snapshot = await getDocs(watchlistCol);
  
  const items: WatchlistItem[] = [];
  snapshot.forEach((doc) => {
    items.push(doc.data() as WatchlistItem);
  });
  
  // Sort by most recently added
  return items.sort((a, b) => b.addedAt - a.addedAt);
}
