import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';

export function LegalPageShell({ eyebrow, title, summary, children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <PublicHeader />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="pt-40 pb-24 px-6 relative z-10 max-w-4xl mx-auto">
        <div className="mb-10 space-y-4">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">{eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-white">{title}</h1>
          <p className="max-w-3xl text-sm md:text-base leading-7 text-white/55">{summary}</p>
          <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.25em] text-white/35">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/ai-disclosure" className="hover:text-white transition-colors">AI Disclosure</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/health-warning" className="hover:text-white transition-colors">Health Warning</Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-8 md:p-10 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
