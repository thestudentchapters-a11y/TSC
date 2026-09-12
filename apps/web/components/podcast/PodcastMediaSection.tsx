'use client';

import { useState, useEffect } from 'react';
import { Video, ExternalLink } from 'lucide-react';
import { PodcastPlayer } from '@/components/podcast/PodcastPlayer';
import { getVideoEmbedInfo } from '@/lib/utils';

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
 * Universal podcast media section.
 * Exclusive media format display:
 * - If video link is present -> Displays exclusively the Video Player.
 * - If only audio link is present -> Displays exclusively the Audio Player.
 * - Does not show both or tab switchers.
 */
export function PodcastMediaSection({
  videoUrl,
  youtubeUrl,
  audioUrl,
  title,
  thumbnail,
  compact = false,
}: PodcastMediaSectionProps) {
  const rawVideoLink = videoUrl || youtubeUrl;
  const embedInfo = getVideoEmbedInfo(rawVideoLink);
  const hasVideo = !!embedInfo;
  const hasAudio = !!audioUrl;

  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    if (hasVideo) {
      setIsVideoLoading(true);
      const timer = setTimeout(() => setIsVideoLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [hasVideo, embedInfo?.embedUrl]);

  // 1. If Video link is present, display ONLY the video player
  if (hasVideo) {
    const isDirectVideo = embedInfo?.type === 'direct';

    return (
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
                    Loading Video Player…
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
            <Video className="h-3.5 w-3.5 text-gold shrink-0" />
            <span className="truncate">{title}</span>
          </span>
          {rawVideoLink && (
            <a
              href={rawVideoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 ml-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gold hover:text-white transition-colors"
            >
              Open in App <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // 2. If Video link is NOT present, display the Audio Player
  return (
    <PodcastPlayer
      audioUrl={hasAudio ? audioUrl! : null}
      title={title}
      compact={compact}
    />
  );
}
