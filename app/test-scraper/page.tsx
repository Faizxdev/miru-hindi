import { fetchAnimeList } from "@/server/scraper";

export default async function TestScraperPage() {
  try {
    console.log("=== TEST SCRAPER PAGE LOADED ===");
    
    // Test basic scraper functionality
    const page1Data = await fetchAnimeList(1);
    console.log(`Page 1 returned ${page1Data.items.length} items`);
    
    // Get first few items for display
    const firstItems = page1Data.items.slice(0, 10);
    
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Scraper Test Page</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Page 1 Results</h2>
          <p>Total items found: {page1Data.items.length}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">First 10 Items</h2>
          <div className="space-y-2">
            {firstItems.map((item, idx) => (
              <div key={idx} className="bg-gray-800 p-3 rounded">
                <div className="font-medium">{item.title || 'No Title'}</div>
                <div className="text-sm text-gray-400">{item.url}</div>
                <div className="text-xs text-gray-500">Post ID: {item.postId || 'None'}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Movie Detection Test</h2>
          {firstItems.map((item, idx) => {
            const isMovieByUrl = /\/movies\//i.test(item.url);
            const title = item.title || '';
            const isMovieByTitle = /movie|film|ova|special|theatrical|cinema|journey|adventure|quest|tale|story|record|parallel|west|east|north|south|expedition|mission|chronicles|saga|legend|myth|epic|doraemon/i.test(title);
            const isMovie = isMovieByUrl || isMovieByTitle;
            
            return (
              <div key={idx} className={`p-3 rounded ${isMovie ? 'bg-green-800' : 'bg-gray-800'}`}>
                <div className="font-medium">{item.title || 'No Title'}</div>
                <div className="text-sm text-gray-400">{item.url}</div>
                <div className="text-xs">
                  URL Movie: {isMovieByUrl ? 'Yes' : 'No'} | 
                  Title Movie: {isMovieByTitle ? 'Yes' : 'No'} | 
                  Final: {isMovie ? 'MOVIE' : 'Not Movie'}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-sm text-gray-400">
          Check browser console for detailed logs
        </div>
        
      </div>
    );
    
  } catch (error) {
    console.error("Test scraper page error:", error);
    
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Scraper Test Page - ERROR</h1>
        <div className="bg-red-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Error occurred:</h2>
          <pre className="text-sm">{error instanceof Error ? error.message : String(error)}</pre>
        </div>
      </div>
    );
  }
}
