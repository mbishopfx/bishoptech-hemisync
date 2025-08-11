export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-wide text-white">HemiSync</h1>
        <p className="text-white/80">Use the generator UI to create a session:</p>
        <p className="mt-4">
          <a href="/generate" className="rounded-md bg-sky-400/90 px-4 py-2 text-slate-900 hover:bg-sky-300">
            Open Session Generator
          </a>
        </p>
        <p className="mt-6 text-white/60">API endpoints (POST): <code className="text-sky-300">/api/journal</code>, <code className="text-sky-300">/api/guidance</code>, <code className="text-sky-300">/api/audio/generate</code>.</p>
      </div>
    </main>
  );
}

