import { Suspense } from 'react';
import { SignupClient } from './SignupClient';

export const metadata = {
  title: { absolute: 'Sign Up — Cognistration' },
  description: 'Create an account for your private Cognistration listening workspace.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Sign Up — Cognistration',
    description: 'Create an account for your private Cognistration listening workspace.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/signup',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up — Cognistration',
    description: 'Create an account for your private Cognistration listening workspace.',
    images: ['/images/og-preview.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#eef1ee]" />}>
      <SignupClient />
    </Suspense>
  );
}
