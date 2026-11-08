import { fetchUpcomingEpisodes } from "@/server/scraper";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchUpcomingEpisodes();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error('Error in upcoming episodes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming episodes' },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
