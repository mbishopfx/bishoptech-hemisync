'use client';

import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/sidebar';
import { usePathname } from 'next/navigation';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Public pages that should NOT show the sidebar
  const isPublicPage = pathname === '/' || pathname === '/pricing' || pathname === '/login' || pathname === '/signup' || pathname === '/learn' || pathname === '/machine';

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${sansFont.variable} min-h-screen bg-background text-foreground font-sans selection:bg-cyan-500/30`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none z-[-1]" />
          <div className="fixed inset-0 cyber-glow opacity-30 pointer-events-none z-[-1]" />
          
          <div className="flex min-h-screen">
            {!isPublicPage && <Sidebar />}
            <main className={`flex-1 ${!isPublicPage ? 'md:pl-64' : ''} flex flex-col min-h-screen relative z-0`}>
              {!isPublicPage && (
                <div className="md:hidden flex items-center justify-between p-4 border-b border-strong bg-glass backdrop-blur-xl sticky top-0 z-50">
                   <span className="font-display font-bold tracking-wide text-lg text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">HemiSync.sys</span>
                </div>
              )}
              <div className={`flex-1 ${!isPublicPage ? 'p-6 md:p-10' : ''} max-w-7xl mx-auto w-full`}>
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
