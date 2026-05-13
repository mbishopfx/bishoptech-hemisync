import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Sidebar } from '@/components/sidebar';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

export const metadata = {
  title: 'HemiSync.sys',
  description: 'Premium binaural and hemisync session generation for focus, recovery, creative drift, and deep calm.'
};

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
            <Sidebar />
            <main className="flex-1 md:pl-64 flex flex-col min-h-screen relative z-0">
              <div className="md:hidden flex items-center justify-between p-4 border-b border-strong bg-glass backdrop-blur-xl sticky top-0 z-50">
                 <span className="font-display font-bold tracking-wide text-lg text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">HemiSync.sys</span>
                 {/* Mobile menu toggle could go here */}
              </div>
              <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
