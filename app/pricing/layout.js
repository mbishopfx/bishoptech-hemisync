export const metadata = {
  title: { absolute: 'Pricing — Cognistration' },
  description: 'Compare Cognistration plans, free access, and premium membership options.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — Cognistration',
    description: 'Compare Cognistration plans, free access, and premium membership options.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/pricing',
    images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — Cognistration',
    description: 'Compare Cognistration plans, free access, and premium membership options.',
    images: ['/images/og-preview.png'],
  },
};

export default function PricingLayout({ children }) {
  return children;
}
