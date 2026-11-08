// Anime avatar images for user profiles
export const ANIME_AVATARS = [
  'https://i.ibb.co/DgtgVhFj/anime-avatar-1.jpg',
  'https://i.ibb.co/zhyndzT5/anime-avatar-2.jpg', 
  'https://i.ibb.co/tPX4qv8d/anime-avatar-3.jpg',
  'https://i.ibb.co/27Xp5mPW/anime-avatar-4.jpg',
  'https://i.ibb.co/tP3h97Sz/anime-avatar-5.jpg',
  'https://i.ibb.co/ZzTBRXJm/anime-avatar-6.jpg',
  'https://i.ibb.co/nNBw1TjR/anime-avatar-7.jpg',
  'https://i.ibb.co/5X7nmZn7/anime-avatar-8.jpg',
  'https://i.ibb.co/wFDs2HKf/anime-avatar-9.jpg',
  'https://i.ibb.co/gbLzZ5f4/anime-avatar-10.jpg',
  'https://i.ibb.co/DfFBmV5r/anime-avatar-11.jpg'
];

/**
 * Get a random anime avatar for a user
 * Uses the user's UID to ensure consistent avatar selection
 */
export function getRandomAnimeAvatar(uid: string): string {
  // Use the UID to generate a consistent "random" index
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    const char = uid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % ANIME_AVATARS.length;
  return ANIME_AVATARS[index];
}

/**
 * Get a random anime avatar (truly random, not consistent)
 */
export function getRandomAnimeAvatarRandom(): string {
  const randomIndex = Math.floor(Math.random() * ANIME_AVATARS.length);
  return ANIME_AVATARS[randomIndex];
}
