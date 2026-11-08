import { NextResponse } from 'next/server';
import { fetchRegionalSchedule } from '@/server/scraper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schedule = await fetchRegionalSchedule();
    return NextResponse.json(schedule || [], {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error: any) {
    console.warn('[Schedule API] Returning safe empty list:', error?.message || '');
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
}
