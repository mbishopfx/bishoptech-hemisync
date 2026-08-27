export const metadata = {
  title: { absolute: 'Try the Cognistration Agent Flow' },
  description: 'Run Cognistration’s public WebMCP challenge flow from intention clarification to a consent-gated machine preview.',
  alternates: { canonical: '/try' },
  openGraph: {
    title: 'Try the Cognistration Agent Flow',
    description: 'A public cockpit for Cognistration intention, comparison, ritual, machine, and payment flows.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/try',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Try the Cognistration Agent Flow',
    description: 'Run the public Cognistration WebMCP challenge cockpit.',
    images: ['/images/og-preview.png']
  }
};

export default function TryLayout({ children }) {
  return children;
}
