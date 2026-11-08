import { NextRequest, NextResponse } from 'next/server';
import { fetchEpisodePlayers } from '@/server/scraper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  if (!url) return NextResponse.json({ error: true, message: 'Missing url' }, { status: 400 });
  try {
    const items = await fetchEpisodePlayers(url);
    return NextResponse.json({ url, items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: true, message: e?.message || 'Failed to fetch players' }, { status: 500 });
  }
}


