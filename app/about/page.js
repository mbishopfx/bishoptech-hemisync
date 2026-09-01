import Link from 'next/link';

export const metadata = {
  title: 'About Cognistration',
  description: 'About Cognistration, a personal listening platform by BishopTech for intentional, user-controlled audio sessions.',
  alternates: { canonical: '/about', types: { 'text/markdown': '/about.md' } }
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#eef1ee] px-6 py-24 text-[#1d302c] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[#548477]">About Cognistration</p>
        <h1 className="mt-6 text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">A listening practice you can shape.</h1>
        <div className="mt-10 space-y-6 text-base leading-8 text-[#5f706b] sm:text-lg">
          <p>Cognistration is a personal listening platform by BishopTech. It gives people a deliberate auditory cue for focus, rest, reflection, and intentional reset, then keeps the underlying choices visible and adjustable.</p>
          <p>Every brain and every day is different. The product therefore treats its tones as a free-will generator: a person can explore a direction, change the carrier, rhythm, volume, layers, and duration, notice what feels useful, and save a repeatable starting point for a later session. It does not force a frequency, prescribe a mental state, or claim to replace care.</p>
          <p>The public site includes a bounded browser preview, a typed MCP server, WebMCP tools, an educational FFR guide, and user-controlled account and purchase flows. Private workspace features stay behind authentication, and payment credentials never pass through the public agent surface.</p>
          <p>We publish the product boundaries because a useful listening tool should preserve agency. Read the <Link className="text-[#315e55] underline underline-offset-4" href="/docs">developer docs</Link>, <Link className="text-[#315e55] underline underline-offset-4" href="/health-warning">health warning</Link>, or <Link className="text-[#315e55] underline underline-offset-4" href="/contact">contact page</Link> to learn more.</p>
        </div>
      </div>
    </main>
  );
}
