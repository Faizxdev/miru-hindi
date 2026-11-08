import { NextResponse } from 'next/server';
import { fetchAnimeList, fetchAnimeDetails } from '@/server/scraper';
import { animeCacheService } from '@/lib/animeCacheService';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // 1. Validate Secret
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs: string[] = [];
  const types = ['series', 'movies', 'cartoon'];
  let totalSynced = 0;

  try {
    for (const type of types) {
      console.log(`[Cron] Starting sync for type: ${type}`);
      // Fetch Page 1 only for the cron job to keep it lightweight
      const response = await fetchAnimeList(1, type);
      const items = response.items || [];
      
      // Limit to first 10 items to stay within serverless timeout
      const slice = items.slice(0, 10);
      
      for (const item of slice) {
        const itemSlug = item.url.split('/').filter(Boolean).pop() || '';
        try {
          // Perform shallow sync (metadata + 1st episode check)
          const details = await fetchAnimeDetails({ 
            url: item.url, 
            postId: item.postId || 0, 
            includePlayers: false 
          });
          if (details) {
            await animeCacheService.saveAnime(itemSlug, {
              ...details,
              id: itemSlug,
              lastFetched: Date.now()
            });
            totalSynced++;
          }
        } catch (itemErr) {
          console.error(`[Cron] Failed to sync ${itemSlug}:`, itemErr);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      totalSynced,
      message: `Successfully synced ${totalSynced} items from Page 1 of all categories.`
    });

  } catch (err: any) {
    console.error('[Cron] Critical sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
