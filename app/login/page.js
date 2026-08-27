import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata = {
  title: { absolute: 'Sign In — Cognistration' },
  description: 'Secure sign-in for your private Cognistration listening workspace.',
  alternates: { canonical: '/login' },
  openGraph: {
    title: 'Sign In — Cognistration',
    description: 'Secure sign-in for your private Cognistration listening workspace.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/login',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In — Cognistration',
    description: 'Secure sign-in for your private Cognistration listening workspace.',
    images: ['/images/og-preview.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#eef1ee]" />}>
      <LoginClient />
    </Suspense>
  );
}
