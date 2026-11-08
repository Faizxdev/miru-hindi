import { doc, getDoc, setDoc, updateDoc, collection, query, limit, getDocs, orderBy, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { AnimeDetailsResponse, SeriesListItem } from '@/server/types';

export interface CachedAnime {
  id: string; // The slug
  title: string;
  url: string;
  image?: string | null;
  synopsis?: string | null;
  status?: string | null;
  type?: string | null;
  lastFetched: number;
  seasons?: any[];
  episodes?: any[];
  isFeatured?: boolean;
  isPopular?: boolean;
  rating?: number | null;
  year?: number | null;
  postId?: number | null;
  poster?: string | null;
  players?: any[];
  genres?: string[];
  updatedAt?: number;
  createdAt?: number;
}

const CACHE_COLLECTION = 'animes';
const STALE_THRESHOLD = 12 * 60 * 60 * 1000; // 12 hours

class AnimeCacheService {
  private getDocRef(slug: string) {
    const safeId = slug.replace(/[^a-zA-Z0-9_-]/g, '_');
    return doc(db, CACHE_COLLECTION, safeId);
  }

  async getCachedAnime(slug: string): Promise<CachedAnime | null> {
    if (!isFirebaseConfigured) return null;
    try {
      const docSnap = await getDoc(this.getDocRef(slug));
      if (docSnap.exists()) {
        return docSnap.data() as CachedAnime;
      }
      return null;
    } catch (e: any) {
      console.warn('AnimeCacheService: Warning getting cached anime:', e?.message || '');
      return null;
    }
  }

  private sanitizeData(data: any): any {
    const clean: any = {};
    Object.keys(data).forEach(key => {
      const val = data[key];
      if (val === undefined) {
        clean[key] = null;
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        clean[key] = this.sanitizeData(val);
      } else {
        clean[key] = val;
      }
    });
    return clean;
  }

  async saveAnime(slug: string, data: Partial<CachedAnime>): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      const docRef = this.getDocRef(slug);
      const docSnap = await getDoc(docRef);
      const now = Date.now();
      const sanitized = this.sanitizeData(data);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, { 
          ...sanitized, 
          id: slug,
          lastFetched: now,
          createdAt: now
        });
      } else {
        await updateDoc(docRef, { 
          ...sanitized, 
          lastFetched: now,
          updatedAt: now
        });
      }
    } catch (e: any) {
      console.warn('AnimeCacheService: Warning saving anime:', e?.message || '');
    }
  }

  isStale(anime: CachedAnime): boolean {
    return Date.now() - anime.lastFetched > STALE_THRESHOLD;
  }

  async getAllCached(limitCount: number = 50): Promise<CachedAnime[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const q = query(collection(db, CACHE_COLLECTION), orderBy('lastFetched', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as CachedAnime);
    } catch (e: any) {
      console.warn('AnimeCacheService: Warning getting all cached:', e?.message || '');
      return [];
    }
  }

  async searchCached(searchTerm: string): Promise<CachedAnime[]> {
    if (!isFirebaseConfigured) return [];
    try {
      const q = query(
        collection(db, CACHE_COLLECTION), 
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as CachedAnime);
    } catch (e: any) {
      console.warn('AnimeCacheService: Warning searching cached:', e?.message || '');
      return [];
    }
  }

  async clearAllCache(): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      const q = query(collection(db, CACHE_COLLECTION));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log('AnimeCacheService: Database cleared successfully');
    } catch (e: any) {
      console.warn('AnimeCacheService: Warning clearing database:', e?.message || '');
    }
  }

  async deleteCache(slug: string): Promise<void> {
    if (!isFirebaseConfigured || !slug) return;
    try {
      const safeId = slug.replace(/[^a-zA-Z0-9_-]/g, '_');
      await deleteDoc(doc(db, CACHE_COLLECTION, safeId));
    } catch (e: any) {
      console.warn(`AnimeCacheService: Warning deleting cache for ${slug}:`, e?.message || '');
    }
  }
}

export const animeCacheService = new AnimeCacheService();
