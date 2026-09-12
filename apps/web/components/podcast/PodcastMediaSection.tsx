'use client';

import { useState, useEffect } from 'react';
import { Headphones, Video, Youtube, ExternalLink, Globe, Play } from 'lucide-react';
import { PodcastPlayer } from '@/components/podcast/PodcastPlayer';
import { getVideoEmbedInfo, cn } from '@/lib/utils';

interface PodcastMediaSectionProps {
  videoUrl?: string | null;
  youtubeUrl?: string | null;
  audioUrl?: string | null;
  title: string;
  thumbnail?: string;
  defaultMode?: 'video' | 'audio';
  compact?: boolean;
}

/**
 * Universal responsive podcast media player supporting:
 * 1. YouTube video embed (iframe)
 * 2. Vimeo video embed (iframe)
 * 3. Direct HTML5 video file playback (.mp4, .webm, .mov)
 * 4. Universal custom app & external video link iframe embed
 * 5. Native audio player with seamless tab switching
 */
export function PodcastMediaSection({
  videoUrl,
  youtubeUrl,
  audioUrl,
  title,
  thumbnail,
  defaultMode,
  compact = false,
}: PodcastMediaSectionProps) {
  const rawVideoLink = videoUrl || youtubeUrl;
  const embedInfo = getVideoEmbedInfo(rawVideoLink);
  const hasVideo = !!embedInfo;
  const hasAudio = !!audioUrl;

  // Determine initial active mode
  const initialMode = defaultMode ?? (hasVideo ? 'video' : 'audio');
  const [activeMode, setActiveMode] = useState<'video' | 'audio'>(initialMode);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    if (hasVideo) {
      setIsVideoLoading(true);
      const timer = setTimeout(() => setIsVideoLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [hasVideo, embedInfo?.embedUrl]);

  if (!hasVideo && !hasAudio) {
    return <PodcastPlayer audioUrl={null} title={title} compact={compact} />;
  }

  const isYouTube = embedInfo?.type === 'youtube';
  const isDirectVideo = embedInfo?.type === 'direct';
  const platformName = embedInfo?.platformName || 'External Source';

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs when both video and audio are available */}
      {hasVideo && hasAudio && (
        <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-cream/70 p-1 border border-hairline/60">
            <button
              type="button"
              onClick={() => setActiveMode('video')}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all duration-200',
                activeMode === 'video'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              )}
              aria-label={`Watch video on ${platformName}`}
            >
              {isYouTube ? (
                <Youtube className="h-3.5 w-3.5 text-red-500 fill-current" />
              ) : (
                <Video className="h-3.5 w-3.5 text-brand" />
              )}
              <span>Watch Video</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('audio')}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all duration-200',
                activeMode === 'audio'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              )}
              aria-label="Listen to audio version"
            >
              <Headphones className="h-3.5 w-3.5" />
              <span>Listen Audio</span>
            </button>
          </div>

          {rawVideoLink && (
            <a
              href={rawVideoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-brand transition-colors"
            >
              <span>Open on {platformName}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Video View */}
      {hasVideo && (activeMode === 'video' || !hasAudio) && (
        <div className="relative overflow-hidden rounded-xl border border-hairline bg-ink shadow-lift">
          <div className="relative aspect-video w-full bg-black">
            {isDirectVideo ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster={thumbnail}
                className="h-full w-full object-contain"
                src={embedInfo!.embedUrl}
              >
                <source src={embedInfo!.embedUrl} />
                Your browser does not support HTML5 video playback.
              </video>
            ) : (
              <>
                {isVideoLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/90 text-white/70 z-10 pointer-events-none">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent mb-3" />
                    <p className="text-xs font-medium tracking-wide">
                      Loading {platformName} Player…
                    </p>
                  </div>
                )}
                <iframe
                  src={embedInfo!.embedUrl}
                  title={`${title} — Video Episode`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => setIsVideoLoading(false)}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between bg-brand-dark/95 px-4 py-2.5 text-xs text-white/80">
            <span className="flex items-center gap-1.5 font-medium truncate">
              {isYouTube ? (
                <Youtube className="h-3.5 w-3.5 text-red-500 shrink-0 fill-current" />
              ) : (
                <Video className="h-3.5 w-3.5 text-gold shrink-0" />
              )}
              <span className="truncate">{title}</span>
            </span>
            {rawVideoLink && (
              <a
                href={rawVideoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 ml-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gold hover:text-white transition-colors"
              >
                Watch on {platformName} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Audio View */}
      {hasAudio && (activeMode === 'audio' || !hasVideo) && (
        <PodcastPlayer audioUrl={audioUrl!} title={title} compact={compact} />
      )}
    </div>
  );
}
