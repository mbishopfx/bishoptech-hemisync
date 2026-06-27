export const metadata = {
  title: { absolute: 'Tutorial — Cognistration' },
  description: 'Learn how to set up a calm listening session and use Cognistration effectively.',
  alternates: { canonical: '/tutorial' },
  openGraph: {
    title: 'Tutorial — Cognistration',
    description: 'Learn how to set up a calm listening session and use Cognistration effectively.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/tutorial',
    images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tutorial — Cognistration',
    description: 'Learn how to set up a calm listening session and use Cognistration effectively.',
    images: ['/images/og-preview.png'],
  },
};

export default function TutorialLayout({ children }) {
  return children;
}
