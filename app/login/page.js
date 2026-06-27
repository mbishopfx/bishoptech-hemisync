import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata = {
  title: { absolute: 'Sign In — Cognistration' },
  description: 'Secure sign-in for the Cognistration portal.',
  alternates: { canonical: '/login' },
  openGraph: {
    title: 'Sign In — Cognistration',
    description: 'Secure sign-in for the Cognistration portal.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/login',
    images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In — Cognistration',
    description: 'Secure sign-in for the Cognistration portal.',
    images: ['/images/og-preview.png'],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginClient />
    </Suspense>
  );
}
