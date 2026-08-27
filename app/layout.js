import './globals.css';
import { DM_Mono, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';
import { buildAbsoluteUrl } from '@/lib/seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';
const siteName = 'Cognistration';
const siteDescription = 'Cognistration turns a simple intention into a personal listening session for focus, rest, and intentional reset.';

const displayFont = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700']
});

const sansFont = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700']
});

const monoFont = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500']
});

const organizationId = buildAbsoluteUrl('/#organization');
const websiteId = buildAbsoluteUrl('/#website');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Personal audio sessions for focus, rest, and intentional reset`,
    template: '%s — Cognistration'
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'binaural audio',
    'focus sessions',
    'rest routine',
    'wellness audio',
    'intentional reset',
    'premium audio experience'
  ],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: `${siteName} — Personal audio sessions for focus, rest, and intentional reset`,
    description: siteDescription,
    images: [
      {
        url: '/images/og-preview.png',
        width: 1254,
        height: 1254,
        alt: 'Cognistration brainwave mark'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} by BishopTech — Premium audio sessions for focus, rest, and intentional reset`,
    description: siteDescription,
    images: ['/images/og-preview.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: siteName,
      alternateName: 'BishopTech',
      url: siteUrl,
      logo: `${siteUrl}/images/cognistration-mark.png`,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'matt@bishoptech.dev',
          availableLanguage: ['en']
        }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      publisher: {
        '@id': organizationId
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} min-h-[100dvh] bg-background text-foreground font-sans selection:bg-emerald-700/20`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-[100dvh]">
            <main className="min-w-0 flex-1 flex flex-col min-h-[100dvh] relative z-0">
              {children}
            </main>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
