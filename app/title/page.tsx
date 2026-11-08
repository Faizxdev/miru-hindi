import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";

export default async function TitlePage({ searchParams }: { searchParams: { url?: string; post_id?: string; season?: string } }) {
  const url = searchParams?.url || "";
  const postId = searchParams?.post_id;
  const season = searchParams?.season;
  
  if (!url) {
    redirect("/");
  }
  
  // Extract title from URL and generate slug
  const title = decodeURIComponent(url.split('/').filter(Boolean).pop() || '');
  const slug = generateSlug(title);
  
  // Build new URL with query parameters
  const newUrl = `/title/${slug}${postId ? `?post_id=${postId}` : ''}${season ? `${postId ? '&' : '?'}season=${season}` : ''}`;
  
  redirect(newUrl);
}


