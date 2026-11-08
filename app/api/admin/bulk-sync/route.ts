import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimeList, fetchAnimeDetails, fetchMoviesList, fetchCartoonList } from '@/server/scraper';
import { animeCacheService } from '@/lib/animeCacheService';
import { userDataService } from '@/lib/userDataService';

// Security: Verify Admin UID and Secret Key
async function verifyAdmin(request: NextRequest) {
  const adminUid = request.headers.get('x-admin-uid');
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET; // Using existing secret for simplicity

  if (!adminUid) return false;
  
  // 1. Verify UID belongs to an admin
  const isUidAdmin = await userDataService.isAdmin(adminUid);
  if (!isUidAdmin) return false;

  // 2. Verify Secret Key (if configured)
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    console.error('Security Alert: Attempted admin action with invalid Secret Key');
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Invalid Admin Credentials or Secret Key' }, { status: 401 });
  }

  const { action, page, slugs, type } = await request.json();

  try {
    // 1. DISCOVER: Get slugs from a specific listing page
    if (action === 'discover') {
      let resp;
      if (type === 'movies') {
        resp = await fetchMoviesList(page || 1);
      } else if (type === 'cartoon') {
        resp = await fetchCartoonList(page || 1);
      } else {
        resp = await fetchAnimeList(page || 1);
      }
      
      return NextResponse.json({ 
        items: resp.items.map(i => ({ 
          title: i.title, 
          url: i.url, 
          slug: i.url.split('/').filter(Boolean).pop() 
        })),
        page: resp.page
      });
    }

    // 2. IMPORT: Fetch details for a list of slugs and save to cache
    if (action === 'import' && Array.isArray(slugs)) {
      const deepSync = Boolean(request.headers.get('x-deep-sync') === 'true'); // Or pass it in the initial body
      const results = [];
      for (const item of slugs) {
        try {
          console.log(`Bulk Importer: Syncing ${item.slug} (Deep: ${deepSync})`);
          // fetchAnimeDetails handles the saving to cache internally
          await fetchAnimeDetails({ 
            url: item.url, 
            postId: item.postId || 0,
            includePlayers: deepSync 
          });
          results.push({ slug: item.slug, status: 'success' });
          
          // Small delay to avoid hammering the source site
          await new Promise(resolve => setTimeout(resolve, deepSync ? 1000 : 500));
        } catch (err: any) {
          console.error(`Bulk Importer: Failed to sync ${item.slug}`, err);
          results.push({ slug: item.slug, status: 'error', error: err.message });
        }
      }
      return NextResponse.json({ results });
    }

    // 3. CLEAR: Wipe the entire animes collection
    if (action === 'clear') {
      console.log('Bulk Importer: Wiping database...');
      await animeCacheService.clearAllCache();
      return NextResponse.json({ success: true, message: 'Database cleared' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Bulk Sync API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
