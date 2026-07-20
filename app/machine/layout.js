export const metadata = {
  title: { absolute: 'Inside the Machine — Cognistration' },
  description: 'See how Cognistration organizes listening, generation, and account workflows.',
  alternates: { canonical: '/machine' },
  openGraph: {
    title: 'Inside the Machine — Cognistration',
    description: 'See how Cognistration organizes listening, generation, and account workflows.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/machine',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inside the Machine — Cognistration',
    description: 'See how Cognistration organizes listening, generation, and account workflows.',
    images: ['/images/og-preview.png'],
  },
};

export default function MachineLayout({ children }) {
  return children;
}
