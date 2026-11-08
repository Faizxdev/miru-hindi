import { fetchOngoingSeries } from "@/server/scraper";
import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_ONGOING } from "@/lib/fallbackCatalog";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const query = searchParams.get('q') || '';
    
    const data = await fetchOngoingSeries(page, query);
    const finalData = (data && data.items && data.items.length > 0) ? data : { page, items: FALLBACK_ONGOING };
    
    return NextResponse.json(finalData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error: any) {
    console.warn('[Ongoing API] Using fallback ongoing series:', error?.message || '');
    return NextResponse.json(
      { page: 1, items: FALLBACK_ONGOING },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
