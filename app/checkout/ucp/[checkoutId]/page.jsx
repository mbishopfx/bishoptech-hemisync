import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UcpCheckoutContinuationPage({ params }) {
  const checkoutId = (await params)?.checkoutId || '';
  return (
    <main className="min-h-[100dvh] bg-[#080c0b] px-5 py-16 text-[#f2f0ea] sm:px-8">
      <div className="liquid-card mx-auto max-w-2xl rounded-[2rem] p-8 sm:p-12">
        <h1 className="text-4xl font-medium leading-tight tracking-[-0.055em] sm:text-5xl">Continue in your secure checkout.</h1>
        <p className="mt-5 text-base leading-7 text-white/60">Your assistant has prepared a Cognistration order. Return to the conversation to continue, or browse the published tone packs to start a new selection.</p>
        <p className="mt-4 text-xs text-[#87958f]">Checkout reference: {checkoutId}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/packs" className="rounded-full bg-[#b6ddcc] px-5 py-3 text-sm font-medium text-[#0a1211] transition hover:bg-[#d5ece2]">Browse tone packs</Link>
          <Link href="/" className="rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-[#b6ddcc] transition hover:border-[#8da99d]">Return home</Link>
        </div>
      </div>
    </main>
  );
}
