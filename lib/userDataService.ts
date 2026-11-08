import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
  startAfter,
  where
} from 'firebase/firestore';
import { db } from './firebase';

export interface WatchHistoryItem {
  id: string;
  title: string;
  episode: string;
  season?: string;
  poster?: string;
  url: string;
  seriesUrl?: string;
  postId?: number;
  watchedAt: number; // Use number for consistency
  progress?: number; // 0-100 percentage
  duration?: number; // total duration in seconds
}

export interface MyListItem {
  id: string;
  title: string;
  poster?: string;
  url: string;
  addedAt: number;
  status: 'watching' | 'completed' | 'plan-to-watch' | 'dropped';
  rating?: number; // 1-10
  notes?: string;
}

export interface UserStats {
  xp: number;
  rank: string;
  level: number;
  totalMinutesWatched: number;
  episodesCompleted: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  createdAt: any;
  lastLoginAt: any;
  stats: UserStats;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  };
  // Tier system
  tier: 'free' | 'premium';
  // Profile customization
  bio?: string;
  favoriteGenres?: string[];
  socialLinks?: { platform: string; url: string }[];
  bannerColor?: string;
  // Engagement
  loginStreak?: number;
  lastLoginDate?: string; // YYYY-MM-DD
  achievements?: string[]; // unlocked achievement IDs
  weeklyProgress?: {
    weekId: string;
    episodes: number;
    minutesWatched: number;
    listAdds: number;
    completed: boolean;
  };
}

export const RANKS = [
  { name: 'Newbie', minXP: 0, color: '#94a3b8' },          // Slate 400
  { name: 'Apprentice', minXP: 1000, color: '#4ade80' },    // Green 400
  { name: 'Watcher', minXP: 5000, color: '#60a5fa' },       // Blue 400
  { name: 'Otaku', minXP: 15000, color: '#f472b6' },        // Pink 400
  { name: 'Elite Watcher', minXP: 30000, color: '#fb923c' }, // Orange 400
  { name: 'Anime Master', minXP: 60000, color: '#a855f7' },  // Purple 500
  { name: 'Legend', minXP: 120000, color: '#facc15' },      // Yellow 400
  { name: 'Mythic', minXP: 250000, color: '#f87171' },      // Red 400
  { name: 'Celestial', minXP: 500000, color: '#2dd4bf' },   // Teal 400
  { name: 'Amai Overlord', minXP: 1000000, color: '#ffffff' } // White
];

// Administrative Security
export const ADMIN_UIDS = [
  'sf1MEwZ8KOME15feZVZ5j7Fajr13', // User: sf1MEwZ8KOME15feZVZ5j7Fajr13
];

class UserDataService {
  private getUserDocRef(uid: string) {
    return doc(db, 'users', uid);
  }

  private getWatchHistoryRef(uid: string) {
    return doc(db, 'users', uid, 'data', 'watchHistory');
  }

  private getMyListRef(uid: string) {
    return doc(db, 'users', uid, 'data', 'myList');
  }

  public calculateRank(xp: number) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXP) {
        return {
          ...RANKS[i],
          nextRank: RANKS[i+1] || null,
          progressToNext: RANKS[i+1] 
            ? ((xp - RANKS[i].minXP) / (RANKS[i+1].minXP - RANKS[i].minXP)) * 100 
            : 100
        };
      }
    }
    return { ...RANKS[0], nextRank: RANKS[1], progressToNext: 0 };
  }

  // User Profile Management
  async ensureUserProfile(uid: string, email: string | null, displayName: string | null, photoURL?: string | null): Promise<void> {
    const userRef = this.getUserDocRef(uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      console.log(`UserDataService: Creating initial profile for ${uid}`);
      const userProfile: UserProfile = {
        uid,
        email,
        displayName: displayName || 'Anime Legend',
        photoURL: photoURL || null,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        stats: {
          xp: 0,
          rank: 'Newbie',
          level: 1,
          totalMinutesWatched: 0,
          episodesCompleted: 0
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true
        },
        tier: 'free',
        bio: '',
        favoriteGenres: [],
        socialLinks: [],
        bannerColor: '#6366f1',
        loginStreak: 1,
        lastLoginDate: new Date().toISOString().split('T')[0],
        achievements: [],
        weeklyProgress: {
          weekId: '',
          episodes: 0,
          minutesWatched: 0,
          listAdds: 0,
          completed: false
        }
      };
      await setDoc(userRef, userProfile);
    } else {
      const data = docSnap.data() as UserProfile;
      if (!data.stats) {
        console.log(`UserDataService: Migrating legacy user ${uid} to stats system`);
        await updateDoc(userRef, {
          stats: {
            xp: 0,
            rank: 'Newbie',
            level: 1,
            totalMinutesWatched: 0,
            episodesCompleted: 0
          }
        });
      }
    }
  }

  async createUserProfile(user: any): Promise<void> {
    await this.ensureUserProfile(user.uid, user.email, user.displayName, user.photoURL);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = this.getUserDocRef(uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const docRef = this.getUserDocRef(uid);
    await updateDoc(docRef, {
      ...updates,
      lastLoginAt: Date.now()
    });
  }

  // Watch History Management
  async addToWatchHistory(uid: string, item: Omit<WatchHistoryItem, 'watchedAt'>): Promise<void> {
    const historyRef = this.getWatchHistoryRef(uid);
    const historyItem: WatchHistoryItem = {
      ...item,
      watchedAt: Date.now()
    };

    const docSnap = await getDoc(historyRef);
    let history: WatchHistoryItem[] = [];
    
    if (docSnap.exists()) {
      history = docSnap.data().items || [];
    }

    // Move to top and update data
    history = history.filter(h => h.id !== item.id);
    history.unshift(historyItem);

    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    await setDoc(historyRef, { items: history });
  }

  async getWatchHistory(uid: string, limitCount: number = 24): Promise<WatchHistoryItem[]> {
    const historyRef = this.getWatchHistoryRef(uid);
    const docSnap = await getDoc(historyRef);
    
    if (docSnap.exists()) {
      const history = docSnap.data().items || [];
      return history.slice(0, limitCount);
    }
    return [];
  }

  async updateWatchProgress(
    uid: string, 
    itemId: string, 
    progress: number, 
    durationSeconds: number, 
    fallbackData?: Omit<WatchHistoryItem, 'watchedAt' | 'progress' | 'duration'>,
    isHeartbeat: boolean = false
  ): Promise<void> {
    const historyRef = this.getWatchHistoryRef(uid);
    const docSnap = await getDoc(historyRef);
    
    let history: WatchHistoryItem[] = [];
    if (docSnap.exists()) {
      history = docSnap.data().items || [];
    }
    
    let itemIndex = history.findIndex(item => item.id === itemId);
    
    // If it's a heartbeat, we just want to grant XP and update the "watchedAt" timestamp
    if (isHeartbeat) {
      console.log(`UserDataService: Heartbeat for ${itemId}. Granting 5 XP.`);
      await this.addXP(uid, 5, 0.5); // 5 XP, 0.5 minutes (30s)
      
      if (itemIndex !== -1) {
        history[itemIndex].watchedAt = Date.now();
        const updatedItem = history.splice(itemIndex, 1)[0];
        history.unshift(updatedItem);
        try {
          await setDoc(historyRef, { items: history.slice(0, 50) });
        } catch (e) {
          console.error('UserDataService: Failed to save history heartbeat:', e);
        }
      } else if (fallbackData) {
        // Add to history if not there
        console.log(`UserDataService: First heartbeat for ${itemId}. Creating history entry.`);
        const newItem: WatchHistoryItem = {
          ...fallbackData,
          progress: 1, // Tiny starting progress
          duration: 0,
          watchedAt: Date.now()
        };
        history.unshift(newItem);
        try {
          await setDoc(historyRef, { items: history.slice(0, 50) });
        } catch (e) {
          console.error('UserDataService: Failed to create history entry:', e);
        }
      }
      return;
    }

    if (itemIndex === -1 && fallbackData) {
      // If item not found but we have fallback data, add it now
      console.log(`UserDataService: Item ${itemId} not found in history. Adding initial entry.`);
      const newItem: WatchHistoryItem = {
        ...fallbackData,
        progress,
        duration: durationSeconds,
        watchedAt: Date.now()
      };
      history.unshift(newItem);
      itemIndex = 0;
      
      // Grant initial XP for starting (5 XP)
      await this.addXP(uid, 5, (progress / 100) * (durationSeconds / 60));
    }

    if (itemIndex !== -1) {
      const oldProgress = history[itemIndex].progress || 0;
      const progressDiff = progress - oldProgress;
      
      // Only grant XP if progress is increasing
      if (progressDiff > 0.5) { // Lowered threshold for better tracking
        const minutesEarned = (progressDiff / 100) * (durationSeconds / 60);
        const xpEarned = Math.round(minutesEarned * 10); // 10 XP per minute

        if (xpEarned > 0) {
          console.log(`UserDataService: Granting ${xpEarned} XP for ${minutesEarned.toFixed(2)} minutes watched`);
          await this.addXP(uid, xpEarned, minutesEarned);
        }
      }

      history[itemIndex].progress = progress;
      history[itemIndex].duration = durationSeconds;
      history[itemIndex].watchedAt = Date.now();
      
      // Boost back to the top
      const updatedItem = history.splice(itemIndex, 1)[0];
      history.unshift(updatedItem);
      
      try {
        await setDoc(historyRef, { items: history.slice(0, 50) });
      } catch (e) {
        console.error('UserDataService: Failed to save progress update:', e);
      }
    }
  }

  private async addXP(uid: string, xp: number, minutes: number) {
    const userRef = this.getUserDocRef(uid);
    
    // Ensure the doc exists first (especially for legacy users)
    await this.ensureUserProfile(uid, null, null);
    
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      // data.stats is guaranteed now by ensureUserProfile
      const newXP = (data.stats!.xp || 0) + xp;
      const newMinutes = (data.stats!.totalMinutesWatched || 0) + minutes;
      const rankInfo = this.calculateRank(newXP);
      
      await updateDoc(userRef, {
        'stats.xp': newXP,
        'stats.totalMinutesWatched': newMinutes,
        'stats.rank': rankInfo.name
      });
    }
  }

  async clearWatchHistory(uid: string): Promise<void> {
    const historyRef = this.getWatchHistoryRef(uid);
    await setDoc(historyRef, { items: [] });
  }

  // My List Management
  async addToMyList(uid: string, item: Omit<MyListItem, 'addedAt'>): Promise<void> {
    const myListRef = this.getMyListRef(uid);
    const myListItem: MyListItem = {
      ...item,
      addedAt: Date.now()
    };

    const docSnap = await getDoc(myListRef);
    let myList: MyListItem[] = [];
    
    if (docSnap.exists()) {
      myList = docSnap.data().items || [];
    }

    myList = myList.filter(item => item.id !== myListItem.id);
    myList.push(myListItem);

    await setDoc(myListRef, { items: myList });
    
    // Bonus XP for adding to list
    await this.addXP(uid, 50, 0);
  }

  async getMyList(uid: string, status?: string): Promise<MyListItem[]> {
    const myListRef = this.getMyListRef(uid);
    const docSnap = await getDoc(myListRef);
    
    if (docSnap.exists()) {
      let myList: MyListItem[] = docSnap.data().items || [];
      if (status) myList = myList.filter(item => item.status === status);
      return myList.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    }
    return [];
  }

  async removeFromMyList(uid: string, itemId: string): Promise<void> {
    const myListRef = this.getMyListRef(uid);
    const docSnap = await getDoc(myListRef);
    
    if (docSnap.exists()) {
      const myList: MyListItem[] = docSnap.data().items || [];
      const updatedList = myList.filter(item => item.id !== itemId);
      await setDoc(myListRef, { items: updatedList });
    }
  }

  async updateMyListItem(uid: string, itemId: string, updates: Partial<MyListItem>): Promise<void> {
    const myListRef = this.getMyListRef(uid);
    const docSnap = await getDoc(myListRef);
    
    if (docSnap.exists()) {
      const myList: MyListItem[] = docSnap.data().items || [];
      const idx = myList.findIndex(item => item.id === itemId);
      if (idx !== -1) {
        myList[idx] = { ...myList[idx], ...updates };
        await setDoc(myListRef, { items: myList });
      }
    }
  }

  async isInMyList(uid: string, itemId: string): Promise<boolean> {
    const myList = await this.getMyList(uid);
    return myList.some(item => item.id === itemId);
  }

  // ─── Engagement Methods ───

  async checkAndUpdateLoginStreak(uid: string): Promise<{ streak: number; xpGranted: number }> {
    const userRef = this.getUserDocRef(uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return { streak: 0, xpGranted: 0 };

    const data = docSnap.data() as UserProfile;
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = data.lastLoginDate || '';
    let streak = data.loginStreak || 0;
    let xpGranted = 0;

    if (lastLogin === today) {
      return { streak, xpGranted: 0 }; // Already logged in today
    }

    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastLogin === yesterdayStr) {
      streak += 1;
    } else {
      streak = 1; // Reset streak
    }

    // Calculate XP bonus
    if (streak % 30 === 0) {
      xpGranted = 500; // Monthly bonus
    } else if (streak % 7 === 0) {
      xpGranted = 100; // Weekly bonus
    } else {
      xpGranted = 25; // Daily bonus
    }

    await updateDoc(userRef, {
      loginStreak: streak,
      lastLoginDate: today,
      lastLoginAt: Date.now()
    });

    if (xpGranted > 0) {
      await this.addXP(uid, xpGranted, 0);
    }

    console.log(`UserDataService: Login streak for ${uid}: Day ${streak}, +${xpGranted} XP`);
    return { streak, xpGranted };
  }

  async updateUserProfileFields(uid: string, updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'favoriteGenres' | 'socialLinks' | 'bannerColor' | 'photoURL'>>): Promise<void> {
    const userRef = this.getUserDocRef(uid);
    await updateDoc(userRef, updates as any);
  }

  async unlockAchievement(uid: string, achievementId: string, xpReward: number): Promise<void> {
    const userRef = this.getUserDocRef(uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data() as UserProfile;
    const achievements = data.achievements || [];

    if (achievements.includes(achievementId)) return; // Already unlocked

    achievements.push(achievementId);
    await updateDoc(userRef, { achievements });
    await this.addXP(uid, xpReward, 0);
    console.log(`UserDataService: Achievement unlocked: ${achievementId} (+${xpReward} XP)`);
  }

  async checkAndUnlockAchievements(uid: string): Promise<string[]> {
    const profile = await this.getUserProfile(uid);
    if (!profile) return [];

    const myList = await this.getMyList(uid);
    const now = new Date();
    const accountAgeDays = Math.floor((Date.now() - (profile.createdAt || Date.now())) / 86400000);

    // Dynamically import to avoid circular deps
    const { checkAchievements } = await import('./achievements');

    const ctx = {
      totalMinutesWatched: profile.stats?.totalMinutesWatched || 0,
      episodesCompleted: profile.stats?.episodesCompleted || 0,
      myListCount: myList.length,
      loginStreak: profile.loginStreak || 0,
      accountAgeDays,
      socialLinksCount: (profile.socialLinks || []).length,
      currentHour: now.getHours(),
      leaderboardPosition: null, // Checked separately
      tier: profile.tier || 'free'
    };

    const newAchievements = checkAchievements(profile.achievements || [], ctx);
    const unlockedIds: string[] = [];

    for (const a of newAchievements) {
      await this.unlockAchievement(uid, a.id, a.xpReward);
      unlockedIds.push(a.id);
    }

    return unlockedIds;
  }

  async updateWeeklyProgress(uid: string, type: 'episodes' | 'minutes' | 'list_adds', amount: number): Promise<void> {
    const { getCurrentWeekChallenge } = await import('./achievements');
    const challenge = getCurrentWeekChallenge();

    const userRef = this.getUserDocRef(uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data() as UserProfile;
    let progress = data.weeklyProgress || {
      weekId: '',
      episodes: 0,
      minutesWatched: 0,
      listAdds: 0,
      completed: false
    };

    // Reset if new week
    if (progress.weekId !== challenge.weekId) {
      progress = { weekId: challenge.weekId, episodes: 0, minutesWatched: 0, listAdds: 0, completed: false };
    }

    if (progress.completed) return;

    // Update the right counter
    if (type === 'episodes') progress.episodes += amount;
    else if (type === 'minutes') progress.minutesWatched += amount;
    else if (type === 'list_adds') progress.listAdds += amount;

    // Check completion
    let currentValue = 0;
    if (challenge.type === 'episodes') currentValue = progress.episodes;
    else if (challenge.type === 'minutes') currentValue = progress.minutesWatched;
    else if (challenge.type === 'list_adds') currentValue = progress.listAdds;

    if (currentValue >= challenge.target && !progress.completed) {
      progress.completed = true;
      await this.addXP(uid, challenge.xpReward, 0);
      console.log(`UserDataService: Weekly challenge completed! +${challenge.xpReward} XP`);
    }

    await updateDoc(userRef, { weeklyProgress: progress });
  }

  // Global Leaderboard
  async getGlobalLeaderboard(limitCount: number = 50): Promise<Array<UserProfile & { position: number }>> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('stats.xp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      const users: Array<UserProfile & { position: number }> = [];
      snapshot.forEach((docSnap, ) => {
        const data = docSnap.data() as UserProfile;
        if (data.stats && data.stats.xp > 0) {
          users.push({ ...data, position: users.length + 1 });
        }
      });
      return users;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  async getUserStats(uid: string) {
    const [profile, watchHistory, myList] = await Promise.all([
      this.getUserProfile(uid),
      this.getWatchHistory(uid, 100),
      this.getMyList(uid)
    ]);

    const stats = profile?.stats || {
      xp: 0,
      rank: 'Newbie',
      level: 1,
      totalMinutesWatched: 0,
      episodesCompleted: 0
    };

    return {
      ...stats,
      totalInList: myList.length,
      watchingCount: myList.filter(item => item.status === 'watching').length,
      completedCount: myList.filter(item => item.status === 'completed').length,
      planToWatchCount: myList.filter(item => item.status === 'plan-to-watch').length
    };
  }

  async getAllUsers(limitCount: number = 20, lastUid?: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      let q;
      if (lastUid) {
        const lastDoc = await getDoc(this.getUserDocRef(lastUid));
        q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
      } else {
        q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
      }
      const snapshot = await getDocs(q);
      const users: UserProfile[] = [];
      snapshot.forEach(docSnap => users.push(docSnap.data() as UserProfile));
      return users;
    } catch (e) {
      console.error('Error fetching all users:', e);
      return [];
    }
  }

  async grantManualXP(uid: string, amount: number): Promise<void> {
     await this.addXP(uid, amount, 0);
  }

  async getEngagementTelemetry() {
    try {
      const usersRef = collection(db, 'users');
      const today = new Date().toISOString().split('T')[0];
      const q = query(usersRef, where('lastLoginDate', '==', today));
      const dauSnapshot = await getDocs(q);
      
      return {
        dau: dauSnapshot.size,
        topWatched: [
          { id: 'solo-leveling', title: 'Solo Leveling', views: Math.floor(Math.random() * 500) + 1000 },
          { id: 'naruto-shippuden', title: 'Naruto Shippuden', views: Math.floor(Math.random() * 400) + 800 },
          { id: 'one-piece', title: 'One Piece', views: Math.floor(Math.random() * 300) + 700 },
          { id: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', views: Math.floor(Math.random() * 200) + 600 },
          { id: 'demon-slayer', title: 'Demon Slayer', views: Math.floor(Math.random() * 100) + 500 },
        ]
      };
    } catch (e) {
      console.error('Error fetching telemetry:', e);
      return { dau: 0, topWatched: [] };
    }
  }

  // Admin Security Helpers
  public isAdmin(uid: string | undefined): boolean {
    if (!uid) return false;
    return ADMIN_UIDS.includes(uid);
  }

  async getAllUsersCount(): Promise<number> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.size;
    } catch (e) {
      console.error('Error fetching user count:', e);
      return 0;
    }
  }

  async seedLeaderboard(): Promise<void> {
    const bots = [
      { name: 'Amai Master', xp: 1250000, rank: 'Amai Overlord' },
      { name: 'ZenithWatcher', xp: 550000, rank: 'Celestial' },
      { name: 'GhostShogun', xp: 280000, rank: 'Mythic' },
      { name: 'NeonSamurai', xp: 140000, rank: 'Legend' },
      { name: 'MidnightOtaku', xp: 75000, rank: 'Anime Master' },
      { name: 'DubLover99', xp: 45000, rank: 'Elite Watcher' },
      { name: 'SubTitan', xp: 22000, rank: 'Otaku' },
      { name: 'KawaiiCrusader', xp: 8000, rank: 'Watcher' },
      { name: 'BakaBot', xp: 2500, rank: 'Apprentice' },
      { name: 'NewbieSan', xp: 500, rank: 'Newbie' }
    ];

    console.log(`UserDataService: Seeding ${bots.length} system bots...`);
    
    for (const bot of bots) {
      const botId = `bot_${bot.name.toLowerCase().replace(/\s+/g, '_')}`;
      const userRef = this.getUserDocRef(botId);
      
      const botProfile: UserProfile = {
        uid: botId,
        email: `${botId}@amai.tv`,
        displayName: bot.name,
        photoURL: null,
        createdAt: Date.now() - (Math.random() * 1000000000),
        lastLoginAt: Date.now(),
        stats: {
          xp: bot.xp,
          rank: bot.rank,
          level: Math.floor(bot.xp / 1000) + 1,
          totalMinutesWatched: Math.floor(bot.xp / 10),
          episodesCompleted: Math.floor(bot.xp / 200)
        },
        preferences: { theme: 'dark', language: 'en', notifications: false },
        tier: 'premium',
        bio: 'Official Amai TV System Bot',
        favoriteGenres: ['Action', 'Mystery', 'Sci-Fi'],
        socialLinks: [],
        bannerColor: '#f59e0b',
        achievements: ['early_adopter', 'system_legend']
      };

      await setDoc(userRef, botProfile);
    }
    console.log('UserDataService: Seeding complete.');
  }
}

export const userDataService = new UserDataService();
