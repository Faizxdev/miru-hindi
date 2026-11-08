import { NextResponse } from "next/server";
import { getFeaturedAnime } from "@/server/featured";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const heroItems = await getFeaturedAnime();
    return NextResponse.json(heroItems, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch featured anime:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured anime" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
