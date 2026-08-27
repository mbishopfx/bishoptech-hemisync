import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UcpCheckoutContinuationPage({ params }) {
  const checkoutId = (await params)?.checkoutId || '';
  return (
    <main className="min-h-[100dvh] bg-[#eef1ee] px-5 py-16 text-[#1d302c] sm:px-8">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#cbd6cf] bg-white/90 p-8 shadow-[0_24px_70px_rgba(45,65,59,0.1)] sm:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#548477]">Cognistration checkout</p>
        <h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-0.055em] sm:text-5xl">Continue in your secure checkout.</h1>
        <p className="mt-5 text-base leading-7 text-[#60716b]">Your assistant has prepared a Cognistration order. Return to the conversation to continue, or browse the published tone packs to start a new selection.</p>
        <p className="mt-4 text-xs text-[#87958f]">Checkout reference: {checkoutId}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/packs" className="rounded-full bg-[#1d302c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#315e55]">Browse tone packs</Link>
          <Link href="/" className="rounded-full border border-[#cbd6cf] px-5 py-3 text-sm font-medium text-[#315e55] transition hover:border-[#8da99d]">Return home</Link>
        </div>
      </div>
    </main>
  );
}
