'use client';

export default function Error({ error, reset }) {
  return (
    <main className="mx-auto max-w-2xl p-6 text-white">
      <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
      <p className="mb-4 text-white/80">{String(error?.message || 'Unknown error')}</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
      >
        Try again
      </button>
    </main>
  );
}




