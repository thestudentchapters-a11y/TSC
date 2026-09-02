'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Gauge, Headphones, Pause, Play, Volume2 } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

/**
 * Reusable animated podcast player — play/pause morph, animated waveform,
 * seekable progress, volume and speed control.
 * Renders a clean "audio unavailable" state when no audio URL is set.
 */
export function PodcastPlayer({
  audioUrl,
  title,
  compact = false,
}: {
  audioUrl: string | null;
  title: string;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [rate, setRate] = useState(1);
  const [failed, setFailed] = useState(false);

  const rates = useMemo(() => [0.75, 1, 1.25, 1.5, 2], []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.playbackRate = rate;
  }, [volume, rate]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrent(el.currentTime);
    const onMeta = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onEnd = () => setPlaying(false);
    const onErr = () => {
      setFailed(true);
      setPlaying(false);
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnd);
    el.addEventListener('error', onErr);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnd);
      el.removeEventListener('error', onErr);
    };
  }, [audioUrl]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setFailed(true);
      }
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    setCurrent(el.currentTime);
  };

  /* Unavailable state */
  if (!audioUrl || failed) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-hairline bg-cream px-5 py-5">
        <p className="flex items-center gap-2 font-display text-sm font-bold text-ink">
          <Headphones aria-hidden className="h-4 w-4 text-brand" />
          Audio coming soon
        </p>
        <p className="text-[13px] leading-6 text-muted">
          The audio player will appear here as soon as this episode&apos;s audio is published. Meanwhile,
          find TSC Podcast on YouTube, Spotify and Apple Podcasts — platform links are configurable by the
          admin team.
        </p>
        <div className="flex gap-2 pt-1">
          {['YouTube', 'Spotify', 'Apple Podcasts'].map((p) => (
            <span
              key={p}
              className="cursor-default rounded-full border border-hairline bg-white px-3 py-1.5 text-[11px] font-semibold text-muted"
              title="Link to be configured"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className={cn('rounded-md border border-hairline bg-white p-4 shadow-card sm:p-5', compact && 'p-3.5')}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-card transition-all hover:bg-brand-dark sm:h-14 sm:w-14"
        >
          <span aria-hidden className="absolute inset-0 rounded-full border-2 border-gold opacity-0 transition-opacity duration-300 hover:opacity-100" />
          <span className="relative">
            <Play aria-hidden className={cn('h-5 w-5 fill-current transition-all duration-300', playing ? 'scale-0 opacity-0' : 'scale-100 opacity-100')} />
            <Pause aria-hidden className={cn('absolute inset-0 h-5 w-5 fill-current transition-all duration-300', playing ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
          </span>
        </button>

        <div className="min-w-0 flex-1">
          {/* waveform */}
          <div className="flex h-9 items-center gap-[3px]" aria-hidden>
            {Array.from({ length: 34 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'w-[3px] origin-center rounded-full transition-colors',
                  (i / 34) * 100 <= progress ? 'bg-gold' : 'bg-brand/20',
                  playing && 'animate-wave-bar'
                )}
                style={{ height: `${10 + ((i * 7919) % 24)}px`, animationDelay: `${(i % 10) * 70}ms`, animationDuration: `${800 + ((i * 13) % 500)}ms` }}
              />
            ))}
          </div>
          {/* progress */}
          <div
            role="progressbar"
            aria-label="Seek"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onClick={seek}
            onKeyDown={(e) => {
              const el = audioRef.current;
              if (!el) return;
              if (e.key === 'ArrowRight') el.currentTime = Math.min(el.currentTime + 5, duration);
              if (e.key === 'ArrowLeft') el.currentTime = Math.max(el.currentTime - 5, 0);
            }}
            className="mt-1 h-1.5 cursor-pointer rounded-full bg-hairline"
          >
            <div className="relative h-full rounded-full bg-brand transition-[width] duration-150" style={{ width: `${progress}%` }}>
              <span className="absolute -right-1.5 -top-[3px] h-3 w-3 rounded-full border-2 border-white bg-gold shadow" />
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums text-muted">
            <span>{formatDuration(current)}</span>
            <span>{duration ? formatDuration(duration) : '—:—'}</span>
          </div>
        </div>

        {/* volume + speed */}
        <div className="hidden flex-col gap-2.5 sm:flex">
          <label className="flex items-center gap-2" aria-label="Volume">
            <Volume2 aria-hidden className="h-4 w-4 text-muted" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-20 cursor-pointer accent-brand"
            />
          </label>
          <button
            type="button"
            onClick={() => setRate(rates[(rates.indexOf(rate) + 1) % rates.length])}
            className="flex items-center gap-1.5 self-end rounded-full border border-hairline px-2.5 py-1 text-[11px] font-bold text-ink/70 transition-colors hover:border-brand hover:text-brand"
            aria-label={`Playback speed ${rate}x — click to change`}
          >
            <Gauge aria-hidden className="h-3 w-3" />
            {rate}x
          </button>
        </div>
      </div>
    </div>
  );
}
