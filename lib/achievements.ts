export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  tier: 'free' | 'premium'; // 'free' = available to everyone, 'premium' = premium only
  condition: (ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
  totalMinutesWatched: number;
  episodesCompleted: number;
  myListCount: number;
  loginStreak: number;
  accountAgeDays: number;
  socialLinksCount: number;
  currentHour: number;
  leaderboardPosition: number | null;
  tier: 'free' | 'premium';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Watch your first episode',
    icon: '👣',
    xpReward: 50,
    tier: 'free',
    condition: (ctx) => ctx.episodesCompleted >= 1
  },
  {
    id: 'binge_starter',
    name: 'Binge Starter',
    description: 'Watch 5 episodes total',
    icon: '🍿',
    xpReward: 100,
    tier: 'free',
    condition: (ctx) => ctx.episodesCompleted >= 5
  },
  {
    id: 'binge_lord',
    name: 'Binge Lord',
    description: 'Watch 25 episodes total',
    icon: '🔥',
    xpReward: 200,
    tier: 'free',
    condition: (ctx) => ctx.episodesCompleted >= 25
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Watch between 12 AM and 5 AM',
    icon: '🦉',
    xpReward: 100,
    tier: 'free',
    condition: (ctx) => ctx.currentHour >= 0 && ctx.currentHour < 5
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Add 10 items to My List',
    icon: '📚',
    xpReward: 150,
    tier: 'free',
    condition: (ctx) => ctx.myListCount >= 10
  },
  {
    id: 'otaku_scholar',
    name: 'Otaku Scholar',
    description: 'Complete 10 anime series',
    icon: '🎓',
    xpReward: 500,
    tier: 'free',
    condition: (ctx) => ctx.episodesCompleted >= 50
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Achieve a 3-day login streak',
    icon: '⚡',
    xpReward: 100,
    tier: 'free',
    condition: (ctx) => ctx.loginStreak >= 3
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Achieve a 7-day login streak',
    icon: '💎',
    xpReward: 300,
    tier: 'free',
    condition: (ctx) => ctx.loginStreak >= 7
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Achieve a 30-day login streak',
    icon: '🏅',
    xpReward: 1000,
    tier: 'free',
    condition: (ctx) => ctx.loginStreak >= 30
  },
  {
    id: 'hour_10',
    name: 'Time Traveler',
    description: 'Watch 10 hours of anime',
    icon: '⏰',
    xpReward: 300,
    tier: 'free',
    condition: (ctx) => ctx.totalMinutesWatched >= 600
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Watch 100 hours of anime',
    icon: '💯',
    xpReward: 1000,
    tier: 'free',
    condition: (ctx) => ctx.totalMinutesWatched >= 6000
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Add 3 social links to your profile',
    icon: '🦋',
    xpReward: 200,
    tier: 'free',
    condition: (ctx) => ctx.socialLinksCount >= 3
  },
  {
    id: 'top_10',
    name: 'Elite',
    description: 'Reach the global top 10',
    icon: '🏆',
    xpReward: 500,
    tier: 'free',
    condition: (ctx) => ctx.leaderboardPosition !== null && ctx.leaderboardPosition <= 10
  },
  {
    id: 'veteran',
    name: 'Amai Veteran',
    description: 'Have an account for 30+ days',
    icon: '🎖️',
    xpReward: 250,
    tier: 'free',
    condition: (ctx) => ctx.accountAgeDays >= 30
  },
  {
    id: 'mega_collector',
    name: 'Mega Collector',
    description: 'Add 50 items to My List',
    icon: '🗄️',
    xpReward: 500,
    tier: 'free',
    condition: (ctx) => ctx.myListCount >= 50
  }
];

// Weekly challenges — rotate by ISO week number
export const WEEKLY_CHALLENGES = [
  { id: 'watch_5', name: 'Episode Rush', description: 'Watch 5 episodes this week', target: 5, type: 'episodes' as const, xpReward: 500 },
  { id: 'watch_3h', name: 'Marathon Runner', description: 'Watch 3 hours this week', target: 180, type: 'minutes' as const, xpReward: 500 },
  { id: 'list_5', name: 'Curator', description: 'Add 5 items to My List this week', target: 5, type: 'list_adds' as const, xpReward: 500 },
  { id: 'watch_10', name: 'Binge King', description: 'Watch 10 episodes this week', target: 10, type: 'episodes' as const, xpReward: 750 },
  { id: 'watch_5h', name: 'Endurance', description: 'Watch 5 hours this week', target: 300, type: 'minutes' as const, xpReward: 750 },
];

export function getCurrentWeekChallenge() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const challenge = WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length];
  return { ...challenge, weekId: `${now.getFullYear()}-W${weekNumber}` };
}

export function checkAchievements(
  unlocked: string[],
  ctx: AchievementContext
): Achievement[] {
  return ACHIEVEMENTS.filter(a => {
    if (unlocked.includes(a.id)) return false;
    // 'free' = everyone, 'premium' = premium only
    if (a.tier === 'premium' && ctx.tier === 'free') return false; 
    return a.condition(ctx);
  });
}
