import { Suspense } from 'react';
import { SignupClient } from './SignupClient';

export const metadata = {
  title: { absolute: 'Sign Up — Cognistration' },
  description: 'Create an account for the Cognistration portal.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Sign Up — Cognistration',
    description: 'Create an account for the Cognistration portal.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/signup',
    images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up — Cognistration',
    description: 'Create an account for the Cognistration portal.',
    images: ['/images/og-preview.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupClient />
    </Suspense>
  );
}
