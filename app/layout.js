import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';
const siteName = 'Cognistration';
const siteDescription = 'Premium audio sessions for focus, rest, and intentional reset.';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Premium audio sessions for focus, rest, and intentional reset`,
    template: `%s | ${siteName}`
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
    title: `${siteName} — Premium audio sessions for focus, rest, and intentional reset`,
    description: siteDescription,
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'Cognistration logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Premium audio sessions for focus, rest, and intentional reset`,
    description: siteDescription,
    images: ['/images/logo.png']
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/images/logo.png`,
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
      '@id': `${siteUrl}#website`,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      publisher: {
        '@id': `${siteUrl}#organization`
      }
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}#webpage`,
      name: `${siteName} Home`,
      url: siteUrl,
      description: siteDescription,
      isPartOf: {
        '@id': `${siteUrl}#website`
      },
      about: {
        '@id': `${siteUrl}#organization`
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${sansFont.variable} min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none z-[-1]" />
          <div className="fixed inset-0 cyber-glow opacity-30 pointer-events-none z-[-1]" />
          
          <div className="flex min-h-screen">
            <main className="flex-1 flex flex-col min-h-screen relative z-0">
              {children}
            </main>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
