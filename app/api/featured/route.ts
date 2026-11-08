import { NextResponse } from "next/server";
import { getFeaturedAnime } from "@/server/featured";
import { FALLBACK_FEATURED } from "@/lib/fallbackCatalog";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const heroItems = await getFeaturedAnime();
    const finalItems = (heroItems && heroItems.length > 0) ? heroItems : FALLBACK_FEATURED;
    return NextResponse.json(finalItems, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error: any) {
    console.warn("[Featured API] Using fallback featured anime:", error?.message || '');
    return NextResponse.json(FALLBACK_FEATURED, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  }
}
