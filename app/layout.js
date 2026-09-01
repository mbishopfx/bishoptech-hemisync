import './globals.css';
import { DM_Mono, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';
import { buildAbsoluteUrl } from '@/lib/seo';
import { CursorLight } from '@/components/visuals/CursorLight';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';
const siteName = 'Cognistration';
const siteDescription = 'Cognistration is a personal meditation and listening platform that creates controlled audio sessions for focus, rest, reflection, and intentional reset.';

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
    default: `${siteName} — A personal meditation and listening platform`,
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
    canonical: '/',
    types: {
      'text/markdown': '/index.md'
    }
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: `${siteName} — A personal meditation and listening platform`,
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
    title: `${siteName} by BishopTech — A personal meditation and listening platform`,
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
      sameAs: [
        'https://github.com/mbishopfx/bishoptech-hemisync',
        'https://github.com/mbishopfx/cognistration-webmcp-challenge',
        'https://bishoptech.dev'
      ],
      knowsAbout: [
        'auditory attention cues',
        'frequency-following response',
        'user-controlled listening sessions'
      ],
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
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#application`,
      name: siteName,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web browser',
      url: siteUrl,
      description: 'A user-controlled listening platform for focus, rest, reflection, and intentional reset.',
      offers: {
        '@type': 'Offer',
        price: '20.00',
        priceCurrency: 'USD',
        url: `${siteUrl}/pricing`,
        category: 'Lifetime private workspace access'
      },
      publisher: { '@id': organizationId },
      featureList: [
        'Bounded public tone preview',
        'Adjustable listening controls',
        'Private saved sessions with lifetime access'
      ]
    },
    {
      '@type': 'Service',
      '@id': `${siteUrl}/#machine-workshop`,
      name: 'Cognistration Machine Workshop',
      serviceType: 'User-controlled audio session workshop',
      provider: { '@id': organizationId },
      url: `${siteUrl}/machine`,
      description: 'A bounded browser workshop where a listener can shape carrier, rhythm, state, volume, and duration before choosing whether to preview.'
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does Cognistration force a brainwave state?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Cognistration presents controllable audio cues and describes frequency-following research without promising or forcing a particular brainwave state.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can listeners change the tone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The visible machine exposes bounded carrier, rhythm, volume, direction, layer, and duration choices so a listener can explore what feels useful and save a repeatable starting point in the private workspace.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is Cognistration medical treatment?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Cognistration is a general listening and reflection tool, not diagnosis, treatment, or a substitute for professional care.'
          }
        }
      ]
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/#breadcrumb`,
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Cognistration',
        item: siteUrl
      }]
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="text/markdown" href="/index.md" />
        <link rel="ard" href="/.well-known/ard.json" />
        <link rel="api-catalog" href="/.well-known/api-catalog" />
      </head>
      <body
        className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} min-h-[100dvh] bg-background text-foreground font-sans selection:bg-emerald-700/20`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CursorLight />
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
