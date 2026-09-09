import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, Fraunces } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/providers/Providers';
import { WhatsAppStickyButton } from '@/components/common/WhatsAppStickyButton';
import { site } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'student chapters', 'TSC', 'India students', 'campus news', 'student stories',
    'internships India', 'fellowships', 'student podcast', 'campus events',
    'current affairs students', 'legal awareness students', 'youth platform India',
    'career counseling', 'campus ambassador India',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TSC',
  },
  formatDetection: {
    telephone: false,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#1457A2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/brand/tsc-logo.jpg`,
      sameAs: [site.social.instagram].filter(Boolean),
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      publisher: { '@id': `${site.url}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${fraunces.variable}`}>
      <body>
        <Providers>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <WhatsAppStickyButton />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
