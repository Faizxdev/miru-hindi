"use client";

import { useRouter } from 'next/navigation';

interface SmartButton {
  url: string;
  actionText: string;
  episodeText: string;
  buttonClass: string;
}

interface SmartButtonsProps {
  buttons: SmartButton[];
}

export default function SmartButtons({ buttons }: SmartButtonsProps) {
  const router = useRouter();

  // Function to parse season and episode from URL
  const parseSeasonAndEpisode = (url: string): { season?: number; episode?: number; episodeUrl: string } => {
    try {
      // Handle both full URLs and relative URLs
      let urlObj: URL;
      if (url.startsWith('http')) {
        urlObj = new URL(url);
      } else {
        // If it's a relative URL, make it absolute using a dummy base for parsing
        urlObj = new URL(url, 'http://localhost');
      }

      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      console.log(`SmartButtons: URL path parts:`, pathParts);

      // Look for episode pattern in the URL
      if (pathParts.includes('episode')) {
        const episodeIndex = pathParts.indexOf('episode');
        const episodeSlug = pathParts[episodeIndex + 1];

        if (episodeSlug) {
          console.log(`SmartButtons: Episode slug: ${episodeSlug}`);

          // Try to extract season and episode from patterns like:
          // - naruto-shippuden-1x1
          // - one-piece-12x259
          // - attack-on-titan-22x500
          // - s1e1, s12e259, s22e500
          const seasonEpisodeMatch = episodeSlug.match(/-(\d+)x(\d+)$/i) ||
            episodeSlug.match(/s(\d+)e(\d+)$/i) ||
            episodeSlug.match(/season-(\d+)-episode-(\d+)$/i);

          if (seasonEpisodeMatch) {
            const season = parseInt(seasonEpisodeMatch[1], 10);
            const episode = parseInt(seasonEpisodeMatch[2], 10);
            console.log(`SmartButtons: Found season ${season}, episode ${episode}`);
            return { season, episode, episodeUrl: url };
          }
        }

        // If no season/episode pattern found, just return the URL
        return { episodeUrl: url };
      }

      // Check if it's a series URL that might need episode extraction
      if (pathParts.includes('series') || pathParts.includes('movies')) {
        console.log(`SmartButtons: Series/Movie URL detected`);
        // For series URLs, we'll let the watch page handle finding the appropriate episode
        return { episodeUrl: url };
      }

      return { episodeUrl: url };
    } catch (error) {
      console.error('Error parsing URL:', error);
      return { episodeUrl: url };
    }
  };

  const handleButtonClick = (url: string) => {
    console.log(`SmartButtons: Processing URL: ${url}`);

    // Validate that we have a valid URL
    if (!url || url.trim().length === 0) {
      console.error(`SmartButtons: Empty or invalid URL: ${url}`);
      return;
    }

    const { season, episode, episodeUrl } = parseSeasonAndEpisode(url);

    console.log(`SmartButtons: Parsed - Season: ${season}, Episode: ${episode}, EpisodeUrl: ${episodeUrl}`);

    // Validate the episode URL
    if (!episodeUrl || episodeUrl.trim().length === 0) {
      console.error(`SmartButtons: Empty episode URL after parsing: ${url}`);
      return;
    }

    // Build the watch URL with proper parameters
    const params = new URLSearchParams();
    params.set('episode', encodeURIComponent(episodeUrl));

    // Add season parameter if we found one
    if (season) {
      params.set('season', season.toString());
    }

    // Add post_id if it's in the URL
    try {
      const urlObj = new URL(url);
      const postId = urlObj.searchParams.get('post_id');
      if (postId) {
        params.set('post_id', postId);
      }
    } catch (error) {
      // Ignore URL parsing errors
    }

    // If this is a series URL (not an episode URL), we might need to add the series URL parameter
    if (episodeUrl.includes('/series/') && !episodeUrl.includes('/episode/')) {
      params.set('url', encodeURIComponent(episodeUrl));
    }

    const watchUrl = `/watch?${params.toString()}`;
    console.log(`SmartButtons: Final watch URL: ${watchUrl}`);
    router.push(watchUrl);
  };

  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleButtonClick(button.url)}
          className="
            group relative overflow-hidden px-6 py-4 rounded-lg
            bg-gray-800 hover:bg-gray-700
            text-white font-semibold text-sm
            transition-all duration-300 ease-out
            shadow-md hover:shadow-lg
            transform hover:scale-105 active:scale-95
            border border-gray-600 hover:border-gray-500
            min-w-[140px]
          "
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>

          {/* Content */}
          <div className="relative flex items-center justify-center gap-2">
            {/* Play icon */}
            <div className="w-5 h-5 flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Text content */}
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold leading-tight">
                {button.actionText}
              </span>
              <span className="text-xs opacity-90 font-medium">
                {button.episodeText}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
