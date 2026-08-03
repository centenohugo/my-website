const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export type YouTubeVideo = {
  /** The 11-character video id. */
  id: string;
  /** Seconds to start at, or 0 when the URL carries no timestamp. */
  start: number;
  /** Shorts are 9:16 and need a narrower frame than the 16:9 default. */
  vertical: boolean;
};

/**
 * `t` arrives either as plain seconds (`t=90`) or in YouTube's clock shorthand
 * (`t=1m30s`, `t=90s`). Anything we can't read counts as no timestamp.
 */
function parseStart(value: string | null): number {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match[0]) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

/**
 * Recognises the URL shapes YouTube's share button hands out — watch, youtu.be,
 * shorts, live and embed — and returns null for anything else, including
 * playlist-only URLs, which stay ordinary links.
 *
 * Orientation is inferred from the `/shorts/` path because a URL carries no
 * other hint of it. A Short shared as a `watch?v=` URL therefore renders 16:9
 * and pillarboxed; rewriting it to the `/shorts/` form fixes it.
 */
export function parseYouTubeUrl(href: string | undefined): YouTubeVideo | null {
  if (!href) return null;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  let vertical = false;

  if (url.hostname.toLowerCase().endsWith("youtu.be")) {
    id = segments[0] ?? null;
  } else if (segments[0] === "watch") {
    id = url.searchParams.get("v");
  } else if (segments[0] === "shorts") {
    id = segments[1] ?? null;
    vertical = true;
  } else if (segments[0] === "live" || segments[0] === "embed") {
    id = segments[1] ?? null;
  }

  if (!id || !/^[\w-]{11}$/.test(id)) return null;

  return {
    id,
    start: parseStart(url.searchParams.get("t") ?? url.searchParams.get("start")),
    vertical,
  };
}

/** Builds the player URL, on the no-cookie host so an unplayed video sets nothing. */
export function youTubeEmbedUrl({ id, start }: YouTubeVideo): string {
  const suffix = start > 0 ? `?start=${start}` : "";
  return `https://www.youtube-nocookie.com/embed/${id}${suffix}`;
}
