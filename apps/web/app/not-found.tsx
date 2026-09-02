import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SearchBar } from '@/components/common/SearchBar';

export default function NotFound() {
  return (
    <div className="container-tsc flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="eyebrow justify-center">
        <span aria-hidden className="gold-dot" /> Error 404
      </p>
      <h1 className="mt-4 font-display text-5xl font-bold tracking-tight sm:text-7xl">
        This chapter <span className="font-serif italic text-brand">doesn&apos;t exist.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-muted">
        The page you are looking for was moved, renamed or never written. Try searching the platform instead.
      </p>
      <div className="mt-8 w-full max-w-md">
        <SearchBar />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/" size="md">
          <ArrowLeft aria-hidden className="h-4 w-4" /> Back to Home
        </Button>
        <Button href="/news" variant="outline" size="md">
          <Search aria-hidden className="h-4 w-4" /> Latest News
        </Button>
      </div>
      <p className="mt-10 text-xs text-muted">
        Or explore{' '}
        <Link href="/stories" className="cta-underline text-brand">Stories</Link>,{' '}
        <Link href="/campus" className="cta-underline text-brand">Campus</Link>,{' '}
        <Link href="/career" className="cta-underline text-brand">Career</Link> or{' '}
        <Link href="/podcast" className="cta-underline text-brand">Podcast</Link>.
      </p>
    </div>
  );
}
