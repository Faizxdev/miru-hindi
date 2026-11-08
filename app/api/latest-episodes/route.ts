import { NextResponse } from "next/server";
import { getLatestEpisodesFeed } from "@/lib/homeFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await getLatestEpisodesFeed(12);

    return NextResponse.json(
      { items, refreshedAt: Date.now() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error in latest episodes API:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest episodes" },
      { status: 500 }
    );
  }
}
