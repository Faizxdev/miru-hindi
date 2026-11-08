import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimeDetails } from '@/server/scraper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  const postId = Number(searchParams.get('post_id') || '0');
  const seasonRaw = searchParams.get('season') || undefined;
  if (!url) return NextResponse.json({ error: true, message: 'Missing url' }, { status: 400 });
  try {
    const data = await fetchAnimeDetails({ url, postId, season: seasonRaw ? Number(seasonRaw) : undefined });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: true, message: e?.message || 'Failed to fetch anime details' }, { status: 500 });
  }
}


