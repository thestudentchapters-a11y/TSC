'use client';

import { Images, UploadCloud } from 'lucide-react';

export default function AdminMediaPage() {
  const images = [
    '/images/hero/hero-campus-walk.jpg', '/images/hero/hero-classroom.jpg', '/images/hero/hero-founder.jpg',
    '/images/hero/hero-fest.jpg', '/images/hero/hero-collab.jpg', '/images/hero/hero-volunteer.jpg',
    '/images/hero/hero-podcast.jpg', '/images/hero/hero-workshop.jpg', '/images/news/news-1.jpg',
    '/images/news/news-2.jpg', '/images/news/news-3.jpg', '/images/news/news-4.jpg',
    '/images/stories/story-1.jpg', '/images/stories/story-2.jpg', '/images/stories/story-5.jpg',
    '/images/campus/campus-1.jpg', '/images/campus/campus-4.jpg', '/images/events/event-1.jpg',
    '/images/campaign/campaign-1.jpg', '/images/campaign/campaign-2.jpg', '/images/affairs/affairs-1.jpg',
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">Media Library</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          External image/file storage (e.g. Cloudinary — configurable). The database stores URL, public ID,
          filename, alt text, caption, type, dimensions and uploader — never large files.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-hairline bg-white px-6 py-12 text-center">
        <UploadCloud aria-hidden className="h-8 w-8 text-muted/50" />
        <p className="font-display text-sm font-bold">Upload media</p>
        <p className="max-w-md text-xs leading-5 text-muted">
          Uploads activate once CLOUDINARY_* keys are configured in the API environment. Until then, the
          library previews bundled placeholder assets.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((src) => (
          <figure key={src} className="group overflow-hidden rounded-md border border-hairline bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Bundled asset: ${src.split('/').pop()}`} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <figcaption className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium text-muted">
              <Images aria-hidden className="h-3 w-3 shrink-0" />
              <span className="truncate">{src.split('/').pop()}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
