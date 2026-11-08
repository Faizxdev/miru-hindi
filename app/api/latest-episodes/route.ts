import { NextResponse } from "next/server";
import { getLatestEpisodesFeed } from "@/lib/homeFeed";
import { FALLBACK_ONGOING } from "@/lib/fallbackCatalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rawItems = await getLatestEpisodesFeed(12);
    const items = (rawItems && rawItems.length > 0) ? rawItems : FALLBACK_ONGOING.slice(0, 10);

    return NextResponse.json(
      { items, refreshedAt: Date.now() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.warn("[Latest Episodes API] Using fallback items:", error?.message || '');
    return NextResponse.json(
      { items: FALLBACK_ONGOING.slice(0, 10), refreshedAt: Date.now() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
