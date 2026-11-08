import { fetchAnimeList } from "@/server/scraper";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== DEBUG API CALLED ===");
    
    // Test the scraper
    const page1Data = await fetchAnimeList(1);
    console.log(`Page 1 returned ${page1Data.items.length} items`);
    
    // Log first few items
    const firstItems = page1Data.items.slice(0, 5);
    console.log("First 5 items:");
    firstItems.forEach((item, idx) => {
      console.log(`  ${idx + 1}. Title: "${item.title}", URL: ${item.url}`);
    });
    
    // Look for movies specifically
    const movies = page1Data.items.filter(item => /\/movies\//i.test(item.url));
    console.log(`Found ${movies.length} movies on page 1`);
    movies.forEach((movie, idx) => {
      console.log(`  Movie ${idx + 1}: "${movie.title}" at ${movie.url}`);
    });
    
    // Look for Doraemon specifically
    const doraemonItems = page1Data.items.filter(item => {
      const title = item.title || '';
      return title.toLowerCase().includes('doraemon');
    });
    console.log(`Found ${doraemonItems.length} Doraemon items on page 1`);
    doraemonItems.forEach((item, idx) => {
      console.log(`  Doraemon ${idx + 1}: "${item.title}" at ${item.url}`);
    });
    
    return NextResponse.json({
      success: true,
      page1Items: page1Data.items.length,
      firstItems: firstItems.map(item => ({ title: item.title, url: item.url })),
      movies: movies.map(item => ({ title: item.title, url: item.url })),
      doraemonItems: doraemonItems.map(item => ({ title: item.title, url: item.url }))
    });
    
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
