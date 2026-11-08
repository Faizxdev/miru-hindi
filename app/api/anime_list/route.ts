import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimeList } from '@/server/scraper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') || '1');
  try {
    const data = await fetchAnimeList(Number.isFinite(page) ? page : 1);
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: true, message: e?.message || 'Failed to fetch anime list' }, { status: 500 });
  }
}


