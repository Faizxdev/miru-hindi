import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface SiteSettings {
  site_base: string;
  tmdb_api_key: string;
  hide_schedule: boolean;
  hide_upcoming: boolean;
  broadcast_enabled: boolean;
  broadcast_message: string;
  broadcast_type: 'info' | 'warning' | 'urgent';
  broadcast_history: { message: string; type: string; timestamp: number }[];
  lastUpdated?: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_base: process.env.SITE_BASE || process.env.NEXT_PUBLIC_SITE_BASE || 'https://animesalt.cx',
  tmdb_api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
  hide_schedule: true,
  hide_upcoming: true,
  broadcast_enabled: false,
  broadcast_message: '',
  broadcast_type: 'info',
  broadcast_history: [],
};

class SettingsService {
  private getSettingsDocRef() {
    return doc(db, 'system', 'settings');
  }

  async getSettings(): Promise<SiteSettings> {
    try {
      if (!db || typeof db.type === 'undefined' && Object.keys(db).length === 0) {
         return DEFAULT_SETTINGS;
      }
      const docSnap = await getDoc(this.getSettingsDocRef());
      if (docSnap.exists()) {
        return { ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.error('SettingsService: Error fetching settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<void> {
    try {
      const docRef = this.getSettingsDocRef();
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, { ...DEFAULT_SETTINGS, ...updates, lastUpdated: Date.now() });
      } else {
        await updateDoc(docRef, { ...updates, lastUpdated: Date.now() });
      }
    } catch (e) {
      console.error('SettingsService: Error updating settings', e);
      throw e;
    }
  }
}

export const settingsService = new SettingsService();
