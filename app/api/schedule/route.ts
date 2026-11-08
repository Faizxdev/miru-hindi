import { NextResponse } from 'next/server';
import { fetchRegionalSchedule } from '@/server/scraper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schedule = await fetchRegionalSchedule();
    return NextResponse.json(schedule, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error('API Error (Schedule):', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
