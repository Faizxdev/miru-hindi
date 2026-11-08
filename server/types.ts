export interface EpisodeItem {
  number?: string | null;
  title?: string | null;
  url: string;
  poster?: string | null;
  players?: PlayerSourceItem[];
}

export interface RegionalLanguageInfo {
  isNonRegional: boolean;
  isSubbed: boolean;
  isDubbed: boolean;
  languageType: 'dubbed' | 'subbed' | 'unknown';
}

export interface SeasonItem {
  season: number | string;
  label: string;
  nonRegional: boolean;
  regionalLanguageInfo?: RegionalLanguageInfo;
}

export interface AnimeDetailsResponse {
  url: string;
  title: string;
  image?: string | null;
  postId: number;
  season?: number | null;
  totalSeasons?: number | null;
  seasons: SeasonItem[];
  episodes: EpisodeItem[];
  poster?: string | null;
  genres?: string[];
  year?: number | null;
  totalEpisodes?: number | null;
  duration?: string | null;
  languages?: string[];
  synopsis?: string | null;
  status?: string | null;
  players?: PlayerSourceItem[];
  related?: { url: string; title?: string | null; poster?: string | null; genres?: string[]; postId?: number }[];
  smartButtons?: { url: string; actionText: string; episodeText: string; buttonClass: string }[];
  rating?: number | null;
}

export interface PlayerSourceItem {
  src: string;
  label?: string | null;
  quality?: string | null;
  kind: 'iframe' | 'video';
}

export interface SeriesListItem {
  title: string | null;
  url: string;
  image?: string | null;
  postId?: number;
  season?: string;
  episodeRange?: string;
}

export interface AnimeListResponse {
  page: number;
  items: SeriesListItem[];
}


export interface TMDBDetails {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  first_air_date?: string;
  release_date?: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  number_of_episodes?: number;
}

export interface ScheduleItem {
  title: string;
  url: string;
  time: string;
  type: string;
  poster: string;
  description: string;
  isNew?: boolean;
}

export interface ScheduleDay {
  day: string;
  count: number;
  items: ScheduleItem[];
  isToday?: boolean;
}

export interface UpcomingItem {
  title: string;
  poster: string;
  countdown?: string;
  url: string;
  id?: string;
}
