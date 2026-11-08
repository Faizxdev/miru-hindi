import { fetchAnimeList, fetchFreshDrops } from "@/server/scraper";
import { SeriesListItem } from "@/server/types";

function mergeUniqueSeries(items: SeriesListItem[], limitCount: number) {
  const seen = new Set<string>();
  const merged: SeriesListItem[] = [];

  for (const item of items) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);
    merged.push(item);

    if (merged.length >= limitCount) {
      break;
    }
  }

  return merged;
}

export async function getLatestEpisodesFeed(limitCount: number = 12): Promise<SeriesListItem[]> {
  const [freshDrops, latestData] = await Promise.all([
    fetchFreshDrops(),
    fetchAnimeList(2),
  ]);

  return mergeUniqueSeries([...(freshDrops || []), ...(latestData.items || [])], limitCount);
}
