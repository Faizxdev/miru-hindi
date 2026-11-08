// Utility function to generate a slug from a title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Separate accents from characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove remaining special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Utility function to create title URL
export function createTitleUrl(title: string, postId?: number, season?: number): string {
  const slug = generateSlug(title);
  const params = new URLSearchParams();
  if (postId) params.set('post_id', postId.toString());
  if (season) params.set('season', season.toString());
  const queryString = params.toString();
  return queryString ? `/title/${slug}?${queryString}` : `/title/${slug}`;
}
