import { fetchUpcomingEpisodes } from "@/server/scraper";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchUpcomingEpisodes();
    return NextResponse.json(data || [], {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error: any) {
    console.warn('[Upcoming API] Returning safe empty list:', error?.message || '');
    return NextResponse.json([], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
}
