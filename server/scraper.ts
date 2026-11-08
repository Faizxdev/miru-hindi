import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { AnimeDetailsResponse, AnimeListResponse, EpisodeItem, SeasonItem, SeriesListItem, PlayerSourceItem, TMDBDetails, ScheduleDay, ScheduleItem } from './types';
import { settingsService } from '@/lib/settingsService';
import { animeCacheService } from '@/lib/animeCacheService';

export const DEFAULT_BASE = 'https://animesalt.cx';
export let BASE = (process.env.SITE_BASE || process.env.NEXT_PUBLIC_SITE_BASE || DEFAULT_BASE).replace(/\/+$/, '');
export let AJAX = `${BASE}/wp-admin/admin-ajax.php`;

export async function refreshDynamicConfig() {
  try {
    const settings = await settingsService.getSettings();
    if (settings.site_base && settings.site_base.trim()) {
      BASE = settings.site_base.replace(/\/+$/, '');
    } else if (!BASE) {
      BASE = (process.env.SITE_BASE || process.env.NEXT_PUBLIC_SITE_BASE || DEFAULT_BASE).replace(/\/+$/, '');
    }
  } catch {
    if (!BASE) {
      BASE = (process.env.SITE_BASE || process.env.NEXT_PUBLIC_SITE_BASE || DEFAULT_BASE).replace(/\/+$/, '');
    }
  }
  AJAX = `${BASE}/wp-admin/admin-ajax.php`;
  if (http && BASE) {
    http.defaults.baseURL = BASE;
    http.defaults.headers['Referer'] = `${BASE}/`;
    http.defaults.headers['Origin'] = BASE;
  }
}

export function stripBaseUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const fullUrl = new URL(url, BASE).toString();
    if (fullUrl.startsWith(BASE)) {
      const rel = fullUrl.replace(BASE, '');
      return rel || '/';
    }
    return fullUrl;
  } catch {
    return url;
  }
}

function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Referer: `${BASE}/`,
      Origin: BASE,
      'X-Requested-With': 'XMLHttpRequest',
    },
    timeout: 8_000,
  });
  return instance;
}

const http = createHttpClient();

export function extractNonceFromHtml(html: string): string | null {
  const m = html.match(/"nonce"\s*:\s*"([a-f0-9]+)"/i);
  return m ? m[1] : null;
}

export function extractPostIdFromHtml(html: string): number | null {
  const patterns: RegExp[] = [
    /postid-(\d+)/i,
    /"post"\s*:\s*"?(\d+)"?/i,
    /data-post(?:-id)?\s*=\s*"?(\d+)"?/i,
    /post_id\s*=\s*"?(\d+)"?/i,
    /var\s+post(?:Id|_id)\s*=\s*(\d+)/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const n = Number(m[1]);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function parseEpisodesFromHtml(html: string): EpisodeItem[] {
  const $ = cheerio.load(html);
  const episodes: EpisodeItem[] = [];

  console.log(`parseEpisodesFromHtml: HTML length: ${html.length}`);
  console.log(`parseEpisodesFromHtml: Found ${$('article.post.episodes').length} article.post.episodes elements`);
  console.log(`parseEpisodesFromHtml: Found ${$('a[href*="/episode"]').length} episode links`);

  $('article.post.episodes').each((_, el) => {
    const link = $(el).find('a[href*="/episode"]').first();
    const href = link.attr('href');
    const titleEl = $(el).find('h2.entry-title').first();
    const titleText = titleEl.text().trim() || link.text().trim() || null;
    const numberText = $(el).find('.num-epi').first().text().trim() || null;
    // try poster inside article
    let epPoster: string | null = null;
    const imgEl = $(el).find('img').first();
    if (imgEl && imgEl.length) {
      epPoster = imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('data-img') || imgEl.attr('data-original') || imgEl.attr('data-thumb') || imgEl.attr('src') || null;
      if (epPoster && /^data:image\/svg\+xml/i.test(epPoster)) {
        epPoster = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || null;
      }
      epPoster = stripBaseUrl(epPoster);
    }
    if (href) episodes.push({ number: numberText, title: titleText || null, url: new URL(href, BASE).toString(), poster: epPoster });
  });
  if (episodes.length === 0) {
    console.log(`parseEpisodesFromHtml: No episodes found in article.post.episodes, trying fallback selectors`);

    // Try multiple fallback selectors
    const fallbackSelectors = [
      'a[href*="/episode"]',
      '.episode-item a',
      '.episode-list a',
      'article a[href*="/episode"]',
      '.episodes a[href*="/episode"]'
    ];

    for (const selector of fallbackSelectors) {
      $(selector).each((_, a) => {
        const href = $(a).attr('href');
        if (!href) return;
        episodes.push({ title: $(a).text().trim() || null, url: new URL(href, BASE).toString(), poster: null });
      });
      if (episodes.length > 0) {
        console.log(`parseEpisodesFromHtml: Found ${episodes.length} episodes using fallback selector: ${selector}`);
        break;
      }
    }
  }

  console.log(`parseEpisodesFromHtml: Final episodes count: ${episodes.length}`);
  return episodes;
}

export function parseSeasonsFromHtml(html: string): SeasonItem[] {
  const $ = cheerio.load(html);
  const seasons: SeasonItem[] = [];

  console.log(`parseSeasonsFromHtml: Found ${$('a.season-btn').length} season buttons`);

  $('a.season-btn').each((_, a) => {
    const seasonRaw = $(a).attr('data-season');
    const label = $(a).text().trim();
    const classes = ($(a).attr('class') || '').split(/\s+/);
    const isNonRegional = classes.includes('non-regional');

    // Enhanced regional language detection
    let regionalLanguageInfo = {
      isNonRegional: isNonRegional,
      isSubbed: false,
      isDubbed: false,
      languageType: 'unknown' as 'dubbed' | 'subbed' | 'unknown'
    };

    // Check for [Sub] or [Dub] indicators in the label
    if (/\[Sub\]/i.test(label)) {
      regionalLanguageInfo.isSubbed = true;
      regionalLanguageInfo.languageType = 'subbed';
    } else if (/\[Dub\]/i.test(label)) {
      regionalLanguageInfo.isDubbed = true;
      regionalLanguageInfo.languageType = 'dubbed';
    }

    // If it has non-regional class, it's likely subbed
    if (isNonRegional && !regionalLanguageInfo.isSubbed && !regionalLanguageInfo.isDubbed) {
      regionalLanguageInfo.isSubbed = true;
      regionalLanguageInfo.languageType = 'subbed';
    }

    console.log(`parseSeasonsFromHtml: Season button - data-season: ${seasonRaw}, label: ${label}, classes: ${classes.join(', ')}, regional: ${JSON.stringify(regionalLanguageInfo)}`);

    if (seasonRaw) {
      const maybeNum = Number(seasonRaw);
      seasons.push({
        season: Number.isFinite(maybeNum) ? maybeNum : seasonRaw,
        label,
        nonRegional: isNonRegional,
        regionalLanguageInfo
      });
    }
  });

  return seasons;
}

export function parseAnimeListFromHtml(html: string): SeriesListItem[] {
  const $ = cheerio.load(html);
  const items: SeriesListItem[] = [];
  const seen = new Set<string>();
  $('article.post').each((_, el) => {
    // Look for both series and movie links
    let href = $(el).find('a[href*="/series/"]').first().attr('href');
    if (!href) href = $(el).find('a[href*="/movies/"]').first().attr('href');
    if (!href) href = $(el).find('a').first().attr('href') || undefined;
    if (!href) return;
    const abs = new URL(href, BASE).toString();
    if (seen.has(abs)) return;
    seen.add(abs);
    const title = $(el).find('h2.entry-title').first().text().trim() || $(el).find('a').first().text().trim() || null;
    let postId: number | undefined;
    const idAttr = $(el).attr('id') || '';
    const classAttr = $(el).attr('class') || '';
    const idMatch = idAttr.match(/post-(\d+)/) || classAttr.match(/post-(\d+)/);
    if (idMatch && idMatch[1]) { const n = Number(idMatch[1]); if (Number.isFinite(n)) postId = n; }
    // image
    let img: string | null = null;
    const imgEl = $(el).find('img').first();
    if (imgEl && imgEl.length) {
      img = imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('data-img') || imgEl.attr('data-original') || imgEl.attr('data-thumb') || imgEl.attr('data-thumbnail') || imgEl.attr('src') || null;
      if (img && /^data:/i.test(img)) img = null;
      if (!img) {
        const srcset = imgEl.attr('srcset') || imgEl.attr('data-srcset') || imgEl.attr('data-lazy-srcset') || '';
        const candidates = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(Boolean).filter(u => !/^data:/i.test(u));
        const pick = candidates[candidates.length - 1] || candidates[0];
        if (pick) img = pick;
      }
    }
    if (!img) {
      const styleEl = $(el).find('[style*="background-image"]').first();
      const style = styleEl.attr('style') || '';
      const m = style.match(/background-image\s*:\s*url\((['\"]?)([^)\'\"]+)\1\)/i);
      if (m && m[2]) img = m[2];
    }
    items.push({ title, url: abs, image: stripBaseUrl(img) || undefined, postId });
  });
  if (items.length === 0) {
    // Fallback: look for any series or movie links
    $('a[href*="/series/"], a[href*="/movies/"]').each((_, a) => {
      const href = $(a).attr('href');
      if (!href) return;
      const abs = new URL(href, BASE).toString();
      if (seen.has(abs)) return;
      seen.add(abs);
      const title = $(a).text().trim() || null;
      items.push({ title, url: abs });
    });
  }
  return items;
}

// High-performance in-memory TTL list cache (3 minutes)
const listMemoryCache = new Map<string, { data: AnimeListResponse; expiresAt: number }>();
const LIST_CACHE_TTL_MS = 3 * 60 * 1000;

export async function fetchAnimeList(page: number, type: string = 'series'): Promise<AnimeListResponse> {
  const cacheKey = `list:${type}:${page}`;
  const cached = listMemoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.data.items && cached.data.items.length > 0) {
    return cached.data;
  }

  await refreshDynamicConfig();
  console.log(`fetchAnimeList called with page: ${page}, type: ${type}`);

  const payload = new URLSearchParams({ 
    action: 'torofilm_infinite_scroll', 
    page: String(page), 
    per_page: '12', 
    query_type: 'archive', 
    post_type: type 
  });
  let items: SeriesListItem[] = [];

  try {
    console.log(`Attempting AJAX call to: ${AJAX}`);
    console.log(`Payload: ${payload.toString()}`);

    const { data } = await http.post(AJAX, payload, { responseType: 'text', timeout: 3500 });
    console.log(`AJAX response received, data type: ${typeof data}, length: ${typeof data === 'string' ? data.length : 'N/A'}`);

    let html: string | undefined;
    if (typeof data === 'object' && data) {
      const anyData = data as any;
      if (typeof anyData.html === 'string') html = anyData.html;
      else if (typeof anyData.data === 'string') html = anyData.data;
      else if (typeof anyData.content === 'string') html = anyData.content;
    } else if (typeof data === 'string') {
      html = data;
      try { const parsed = JSON.parse(data); if (parsed && typeof parsed === 'object') { if (typeof parsed.html === 'string') html = parsed.html; else if (typeof parsed.data === 'string') html = parsed.data; else if (typeof parsed.content === 'string') html = parsed.content; } } catch { }
    }

    if (html) {
      console.log(`HTML extracted, length: ${html.length}`);
      items = parseAnimeListFromHtml(html);
      console.log(`Parsed ${items.length} items from AJAX response`);
    } else {
      console.log('No HTML found in AJAX response');
    }
  } catch (error) {
    console.error('AJAX call failed:', error);
  }

  if (items.length === 0) {
    const candidates: string[] = [];
    if (type === 'movies') {
      if (page <= 1) candidates.push(`${BASE}/movies/`);
      candidates.push(`${BASE}/movies/page/${page}/`);
      candidates.push(`${BASE}/?post_type=movies&_page=${page}`);
    } else {
      if (page <= 1) candidates.push(`${BASE}/series/`);
      candidates.push(`${BASE}/series/page/${page}/`);
      candidates.push(`${BASE}/?post_type=series&_page=${page}`);
    }
    candidates.push(`${BASE}/`);

    console.log(`AJAX failed, trying fallback URLs: ${candidates.join(', ')}`);

    for (const url of candidates) {
      try {
        console.log(`Trying fallback URL: ${url}`);
        const resp = await http.get(url, { responseType: 'text' });
        const html = String(resp.data || '');
        const parsed = parseAnimeListFromHtml(html);
        console.log(`Fallback ${url} returned ${parsed.length} items`);
        if (parsed.length > 0) {
          items = parsed;
          console.log(`Using fallback data from: ${url}`);
          break;
        }
      } catch (err) {
        console.log(`Fallback ${url} failed:`, err);
      }
    }
  }

  // Enrich missing/placeholder images by scraping poster from the series page
  console.log(`Enriching ${items.length} items with posters`);
  items = await enrichSeriesPosters(items);
  console.log(`Final result: ${items.length} items`);

  const result: AnimeListResponse = { page, items };
  if (items.length > 0) {
    listMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
  }
  return result;
}

export async function searchAnime(query: string, page: number = 1): Promise<SeriesListItem[]> {
  console.log(`searchAnime called with query: ${query}`);
  try {
    const { data } = await http.get(`${BASE}/`, { 
      params: { s: query, paged: page },
      responseType: 'text' 
    });
    const html = String(data || '');
    const items = parseAnimeListFromHtml(html);
    console.log(`searchAnime found ${items.length} items for query: ${query}`);
    return items;
  } catch (error) {
    console.error('searchAnime failed:', error);
    return [];
  }
}

export function parsePosterFromHtml(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html);
  let img: string | null = null;
  const og = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
  if (og) img = og;
  if (!img) {
    const cover = $('.cover img, .poster img, .entry-thumb img').first();
    const src = cover.attr('src') || cover.attr('data-src') || cover.attr('data-original');
    if (src) img = src;
  }
  // Fallback: scan any <img> tags, prefer image.tmdb.org or larger sizes
  if (!img) {
    const candidates: string[] = [];
    $('img').each((_, el) => {
      const s = $(el).attr('data-src') || $(el).attr('src');
      if (!s) return;
      candidates.push(s);
    });
    // Rank by host preference and size token
    const scored = candidates.map((u) => {
      const urlStr = (() => { try { return new URL(u, baseUrl).toString(); } catch { return u; } })();
      const hostScore = /image\.tmdb\.org/i.test(urlStr) ? 2 : 0;
      const sizeScore = /(original|w780|w500|w342|w300|w185)/i.test(urlStr) ? 1 : 0;
      return { urlStr, score: hostScore + sizeScore };
    }).sort((a, b) => b.score - a.score);
    if (scored.length) img = scored[0].urlStr;
  }
  if (img) { try { img = new URL(img, baseUrl).toString(); } catch { } }
  return img;
}

function parseMetaFromHtml(html: string): { 
  genres?: string[]; 
  year?: number | null; 
  totalEpisodes?: number | null; 
  duration?: string | null; 
  languages?: string[]; 
  synopsis?: string | null; 
  status?: string | null;
  totalSeasons?: number | null;
} {
  const $ = cheerio.load(html);
  const out: any = {};
  
  // 1. Synopsis: Prioritize #overview-text
  const synopsis = $('#overview-text').text().trim() || $('.entry-content p, .synopsis, .description').first().text().trim();
  if (synopsis) out.synopsis = synopsis;

  // 2. Info Badges (Seasons, Episodes, Duration, Year)
  const allText = $('body').text();
  
  // Look for text patterns in div badges specifically
  // These often have SVGs next to them
  const infoBadges = $('div').filter((_, el) => {
    const text = $(el).text().trim();
    return /\d+\s*(Seasons|Episodes|min)|^\d{4}$/.test(text) && text.length < 20;
  });

  infoBadges.each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes('Seasons')) {
      const m = text.match(/(\d+)/);
      if (m) out.totalSeasons = Number(m[1]);
    } else if (text.includes('Episodes')) {
      const m = text.match(/(\d+)/);
      if (m) out.totalEpisodes = Number(m[1]);
    } else if (text.includes('min')) {
      out.duration = text;
    } else if (/^\d{4}$/.test(text)) {
      out.year = Number(text);
    }
  });

  // Fallbacks for metadata if not found in badges
  if (!out.year) {
    const ym = allText.match(/\b(19|20)\d{2}\b/);
    if (ym) out.year = Number(ym[0]);
  }
  if (!out.totalEpisodes) {
    const epm = allText.match(/Episodes?\s*[:|-]?\s*(\d+)/i);
    if (epm) out.totalEpisodes = Number(epm[1]);
  }
  if (!out.duration) {
    const durm = allText.match(/(\d+\s*(min|minutes|mins))/i);
    if (durm) out.duration = durm[0];
  }

  // 3. Genres
  // Try to find the h4 Genres header first
  const genreHeader = $('h4').filter((_, el) => $(el).text().trim().toLowerCase().includes('genre'));
  let genreTexts: string[] = [];
  if (genreHeader.length) {
    genreTexts = genreHeader.siblings('div').find('a').map((_, el) => $(el).text().trim()).get();
  }
  if (genreTexts.length === 0) {
    genreTexts = $("a[rel='tag'], .genres a, .genre a").map((_, el) => $(el).text().trim()).get();
  }
  if (genreTexts.length) out.genres = Array.from(new Set(genreTexts.filter(Boolean)));

  // 4. Languages
  const langHeader = $('h4').filter((_, el) => $(el).text().trim().toLowerCase().includes('language'));
  if (langHeader.length) {
    const langs = langHeader.siblings('div').find('a').map((_, el) => $(el).text().trim()).get();
    if (langs.length) out.languages = Array.from(new Set(langs.filter(Boolean)));
  } else {
    // Fallback language detections
    const langs: string[] = [];
    if (/subbed|\[Sub\]/i.test(allText)) langs.push('Sub');
    if (/dubbed|dub|\[Dub\]/i.test(allText)) langs.push('Dub');
    if (langs.length) out.languages = Array.from(new Set(langs));
  }

  // 5. Status
  const statusMatch = allText.match(/Status\s*[:|-]?\s*(Ongoing|Completed|Finished|Airing)/i);
  if (statusMatch) out.status = statusMatch[1];

  return out;
}

export async function fetchAnimeDetails(params: { url: string; postId: number; season?: number | null; includePlayers?: boolean }): Promise<AnimeDetailsResponse> {
  await refreshDynamicConfig();
  const { url, postId, season, includePlayers = false } = params;

  // 1. Check Cache First
  const slug = url.split('/').filter(Boolean).pop() || '';
  const cacheKey = (season && season > 1) ? `${slug}-s${season}` : slug;

  if (slug) {
    try {
      const cached = await animeCacheService.getCachedAnime(cacheKey);
      // Only return cache if it's not stale AND it has players (if requested)
      if (cached && !animeCacheService.isStale(cached)) {
        const hasPlayers = cached.episodes?.every(ep => Array.isArray(ep.players) && ep.players.length > 0);
        if (!includePlayers || hasPlayers) {
          console.log(`AnimeCacheService: Cache hit for ${cacheKey}`);
          return {
            title: cached.title,
            image: cached.image,
            synopsis: cached.synopsis || "",
            status: cached.status || "",
            episodes: cached.episodes || [],
            seasons: cached.seasons || [],
            url: cached.url || url,
            postId: cached.postId || postId,
            poster: cached.poster || cached.image,
            rating: cached.rating,
            year: cached.year,
            genres: cached.genres as string[] || [],
            totalSeasons: cached.seasons?.length || null
          } as AnimeDetailsResponse;
        }
      }
    } catch (err) {
      console.error(`AnimeCacheService: Cache error for ${cacheKey}`, err);
    }
  }

  // Movies use a different structure; delegate to movie details
  if (/\/movies\//i.test(url)) {
    const movieDetails = await fetchMovieDetails(url);
    if (slug && movieDetails) {
       animeCacheService.saveAnime(slug, {
         ...movieDetails,
         type: 'movie'
       });
    }
    return movieDetails;
  }
  const pageResp = await http.get(url);
  const html = pageResp.data as string;
  const nonce = extractNonceFromHtml(html);
  const seasons = parseSeasonsFromHtml(html);
  const poster = parsePosterFromHtml(html, url);
  const meta = parseMetaFromHtml(html);
  const resolvedPostId = Number.isFinite(postId) && postId > 0 ? postId : (extractPostIdFromHtml(html) ?? 0);
  let episodes: EpisodeItem[] = [];
  if (typeof season === 'number' && Number.isFinite(season)) {
    console.log(`fetchAnimeDetails: Fetching episodes for season ${season}, postId: ${resolvedPostId}`);
    try {
      const payload = new URLSearchParams({ action: 'action_select_season', season: String(season), post: String(resolvedPostId) });
      const resp = await http.post(AJAX, payload, { headers: { Referer: url } });
      const text = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
      console.log(`fetchAnimeDetails: Season ${season} response length: ${text.length}`);
      episodes = parseEpisodesFromHtml(text);
      console.log(`fetchAnimeDetails: Parsed ${episodes.length} episodes for season ${season}`);
    } catch (error) {
      console.error(`fetchAnimeDetails: Error fetching season ${season}:`, error);
      // Fall back to parsing from main HTML
      episodes = parseEpisodesFromHtml(html);
    }
  } else {
    if (Number.isFinite(resolvedPostId) && resolvedPostId > 0) {
      try {
        const payload = new URLSearchParams({ action: 'torofilm_get_episodes', id: String(resolvedPostId), nonce: nonce || '' });
        const resp = await http.post(AJAX, payload, { headers: { Referer: url } });
        const body = resp.data;
        if (typeof body === 'string') {
          const trimmed = body.trim();
          if (trimmed !== '' && trimmed !== '0') {
            try { const parsed = JSON.parse(body); if (parsed && typeof parsed === 'object' && 'html' in parsed) { episodes = parseEpisodesFromHtml(parsed.html); } }
            catch { episodes = parseEpisodesFromHtml(body); }
          }
        } else if (typeof body === 'object' && body && 'html' in body) {
          episodes = parseEpisodesFromHtml((body as any).html as string);
        }
      } catch {
        // Ignore AJAX failures, we'll fall back to HTML parse below
      }
    }
  }
  if (episodes.length === 0) episodes = parseEpisodesFromHtml(html);

  // Parse related/recommended series
  const $ = cheerio.load(html);
  const related: { url: string; title?: string | null; poster?: string | null; genres?: string[]; postId?: number }[] = [];
  const seenRelated = new Set<string>();

  const normalizeSrc = (src?: string | null): string | null => {
    if (!src || src.startsWith('data:image/svg+xml')) return null;
    let out = src.trim();
    if (out.startsWith('//')) return `https:${out}`;
    if (out.startsWith('/')) return new URL(out, url).toString();
    return out;
  };

  // Try multiple selectors to find recommended series
  const selectors = [
    'section.section.episodes .owl-item article.post',
    'section.section.episodes article.post',
    '.section.episodes .owl-carousel .owl-item article.post',
    '.owl-carousel .owl-item article.post',
    '.recommended .post',
    '.related .post',
    'article.post'
  ];

  for (const selector of selectors) {
    const candidates = $(selector);
    if (candidates.length === 0) continue;

    candidates.each((_, el) => {
      try {
        const art = $(el);
        const a = art.find('a[href*="/series/"], a[href*="/movies/"]').first();
        const href = a.attr('href');
        if (!href) return;
        const abs = new URL(href, url).toString();
        if (seenRelated.has(abs)) return;

        const imgEl = art.find('img').first();
        // Prioritize data-src/data-lazy for lazy-loaded images, skip base64 placeholders
        const getBestSrc = (el: any) => {
          const attrs = ['data-src', 'data-lazy-src', 'data-lazy', 'data-original', 'src'];
          for (const attr of attrs) {
            const val = el.attr(attr);
            if (val && !val.startsWith('data:image/svg+xml')) return val;
          }
          return null;
        };
        
        let img = normalizeSrc(getBestSrc(imgEl));
        const titleRaw = imgEl.attr('alt') || art.find('h3,h2,.entry-title').first().text() || null;
        const title = titleRaw ? titleRaw.replace(/^Image\s+/i, '').trim() : null;

        related.push({ url: abs, title, poster: img });
        seenRelated.add(abs);
      } catch { }
    });

    // If we found items with this selector, break
    if (related.length > 0) break;
  }

  // Cap to a reasonable number to avoid overloading UI
  if (related.length > 20) related.length = 20;

  // Extract smart buttons
  const smartButtons: { url: string; actionText: string; episodeText: string; buttonClass: string }[] = [];
  $('.smart-buttons-container .smart-play-btn').each((_, el) => {
    const $btn = $(el);
    let href = $btn.attr('href');
    const actionText = $btn.find('.action-text').text().trim();
    const episodeText = $btn.find('.episode-text').text().trim();
    const btnClass = $btn.attr('class') || '';

    if (href && actionText) {
      // Transform external URL to internal /watch route
      try {
        const decoded = decodeURIComponent(href);
        if (decoded.includes('/episode/')) {
          const epSlug = decoded.split('/episode/')[1]?.split('/')[0] || decoded;
          href = `/watch/${encodeURIComponent(epSlug)}`;
        }
      } catch (e) {
        console.error('Error transforming smart button URL:', e);
      }

      smartButtons.push({
        url: href,
        actionText: actionText,
        episodeText: episodeText,
        buttonClass: btnClass
      });
    }
  });

  const title = $('h1').text().trim();
  
  // 3. Deep Sync Player Sources if requested
  if (includePlayers && episodes.length > 0) {
    console.log(`Bulk Importer: Deep Syncing ${episodes.length} episodes for ${title}`);
    for (let i = 0; i < episodes.length; i++) {
       try {
         const players = await fetchEpisodePlayers(episodes[i].url);
         episodes[i].players = players;
         // Delay to be safe
         if (i < episodes.length - 1) await new Promise(r => setTimeout(r, 300));
       } catch (e) {
         console.warn(`Bulk Importer: Failed to fetch players for episode ${episodes[i].number} of ${title}`);
       }
    }
  }

  const details = { 
    title,
    image: poster || "",
    url, 
    postId: resolvedPostId, 
    season: season ?? null, 
    seasons, 
    episodes, 
    poster, 
    related, 
    smartButtons, 
    totalSeasons: meta.totalSeasons || (seasons.length > 0 ? seasons.length : null),
    ...meta 
  } as AnimeDetailsResponse;

  // 4. Save to Cache
  if (slug && details.title) {
    animeCacheService.saveAnime(cacheKey, {
      title: details.title,
      image: details.poster || details.image || "",
      synopsis: details.synopsis || "",
      status: details.status || "",
      type: 'series',
      episodes: details.episodes,
      seasons: details.seasons,
      url: details.url,
      postId: details.postId,
      poster: details.poster,
      rating: details.rating ?? null,
      year: details.year ?? null,
      genres: details.genres || []
    });
  }

  return details;
}

export async function fetchEpisodePlayers(episodeUrl: string) {
  console.log(`fetchEpisodePlayers: Processing URL: ${episodeUrl}`);

  // Normalize and validate the URL
  let normalizedUrl: string;
  try {
    // If it's already a full URL, use it as is
    if (episodeUrl.startsWith('http://') || episodeUrl.startsWith('https://')) {
      normalizedUrl = episodeUrl;
    } else {
      // If it's a relative URL, make it absolute
      normalizedUrl = new URL(episodeUrl, BASE).toString();
    }

    // Validate the URL
    new URL(normalizedUrl);
    console.log(`fetchEpisodePlayers: Normalized URL: ${normalizedUrl}`);
  } catch (error) {
    console.error(`fetchEpisodePlayers: Invalid URL - ${episodeUrl}:`, error);
    throw new Error(`Invalid episode URL: ${episodeUrl}`);
  }

  const resp = await http.get(normalizedUrl, { responseType: 'text' });
  const html = String(resp.data || '');
  const $ = cheerio.load(html);
  const sources: { src: string; label?: string | null; quality?: string | null; kind: 'iframe' | 'video' }[] = [];
  $('iframe').each((_, el) => { const src = $(el).attr('data-src') || $(el).attr('src'); if (!src) return; sources.push({ src: new URL(src, normalizedUrl).toString(), kind: 'iframe' }); });
  $('video source').each((_, el) => { const src = $(el).attr('src'); if (!src) return; sources.push({ src: new URL(src, normalizedUrl).toString(), label: $(el).attr('label') || $(el).attr('data-label') || null, quality: $(el).attr('res') || $(el).attr('data-res') || null, kind: 'video' }); });
  const m3u8Match = html.match(/https?:[^"'\s]+\.m3u8/); if (m3u8Match) { try { sources.push({ src: new URL(m3u8Match[0], normalizedUrl).toString(), kind: 'video', label: 'HLS' }); } catch { } }
  const seen = new Set<string>();
  return sources.filter(s => (seen.has(s.src) ? false : (seen.add(s.src), true)));
}

export async function enrichSeriesPosters(items: SeriesListItem[]): Promise<SeriesListItem[]> {
  // Only fetch when image is missing or a data URI
  const targets = items.map((it, idx) => ({ it, idx })).filter(({ it }) => !it.image || it.image.startsWith('data:'));
  if (targets.length === 0) return items;

  await Promise.allSettled(
    targets.map(async ({ it, idx }) => {
      try {
        const resp = await http.get(it.url, { responseType: 'text' });
        const html = String(resp.data || '');
        const poster = parsePosterFromHtml(html, it.url);
        if (poster) items[idx] = { ...it, image: poster };
      } catch { }
    })
  );
  return items;
}

export async function fetchMoviesList(page: number, query?: string): Promise<AnimeListResponse> {
  const cacheKey = `movies:${page}:${query || ''}`;
  const cached = listMemoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.data.items && cached.data.items.length > 0) {
    return cached.data;
  }

  await refreshDynamicConfig();
  let items: SeriesListItem[] = [];

  try {
    if (query && query.trim().length > 0) {
      console.log(`Fetching movies with query: ${query}`);
      const axios = (await import('axios')).default;
      const { data: html } = await axios.get(`${BASE}/?s=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 20000,
      });
      const all = parseAnimeListFromHtml(String(html));
      items = all.filter((i) => /\/movies\//i.test(i.url));
      console.log(`Query search found ${all.length} total items, ${items.length} movies`);
    } else {
      console.log(`Fetching movies page ${page}`);
      const candidates: string[] = [];
      if (page <= 1) candidates.push(`${BASE}/movies/`);
      candidates.push(`${BASE}/movies/page/${page}/`);

      console.log(`Trying URLs: ${candidates.join(', ')}`);

      for (const url of candidates) {
        try {
          console.log(`Attempting to fetch: ${url}`);
          const resp = await http.get(url, { responseType: 'text' });
          const html = String(resp.data || '');
          console.log(`Got response from ${url}, HTML length: ${html.length}`);

          const parsed = parseAnimeListFromHtml(html).filter((i) => /\/movies\//i.test(i.url));
          console.log(`Parsed ${parsed.length} movies from ${url}`);

          if (parsed.length) {
            items = parsed;
            console.log(`Successfully loaded ${items.length} movies from ${url}`);
            break;
          }
        } catch (err) {
          console.error(`Failed to fetch ${url}:`, err);
        }
      }

      // Fallback: if no movies found from dedicated pages, try main page
      if (items.length === 0) {
        console.log('No movies found from dedicated pages, trying main page as fallback');
        try {
          const mainResp = await http.get(`${BASE}/`, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          const mainParsed = parseAnimeListFromHtml(mainHtml).filter((i) => /\/movies\//i.test(i.url));
          console.log(`Fallback: Found ${mainParsed.length} movies from main page`);

          if (mainParsed.length > 0) {
            items = mainParsed;
          }
        } catch (err) {
          console.error('Fallback main page fetch failed:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error in fetchMoviesList:', err);
    return { page, items: [] };
  }

  console.log(`Final items count: ${items.length}`);

  if (items.length === 0) {
    console.warn('No movies found, this might indicate an issue with the scraper or the source website');
  }

  items = await enrichSeriesPosters(items);
  const result: AnimeListResponse = { page, items };
  if (items.length > 0) {
    listMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
  }
  return result;
}

export async function fetchMovieDetails(url: string): Promise<AnimeDetailsResponse> {
  const pageResp = await http.get(url);
  const html = pageResp.data as string;
  const $ = cheerio.load(html);
  const poster = parsePosterFromHtml(html, url);
  const meta = parseMetaFromHtml(html);
  // Try to extract players directly from movie page
  const players = extractPlayersFromHtml(html, url);
  const episodes: EpisodeItem[] = [{ title: 'Full Movie', url, number: null, poster }];
  return {
    url,
    title: $('h1').text().trim(),
    image: poster || "",
    postId: 0,
    season: null,
    seasons: [],
    episodes,
    poster,
    ...meta,
    players,
  } as AnimeDetailsResponse;
}

function extractPlayersFromHtml(html: string, baseUrl: string): PlayerSourceItem[] {
  const $ = cheerio.load(html);
  const sources: PlayerSourceItem[] = [];

  // Extract iframe sources
  $('iframe').each((_, el) => {
    const src = $(el).attr('data-src') || $(el).attr('src');
    if (!src) return;
    try {
      const fullUrl = new URL(src, baseUrl).toString();
      // Default label for generic iframes
      sources.push({ src: fullUrl, kind: 'iframe', label: 'Server 1' });
    } catch { }
  });

  // Extract video sources
  $('video source').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    try {
      const fullUrl = new URL(src, baseUrl).toString();
      sources.push({
        src: fullUrl,
        kind: 'video',
        label: $(el).attr('label') || 'Video',
        quality: $(el).attr('res') || null
      });
    } catch { }
  });

  // Extract HLS streams
  const m3u8 = html.match(/https?:[^"'\s]+\.m3u8/);
  if (m3u8) {
    try {
      const fullUrl = new URL(m3u8[0], baseUrl).toString();
      sources.push({ src: fullUrl, kind: 'video', label: 'HLS Stream' });
    } catch { }
  }

  // Extract alternative "Server 2" container (custom markup)
  try {
    const server2 = $('.video-container iframe#videoFrame').first();
    if (server2 && server2.length) {
      const s2src = server2.attr('data-src') || server2.attr('src');
      if (s2src) {
        const fullUrl = new URL(s2src, baseUrl).toString();
        // Try to detect language text if available in nearby nodes
        let lang: string | null = null;
        const langSpan = server2.parent().find('#switchingLanguage').first();
        if (langSpan && langSpan.length) {
          const t = (langSpan.text() || '').trim();
          if (t) lang = t;
        }
        sources.push({ src: fullUrl, kind: 'iframe', label: lang ? `Server 2 (${lang})` : 'Server 2' });
      }
    }
  } catch { }

  // Extract server options (common in movie pages)
  $('a[href*="play"], a[href*="watch"], a[href*="stream"]').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (!href) return;

    try {
      const fullUrl = new URL(href, baseUrl).toString();
      // Only add if it looks like a streaming URL
      if (fullUrl.includes('play') || fullUrl.includes('watch') || fullUrl.includes('stream')) {
        sources.push({
          src: fullUrl,
          kind: 'iframe',
          label: text || 'Server'
        });
      }
    } catch { }
  });

  // Remove duplicates
  const seen = new Set<string>();
  return sources.filter((s) => (seen.has(s.src) ? false : (seen.add(s.src), true)));
}

export async function fetchLetterList(letter: string, page: number = 1): Promise<AnimeListResponse> {
  const cacheKey = `letter:${letter}:${page}`;
  const cached = listMemoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.data.items && cached.data.items.length > 0) {
    return cached.data;
  }

  await refreshDynamicConfig();
  console.log(`Fetching letter list - Letter: ${letter}, Page: ${page}`);

  let items: SeriesListItem[] = [];

  try {
    const safeLetter = encodeURIComponent(letter);
    const letterUrl = `${BASE}/letter/${safeLetter}/`;
    const pageUrl = page > 1 ? `${letterUrl}page/${page}/` : letterUrl;

    console.log(`Fetching letter page: ${pageUrl}`);

    const pageResp = await http.get(pageUrl, { responseType: 'text' });
    const pageHtml = String(pageResp.data || '');
    items = parseAnimeListFromHtml(pageHtml);
    console.log(`Page ${page} found ${items.length} items for letter ${letter}`);

  } catch (err) {
    console.error(`Failed to fetch letter page ${page}:`, err);
  }

  console.log(`Final letter items count: ${items.length}`);

  if (items.length === 0) {
    console.warn(`No content found for letter ${letter}`);
  }

  items = await enrichSeriesPosters(items);
  const result: AnimeListResponse = { page, items };
  if (items.length > 0) {
    listMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
  }
  return result;
}

export async function fetchCartoonList(page: number = 1, query: string = ''): Promise<AnimeListResponse> {
  const cacheKey = `cartoon:${page}:${query || ''}`;
  const cached = listMemoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.data.items && cached.data.items.length > 0) {
    return cached.data;
  }

  await refreshDynamicConfig();
  console.log(`Fetching cartoon list - Page: ${page}, Query: ${query}`);

  let items: SeriesListItem[] = [];

  try {
    if (query) {
      // Search for cartoons with query
      const searchUrl = `${BASE}/?s=${encodeURIComponent(query)}&post_type=post`;
      console.log(`Searching cartoons with query: ${searchUrl}`);

      const searchResp = await http.get(searchUrl, { responseType: 'text' });
      const searchHtml = String(searchResp.data || '');

      // Filter search results to only include cartoon content
      const allResults = parseAnimeListFromHtml(searchHtml);
      items = allResults.filter((item) =>
        item.url.includes('/cartoon/') ||
        (item.title && item.title.toLowerCase().includes('cartoon')) ||
        (item.title && item.title.toLowerCase().includes('animation'))
      );

      console.log(`Search found ${items.length} cartoon results for query: "${query}"`);
    } else {
      // Fetch cartoon category page
      const cartoonUrl = `${BASE}/category/cartoon/`;
      if (page > 1) {
        const pageUrl = `${cartoonUrl}page/${page}/`;
        console.log(`Fetching cartoon page: ${pageUrl}`);

        try {
          const pageResp = await http.get(pageUrl, { responseType: 'text' });
          const pageHtml = String(pageResp.data || '');
          items = parseAnimeListFromHtml(pageHtml);
          console.log(`Page ${page} found ${items.length} cartoons`);
        } catch (err) {
          console.error(`Failed to fetch cartoon page ${page}:`, err);
          // Fallback to main cartoon page
          const mainResp = await http.get(cartoonUrl, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          items = parseAnimeListFromHtml(mainHtml);
          console.log(`Fallback: Found ${items.length} cartoons from main cartoon page`);
        }
      } else {
        // First page
        console.log(`Fetching main cartoon page: ${cartoonUrl}`);
        const mainResp = await http.get(cartoonUrl, { responseType: 'text' });
        const mainHtml = String(mainResp.data || '');
        items = parseAnimeListFromHtml(mainHtml);
        console.log(`Main cartoon page found ${items.length} cartoons`);
      }

      // If no cartoons found from dedicated pages, try main page as fallback
      if (items.length === 0) {
        console.log('No cartoons found from dedicated pages, trying main page as fallback');
        try {
          const mainResp = await http.get(`${BASE}/`, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          const mainParsed = parseAnimeListFromHtml(mainHtml).filter((i) =>
            i.url.includes('/cartoon/') ||
            (i.title && i.title.toLowerCase().includes('cartoon')) ||
            (i.title && i.title.toLowerCase().includes('animation'))
          );
          console.log(`Fallback: Found ${mainParsed.length} cartoons from main page`);

          if (mainParsed.length > 0) {
            items = mainParsed;
          }
        } catch (err) {
          console.error('Fallback main page fetch failed:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error in fetchCartoonList:', err);
    return { page, items: [] };
  }

  console.log(`Final cartoon items count: ${items.length}`);

  if (items.length === 0) {
    console.warn('No cartoons found, this might indicate an issue with the scraper or the source website');
  }

  items = await enrichSeriesPosters(items);
  const result: AnimeListResponse = { page, items };
  if (items.length > 0) {
    listMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
  }
  return result;
}

export async function fetchNetworkContent(networkSlug: string, page: number = 1, query: string = ''): Promise<AnimeListResponse> {
  const cacheKey = `network:${networkSlug}:${page}:${query || ''}`;
  const cached = listMemoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.data.items && cached.data.items.length > 0) {
    return cached.data;
  }

  console.log(`Fetching ${networkSlug} network content - Page: ${page}, Query: ${query}`);

  let items: SeriesListItem[] = [];

  try {
    if (query) {
      // Search for network content with query
      const searchUrl = `${BASE}/?s=${encodeURIComponent(query)}&post_type=post`;
      console.log(`Searching ${networkSlug} content with query: ${searchUrl}`);

      const searchResp = await http.get(searchUrl, { responseType: 'text' });
      const searchHtml = String(searchResp.data || '');

      // Filter search results to only include network content
      const allResults = parseAnimeListFromHtml(searchHtml);
      items = allResults.filter((item) =>
        item.url.includes(`/network/${networkSlug}/`) ||
        (item.title && item.title.toLowerCase().includes(networkSlug.replace('-', ' ')))
      );

      console.log(`Search found ${items.length} ${networkSlug} results for query: "${query}"`);
    } else {
      // Fetch network category page
      const networkUrl = `${BASE}/category/network/${networkSlug}/`;
      if (page > 1) {
        const pageUrl = `${networkUrl}page/${page}/`;
        console.log(`Fetching ${networkSlug} page: ${pageUrl}`);

        try {
          const pageResp = await http.get(pageUrl, { responseType: 'text' });
          const pageHtml = String(pageResp.data || '');
          items = parseAnimeListFromHtml(pageHtml);
          console.log(`Page ${page} found ${items.length} ${networkSlug} items`);
        } catch (err) {
          console.error(`Failed to fetch ${networkSlug} page ${page}:`, err);
          // Fallback to main network page
          const mainResp = await http.get(networkUrl, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          items = parseAnimeListFromHtml(mainHtml);
          console.log(`Fallback: Found ${items.length} ${networkSlug} items from main network page`);
        }
      } else {
        // First page
        console.log(`Fetching main ${networkSlug} page: ${networkUrl}`);
        const mainResp = await http.get(networkUrl, { responseType: 'text' });
        const mainHtml = String(mainResp.data || '');
        items = parseAnimeListFromHtml(mainHtml);
        console.log(`Main ${networkSlug} page found ${items.length} items`);
      }

      // If no network content found from dedicated pages, try main page as fallback
      if (items.length === 0) {
        console.log(`No ${networkSlug} content found from dedicated pages, trying main page as fallback`);
        try {
          const mainResp = await http.get(`${BASE}/`, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          const mainParsed = parseAnimeListFromHtml(mainHtml).filter((i) =>
            i.url.includes(`/network/${networkSlug}/`) ||
            (i.title && i.title.toLowerCase().includes(networkSlug.replace('-', ' ')))
          );
          console.log(`Fallback: Found ${mainParsed.length} ${networkSlug} items from main page`);

          if (mainParsed.length > 0) {
            items = mainParsed;
          }
        } catch (err) {
          console.error('Fallback main page fetch failed:', err);
        }
      }
    }
  } catch (err) {
    console.error(`Error in fetchNetworkContent for ${networkSlug}:`, err);
    return { page, items: [] };
  }

  console.log(`Final ${networkSlug} items count: ${items.length}`);

  if (items.length === 0) {
    console.warn(`No ${networkSlug} content found, this might indicate an issue with the scraper or the source website`);
  }

  items = await enrichSeriesPosters(items);
  const result: AnimeListResponse = { page, items };
  if (items.length > 0) {
    listMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
  }
  return result;
}

export async function fetchOngoingSeries(page: number = 1, query: string = ''): Promise<AnimeListResponse> {
  const cacheKey = `ongoing:${page}:${query || ''}`;
  const cached = listMemoryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt && cached.data.items && cached.data.items.length > 0) {
    return cached.data;
  }

  console.log(`Fetching ongoing series - Page: ${page}, Query: ${query}`);

  let items: SeriesListItem[] = [];

  try {
    if (query) {
      // Search for ongoing series with query
      const searchUrl = `${BASE}/?s=${encodeURIComponent(query)}&post_type=post`;
      console.log(`Searching ongoing series with query: ${searchUrl}`);

      const searchResp = await http.get(searchUrl, { responseType: 'text' });
      const searchHtml = String(searchResp.data || '');

      // Filter search results to only include ongoing series content
      const allResults = parseAnimeListFromHtml(searchHtml);
      items = allResults.filter((item) =>
        item.url.includes('/status/ongoing/') ||
        (item.title && item.title.toLowerCase().includes('ongoing')) ||
        (item.title && item.title.toLowerCase().includes('airing'))
      );

      console.log(`Search found ${items.length} ongoing series results for query: "${query}"`);
    } else {
      // Fetch ongoing series category page
      const ongoingUrl = `${BASE}/category/status/ongoing/`;
      if (page > 1) {
        const pageUrl = `${ongoingUrl}page/${page}/`;
        console.log(`Fetching ongoing series page: ${pageUrl}`);

        try {
          const pageResp = await http.get(pageUrl, { responseType: 'text' });
          const pageHtml = String(pageResp.data || '');
          items = parseAnimeListFromHtml(pageHtml);
          console.log(`Page ${page} found ${items.length} ongoing series`);
        } catch (err) {
          console.error(`Failed to fetch ongoing series page ${page}:`, err);
          // Fallback to main ongoing series page
          const mainResp = await http.get(ongoingUrl, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          items = parseAnimeListFromHtml(mainHtml);
          console.log(`Fallback: Found ${items.length} ongoing series from main page`);
        }
      } else {
        // First page
        console.log(`Fetching main ongoing series page: ${ongoingUrl}`);
        const mainResp = await http.get(ongoingUrl, { responseType: 'text' });
        const mainHtml = String(mainResp.data || '');
        items = parseAnimeListFromHtml(mainHtml);
        console.log(`Main ongoing series page found ${items.length} items`);
      }

      // If no ongoing series found from dedicated pages, try main page as fallback
      if (items.length === 0) {
        console.log('No ongoing series found from dedicated pages, trying main page as fallback');
        try {
          const mainResp = await http.get(`${BASE}/`, { responseType: 'text' });
          const mainHtml = String(mainResp.data || '');
          const mainParsed = parseAnimeListFromHtml(mainHtml).filter((i) =>
            i.url.includes('/status/ongoing/') ||
            (i.title && i.title.toLowerCase().includes('ongoing')) ||
            (i.title && i.title.toLowerCase().includes('airing'))
          );
          console.log(`Fallback: Found ${mainParsed.length} ongoing series from main page`);

          if (mainParsed.length > 0) {
            items = mainParsed;
          }
        } catch (err) {
          console.error('Fallback main page fetch failed:', err);
        }
      }
    }
  } catch (err) {
    console.error('Error in fetchOngoingSeries:', err);
    return { page, items: [] };
  }

  console.log(`Final ongoing series items count: ${items.length}`);

  if (items.length === 0) {
    console.warn('No ongoing series found, this might indicate an issue with the scraper or the source website');
  }

  items = await enrichSeriesPosters(items);
  const result: AnimeListResponse = { page, items };
  if (items.length > 0) {
    listMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
  }
  return result;
}

// Helper to get all anime slugs currently available on the site
async function fetchAvailableSlugs(): Promise<Set<string>> {
  console.log('Building site availability cache...');
  const slugs = new Set<string>();
  
  try {
    // Check Series (First 5 pages)
    for (let p = 1; p <= 5; p++) {
      const res = await fetchAnimeList(p);
      if (!res.items || res.items.length === 0) break;
      res.items.forEach(item => {
        if (item.title) {
          const s = item.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
          if (s) slugs.add(s);
        }
      });
      if (res.items.length < 5) break; 
    }

    // Check Movies (First 3 pages)
    for (let p = 1; p <= 3; p++) {
      const res = await fetchMoviesList(p);
      if (!res.items || res.items.length === 0) break;
      res.items.forEach(item => {
        if (item.title) {
          const s = item.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
          if (s) slugs.add(s);
        }
      });
      if (res.items.length < 5) break;
    }
  } catch (err) {
    console.error('Error building availability cache:', err);
  }
  
  console.log(`Availability cache built with ${slugs.size} slugs`);
  return slugs;
}

export async function fetchUpcomingEpisodes(): Promise<{
  episodes: Array<{
    id: string;
    title: string;
    image: string;
    episode: string;
    countdown: string | number;
    url: string;
  }>;
}> {
  await refreshDynamicConfig();
  console.log('Fetching upcoming episodes data from Jikan API');
  const targetUrl = 'https://api.jikan.moe/v4/seasons/upcoming?limit=20';

  try {
    const [availableSlugs, { data }] = await Promise.all([
      fetchAvailableSlugs(),
      http.get(targetUrl)
    ]);
    
    const episodes = (data.data || []).map((item: any) => {
      const airedDate = item.aired?.from ? new Date(item.aired.from) : null;
      const countdown = airedDate ? Math.floor(airedDate.getTime() / 1000) : 0;
      
      const slug = (item.title || 'Unknown Anime')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Only include if available on site
      if (!availableSlugs.has(slug)) return null;

      return {
        id: item.mal_id.toString(),
        title: item.title,
        image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || '',
        episode: item.type || 'Upcoming',
        countdown: countdown,
        url: `/watch?slug=${slug}`
      };
    }).filter((ep: any) => ep !== null);

    console.log(`Filtered: Showing ${episodes.length} of ${data.data?.length || 0} upcoming episodes`);
    return { episodes };
  } catch (error) {
    console.error('Error fetching upcoming episodes from Jikan:', error);
    return { episodes: [] };
  }
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || '3e95dc9b1d4baa2f4dd99d97c99fb225'; // Fallback for local dev if needed
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function fetchTMDBDetails(type: 'tv' | 'movie', id: number | string): Promise<TMDBDetails | null> {
  try {
    const response = await http.get(`${TMDB_BASE}/${type}/${id}`, {
      params: { api_key: TMDB_API_KEY, append_to_response: 'images' }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching TMDB details:', error);
    return null;
  }
}

export async function fetchRegionalSchedule(): Promise<ScheduleDay[]> {
  await refreshDynamicConfig();
  console.log('Fetching regional schedule from AniSchedule (RockinChaos)');
  const dubUrl = 'https://raw.githubusercontent.com/RockinChaos/AniSchedule/master/raw/dub-schedule.json';
  const subUrl = 'https://raw.githubusercontent.com/RockinChaos/AniSchedule/master/raw/sub-schedule.json';
  
  try {
    const [availableSlugs, dubResp, subResp] = await Promise.all([
      fetchAvailableSlugs(),
      http.get(dubUrl),
      http.get(subUrl)
    ]);

    const dubItems = (dubResp.data || []).map((item: any) => ({ ...item, language: 'Dub' }));
    const subItems = (subResp.data || []).map((item: any) => ({ ...item, language: 'Sub' }));
    
    const allItems = [...dubItems, ...subItems];
    const dayMap: { [key: string]: ScheduleItem[] } = {
      'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': []
    };

    allItems.forEach((item: any) => {
      if (!item.episodeDate) return;
      const slug = (item.media?.media?.title?.userPreferred || item.title || 'Unknown Anime')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Only include if available on site
      if (!availableSlugs.has(slug)) return;

      const date = new Date(item.episodeDate);
      const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
      
      if (dayMap[day]) {
        dayMap[day].push({
          title: item.media?.media?.title?.userPreferred || item.title || 'Unknown Anime',
          url: `/watch?slug=${slug}`,
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }),
          type: item.language || 'TV',
          poster: item.media?.media?.coverImage?.extraLarge || item.media?.media?.coverImage?.medium || '',
          description: item.media?.media?.description || '',
          isNew: true
        });
      }
    });

    // Create ScheduleDay[] array
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const today = new Date();
    const todayIdx = (today.getDay() + 6) % 7; // 0-6 (Mon-Sun)
    
    const schedule: ScheduleDay[] = days.map((dayName, i) => {
      const items = dayMap[dayName] || [];
      items.sort((a, b) => a.time.localeCompare(b.time));
      const date = new Date();
      date.setDate(today.getDate() + (i - todayIdx));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
      
      return {
        day: `${shortDays[i]} ${dateStr}`,
        count: items.length,
        items: items,
        isToday: i === todayIdx
      };
    });

    const reordered = [...schedule.slice(todayIdx), ...schedule.slice(0, todayIdx)];
    console.log(`Parsed ${allItems.length} items (after filtering) into ${reordered.length} days of schedule`);
    return reordered;
  } catch (error) {
    console.error("Error fetching schedule from AniSchedule:", error);
    return fetchJikanSchedule();
  }
}

async function fetchJikanSchedule(): Promise<ScheduleDay[]> {
  const targetUrl = 'https://api.jikan.moe/v4/schedules';
  try {
    const [availableSlugs, { data: response }] = await Promise.all([
      fetchAvailableSlugs(),
      http.get(targetUrl)
    ]);
    
    const animeItems = response.data || [];
    const dayMap: { [key: string]: ScheduleItem[] } = {
      'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': []
    };

    animeItems.forEach((item: any) => {
      const slug = (item.title || 'Unknown Anime')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      if (!availableSlugs.has(slug)) return;

      const dayRaw = item.broadcast?.day || 'Other';
      const day = dayRaw.endsWith('s') ? dayRaw.slice(0, -1) : dayRaw;
      if (dayMap[day]) {
        dayMap[day].push({
          title: item.title,
          url: `/watch?slug=${slug}`,
          time: item.broadcast?.time || '--:--',
          type: item.type || 'TV',
          poster: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || '',
          description: item.synopsis || '',
          isNew: false
        });
      }
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const todayIdx = (today.getDay() + 6) % 7;

    const schedule: ScheduleDay[] = days.map((dayName, i) => {
      const items = dayMap[dayName] || [];
      const date = new Date();
      date.setDate(today.getDate() + (i - todayIdx));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
      return {
        day: `${shortDays[i]} ${dateStr}`,
        count: items.length,
        items,
        isToday: i === todayIdx
      };
    });

    return [...schedule.slice(todayIdx), ...schedule.slice(0, todayIdx)];
  } catch (error) {
    console.error('Error in fetchJikanSchedule fallback:', error);
    return [];
  }
}


export async function searchTMDB(query: string, type: 'tv' | 'movie' = 'tv'): Promise<TMDBDetails | null> {
  try {
    const response = await http.get(`${TMDB_BASE}/search/${type}`, {
      params: { api_key: TMDB_API_KEY, query }
    });
    if (response.data.results && response.data.results.length > 0) {
      // Search doesn't return full details, fetch by ID
      return fetchTMDBDetails(type, response.data.results[0].id);
    }
    return null;
  } catch (error) {
    console.error(`TMDB Search Error:`, error);
    return null;
  }
}

export async function fetchFreshDrops(): Promise<SeriesListItem[]> {
  await refreshDynamicConfig();
  console.log('Fetching fresh drops from homepage widget');
  try {
    const { data } = await http.get(BASE, { responseType: 'text' });
    const html = String(data || '');
    return parseFreshDropsFromHtml(html);
  } catch (error) {
    console.error('fetchFreshDrops failed:', error);
    return [];
  }
}

export function parseFreshDropsFromHtml(html: string): SeriesListItem[] {
  const $ = cheerio.load(html);
  const items: SeriesListItem[] = [];
  
  // Target the specific section provided by the user
  const widget = $('#widget_list_episodes-5, .widget_list_episodes').first();
  const slides = widget.length ? widget.find('.swiper-slide') : $('.latest-ep-swiper-slide');

  slides.each((_, el) => {
    try {
      const art = $(el).find('article').first();
      const a = art.find('a.lnk-blk').first();
      const href = a.attr('href');
      if (!href) return;

      const titleRaw = art.find('h2.entry-title').text().trim();
      const season = art.find('.post-ql').text().trim();
      const episodeRange = art.find('.year').text().trim();
      
      const imgEl = art.find('img').first();
      let img = imgEl.attr('data-src') || imgEl.attr('src') || null;
      if (img && img.startsWith('//')) img = `https:${img}`;

      items.push({
        title: titleRaw,
        url: new URL(href, BASE).toString(),
        image: stripBaseUrl(img) || undefined,
        season,
        episodeRange
      });
    } catch (e) {
      console.error('Error parsing individual Fresh Drop item:', e);
    }
  });

  console.log(`parseFreshDropsFromHtml: Found ${items.length} fresh drops`);
  return items;
}

