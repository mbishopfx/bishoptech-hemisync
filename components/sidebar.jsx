import Link from 'next/link';
import { Home, Brain, Activity, Library, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-glass border-r border-strong backdrop-blur-xl flex flex-col justify-between hidden md:flex z-50 transition-colors duration-300">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="size-8 rounded bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            <Brain className="size-5 text-cyan-400" />
          </div>
          <span className="font-display font-bold tracking-wide text-lg text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">Cognistration</span>
        </Link>
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20">
            <Home className="size-4" />
            Dashboard
          </Link>
          <Link href="/generate" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20">
            <Activity className="size-4" />
            Generator
          </Link>
          <Link href="/library" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-transparent hover:border-cyan-500/20">
            <Library className="size-4" />
            Library
          </Link>
        </nav>
      </div>
      <div className="p-6 border-t border-strong">
        <div className="flex items-center justify-between">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-secondary hover:text-cyan-400 transition-colors">
            <Settings className="size-4" />
            Config
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
