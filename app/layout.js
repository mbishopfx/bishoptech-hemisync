import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata = {
  title: 'HemiSync Studio',
  description: 'Premium binaural and hemisync session generation for focus, recovery, creative drift, and deep calm.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${sansFont.variable} min-h-screen overflow-x-hidden bg-background text-foreground font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relaxing-overlay" />
          <div className="waves" />
          <ThemeToggle />
          <div className="page-shell desktop-shell">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
