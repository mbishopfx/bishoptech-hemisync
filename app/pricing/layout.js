export const metadata = {
  title: { absolute: 'Pricing — Cognistration' },
  description: 'Cognistration is one complete private audio studio with lifetime access for a one-time $20 payment.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — Cognistration',
    description: 'Cognistration is one complete private audio studio with lifetime access for a one-time $20 payment.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/pricing',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Cognistration',
    description: 'Cognistration is one complete private audio studio with lifetime access for a one-time $20 payment.',
    images: ['/images/og-preview.png'],
  },
};

export default function PricingLayout({ children }) {
  return children;
}
