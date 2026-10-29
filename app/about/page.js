import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

export const metadata = {
  title: 'About Cognistration',
  description: 'About Cognistration, a personal listening platform by BishopTech for intentional, user-controlled audio sessions.',
  alternates: { canonical: '/about', types: { 'text/markdown': '/about.md' } }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080c0b] text-[#f2f0ea] selection:bg-[#b6ddcc]/60">
      <PublicHeader theme="dark" />

      <main className="px-6 pb-24 pt-32 text-[#f2f0ea] sm:px-10 sm:pt-36 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.24em] text-[#b6ddcc]">About Cognistration</p>
          <h1 className="mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">A listening practice you can shape.</h1>
          <div className="mt-10 space-y-6 text-base leading-8 text-white/55 sm:text-lg">
            <p>Cognistration is a personal listening platform by BishopTech. It gives people a deliberate auditory cue for focus, rest, reflection, and intentional reset, then keeps the underlying choices visible and adjustable.</p>
            <p>Every brain and every day is different. The product therefore treats its tones as a free-will generator: a person can explore a direction, change the carrier, rhythm, volume, layers, and duration, notice what feels useful, and save a repeatable starting point for a later session. It does not force a frequency, prescribe a mental state, or claim to replace care.</p>
            <p>The public site includes a bounded browser preview, a typed MCP server, WebMCP tools, an educational FFR guide, and user-controlled account and purchase flows. Private workspace features stay behind authentication, and payment credentials never pass through the public agent surface.</p>
            <p>We publish the product boundaries because a useful listening tool should preserve agency. Read the <Link className="text-[#b6ddcc] underline underline-offset-4" href="/docs">developer docs</Link>, <Link className="text-[#b6ddcc] underline underline-offset-4" href="/health-warning">health warning</Link>, or <Link className="text-[#b6ddcc] underline underline-offset-4" href="/contact">contact page</Link> to learn more.</p>
          </div>

          <div className="mt-14 border-t border-white/10 pt-8">
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-white/45">Start listening</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-[#b6ddcc] px-5 py-3 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2]"
              >
                See pricing — $2.99 once
              </Link>
              <Link
                href="/tutorial"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/[0.06]"
              >
                Read the setup guide
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicTrustFooter />
    </div>
  );
}
