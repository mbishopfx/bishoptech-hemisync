import './globals.css';

export const metadata = {
  title: 'HemiSync App',
  description: 'AI journaling and hemispheric synchronization audio sessions'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen relaxing-bg text-slate-100 dark:text-slate-100 overflow-x-hidden">
        <div className="relaxing-overlay" />
        <div className="waves" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-4">
          {children}
        </div>
      </body>
    </html>
  );
}

