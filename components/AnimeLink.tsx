"use client";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api";
import { createTitleUrl } from "@/lib/utils";

type Props = {
  seriesUrl: string;
  postId?: number;
  className?: string;
  children: React.ReactNode;
};

export default function AnimeLink({ seriesUrl, postId, className, children }: Props) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    let finalPostId = postId;
    
    // Extract title from URL to generate slug
    // Handle both full URLs and relative paths
    let title = '';
    try {
      if (seriesUrl.startsWith('http')) {
        // Full URL: extract the last part after the last slash
        const url = new URL(seriesUrl);
        title = url.pathname.split('/').filter(Boolean).pop() || '';
      } else {
        // Relative path: extract the last part
        title = seriesUrl.split('/').filter(Boolean).pop() || '';
      }
      title = decodeURIComponent(title);
    } catch (error) {
      // Fallback: use the original logic
      title = decodeURIComponent(seriesUrl.split('/').filter(Boolean).pop() || '');
    }
    
    console.log(`AnimeLink: Original URL: ${seriesUrl}, Extracted title: "${title}"`);
    
    // Check if this is a movie or anime series
    // First check URL path, then check title content for movie indicators
    const isMovieByUrl = /\/movies\//i.test(seriesUrl);
    const isMovieByTitle = /movie|film|ova|special|theatrical|cinema|journey|adventure|quest|tale|story|record|parallel|west|east|north|south|expedition|mission|chronicles|saga|legend|myth|epic/i.test(title);
    const isMovie = isMovieByUrl || isMovieByTitle;
    
    console.log(`AnimeLink: URL: ${seriesUrl}, Title: "${title}", isMovieByUrl: ${isMovieByUrl}, isMovieByTitle: ${isMovieByTitle}, isMovie: ${isMovie}`);
    
    if (!finalPostId || !Number.isFinite(finalPostId)) {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/api/anime_details?url=${encodeURIComponent(seriesUrl)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.postId === "number" && Number.isFinite(data.postId)) {
            finalPostId = data.postId;
          }
        }
      } catch {}
    }
    
    // Generate appropriate URL based on content type
    let targetUrl: string;
    if (isMovie) {
      // For movies, use /movies/[slug] format
      const movieSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      targetUrl = `/movies/${movieSlug}`;
      console.log(`Routing movie to: ${targetUrl}`);
    } else {
      // For anime series, use /title/[slug] format
      targetUrl = createTitleUrl(title, finalPostId);
      console.log(`Routing anime to: ${targetUrl}`);
    }
    
    router.push(targetUrl);
  };

  // Generate appropriate href based on content type
  let title = '';
  try {
    if (seriesUrl.startsWith('http')) {
      // Full URL: extract the last part after the last slash
      const url = new URL(seriesUrl);
      title = url.pathname.split('/').filter(Boolean).pop() || '';
    } else {
      // Relative path: extract the last part
      title = seriesUrl.split('/').filter(Boolean).pop() || '';
    }
    title = decodeURIComponent(title);
  } catch (error) {
    // Fallback: use the original logic
    title = decodeURIComponent(seriesUrl.split('/').filter(Boolean).pop() || '');
  }
  
  const isMovieByUrl = /\/movies\//i.test(seriesUrl);
  const isMovieByTitle = /movie|film|ova|special|theatrical|cinema|journey|adventure|quest|tale|story|record|parallel|west|east|north|south|expedition|mission|chronicles|saga|legend|myth|epic/i.test(title);
  const isMovie = isMovieByUrl || isMovieByTitle;
  
  let href: string;
  if (isMovie) {
    const movieSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    href = `/movies/${movieSlug}`;
  } else {
    href = createTitleUrl(title, postId);
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}


