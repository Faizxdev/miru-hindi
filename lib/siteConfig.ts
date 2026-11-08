const FALLBACK_SITE_URL = "https://miruhindi.vercel.app";

function normalizeSiteUrl(rawUrl?: string | null): string {
  if (!rawUrl) {
    return FALLBACK_SITE_URL;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return FALLBACK_SITE_URL;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/+$/, "");
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const SITE_NAME = "Miru Hindi";
export const SITE_TAGLINE = "Watch Anime in Hindi Dubbed & English Subbed Online Free";
export const SITE_DESCRIPTION =
  "Watch anime online free in HD on Miru Hindi. Stream Hindi dubbed, English subbed, and Japanese audio episodes daily across anime, movies, cartoons, and ongoing series.";
export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
);

export function absoluteUrl(path = "/"): string {
  const cleanPath = path === "/" ? "" : `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return `${SITE_URL}${cleanPath}`;
}
