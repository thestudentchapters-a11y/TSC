/** Small shared utilities for the TSC web app. */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "18 SEP" style badge for event cards. */
export function dateBadge(iso?: string): { day: string; month: string } {
  const d = iso ? new Date(iso) : new Date();
  const valid = !isNaN(d.getTime()) ? d : new Date();
  return {
    day: String(valid.getDate()).padStart(2, '0'),
    month: valid.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function readingTimeFromContent(paragraphs: string[]): number {
  const words = paragraphs.join(' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export interface VideoEmbedInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'iframe';
  embedUrl: string;
  directUrl: string;
  platformName: string;
  isCustomApp?: boolean;
}

/**
 * Universal video / app embed URL resolver.
 * Handles:
 * 1. YouTube (watch, shorts, youtu.be, embed, live)
 * 2. Vimeo (vimeo.com/...)
 * 3. Direct HTML5 video files (.mp4, .webm, .ogg, .mov, etc.)
 * 4. Any external web app, iframe link or video platform URL
 */
export function getVideoEmbedInfo(url?: string | null): VideoEmbedInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube check
  const ytId = getYoutubeVideoId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&enablejsapi=1`,
      directUrl: trimmed,
      platformName: 'YouTube',
    };
  }

  // 2. Vimeo check
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+))/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&app_id=122963`,
      directUrl: trimmed,
      platformName: 'Vimeo',
    };
  }

  // 3. Direct video files (.mp4, .webm, .ogg, .mov, .m4v, .m3u8, etc.)
  const cleanUrl = trimmed.split('?')[0].toLowerCase();
  const directVideoExts = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.m3u8', '.mpd'];
  if (directVideoExts.some((ext) => cleanUrl.endsWith(ext))) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      directUrl: trimmed,
      platformName: 'Direct Video',
    };
  }

  // 4. Any generic URL (different app, iframe embed link, custom web player, etc.)
  if (/^(https?:\/\/|\/\/|\/)/i.test(trimmed)) {
    let hostname = 'External Video';
    try {
      if (trimmed.startsWith('http')) {
        const u = new URL(trimmed);
        hostname = u.hostname.replace(/^www\./, '');
      }
    } catch {
      // fallback
    }

    return {
      type: 'iframe',
      embedUrl: trimmed,
      directUrl: trimmed,
      platformName: hostname,
      isCustomApp: true,
    };
  }

  return null;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * (watch?v=, youtu.be/, embed/, shorts/, live/).
 */
export function getYoutubeVideoId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

/**
 * Converts a YouTube or universal URL into a privacy-enhanced, clean iframe embed URL.
 */
export function getYoutubeEmbedUrl(url?: string | null): string | null {
  const info = getVideoEmbedInfo(url);
  return info ? info.embedUrl : null;
}

/**
 * Returns the highest quality YouTube thumbnail URL for a given YouTube URL or video ID.
 * Defaults to hqdefault.jpg which is guaranteed to exist for all YouTube videos.
 */
export function getYoutubeThumbnailUrl(
  url?: string | null,
  quality: 'hq' | 'maxres' | 'mq' | 'sd' = 'hq'
): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'mq') {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  if (quality === 'sd') {
    return `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Returns the effective thumbnail for a podcast episode:
 * If a valid youtubeUrl or videoUrl is present, it returns the YouTube video thumbnail.
 * Otherwise, it falls back to the manual image URL or default placeholder.
 */
export function getPodcastThumbnail(
  episode?: { image?: string; thumbnail?: string; youtubeUrl?: string | null; videoUrl?: string | null; platforms?: { youtube?: string | null } } | null,
  fallback = '/images/podcast/podcast-1.jpg'
): string {
  if (!episode) return fallback;
  const ytUrl = episode.youtubeUrl || episode.videoUrl || episode.platforms?.youtube;
  if (ytUrl) {
    const ytThumb = getYoutubeThumbnailUrl(ytUrl, 'hq');
    if (ytThumb) return ytThumb;
  }
  return episode.image || episode.thumbnail || fallback;
}


