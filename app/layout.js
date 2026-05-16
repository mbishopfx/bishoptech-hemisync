import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${sansFont.variable} min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none z-[-1]" />
          <div className="fixed inset-0 cyber-glow opacity-30 pointer-events-none z-[-1]" />
          
          <div className="flex min-h-screen">
            <main className="flex-1 flex flex-col min-h-screen relative z-0">
              {children}
            </main>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
