export const metadata = {
  title: { absolute: 'The Cognistration Machine — Personal Audio Sessions' },
  description: 'See how Cognistration shapes personal listening sessions from intention, sound, rhythm, and pacing.',
  alternates: { canonical: '/machine' },
  openGraph: {
    title: 'The Cognistration Machine — Personal Audio Sessions',
    description: 'See how Cognistration shapes personal listening sessions from intention, sound, rhythm, and pacing.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/machine',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Cognistration Machine — Personal Audio Sessions',
    description: 'See how Cognistration shapes personal listening sessions from intention, sound, rhythm, and pacing.',
    images: ['/images/og-preview.png'],
  },
};

export default function MachineLayout({ children }) {
  return children;
}
