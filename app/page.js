export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>HemiSync</h1>
      <p>Use the generator UI to create a session:</p>
      <p>
        <a href="/generate" style={{ color: '#06b6d4', textDecoration: 'underline' }}>
          Open Session Generator
        </a>
      </p>
      <p style={{ marginTop: 16 }}>API endpoints are under /api (POST): /api/journal, /api/guidance, /api/audio/generate.</p>
    </main>
  );
}

