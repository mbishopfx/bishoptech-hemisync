import Link from 'next/link';

export const metadata = {
  title: 'Not found — Cognistration',
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#eef1ee] px-6 py-24 text-[#1d302c]">
      <section className="max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#548477]">404 · Not found</p>
        <h1 className="mt-5 text-5xl font-medium tracking-[-0.06em]">That route is not part of the public surface.</h1>
        <p className="mt-5 text-base leading-7 text-[#60716b]">Use the developer docs or agent instructions to discover the supported Cognistration pages, tools, and API routes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/" className="rounded-full bg-[#1d302c] px-5 py-3 text-white transition hover:bg-[#315e55]">Return home</Link>
          <Link href="/docs" className="rounded-full border border-[#a8bcb2] px-5 py-3 text-[#315e55] transition hover:border-[#548477] hover:bg-white/60">Read docs</Link>
        </div>
      </section>
    </main>
  );
}
