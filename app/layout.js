import './globals.css';
import { Cormorant_Garamond, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display'
});

const sansFont = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans'
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono'
});

export const metadata = {
  title: 'HemiSync Studio',
  description: 'Premium beats-only hemispheric synchronization sessions with staged entrainment, ambient beds, and mastered export.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable} min-h-screen overflow-x-hidden bg-[var(--bg-0)] text-[var(--text-primary)]`}
      >
        <div className="relaxing-overlay" />
        <div className="waves" />
        <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
