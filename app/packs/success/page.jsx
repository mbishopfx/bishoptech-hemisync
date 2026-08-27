'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, LoaderCircle, Mail } from 'lucide-react';

export default function PacksSuccessPage() {
  const [status, setStatus] = useState('Preparing your download…');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [packName, setPackName] = useState('your Cognistration pack');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const packSlug = params.get('pack');
    if (!sessionId || !packSlug) {
      setError('The checkout session reference is missing. Use the delivery email or contact support with your Stripe receipt.');
      return;
    }

    async function fulfillAndDownload() {
      try {
        const response = await fetch(`/api/packs/${encodeURIComponent(packSlug)}/download?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json().catch(() => ({}));
        if (response.status === 202) {
          setStatus('Payment confirmed. Your bundle is still being prepared. Check your email shortly.');
          return;
        }
        if (!response.ok || !data.url) throw new Error(data.error || 'The download could not be prepared.');

        setPackName(data.packName || packSlug.replaceAll('-', ' '));
        setDownloadUrl(data.url);
        setStatus('Payment confirmed. Starting your download…');

        const fileResponse = await fetch(data.url);
        if (!fileResponse.ok) throw new Error('The download link expired while starting.');
        const blob = await fileResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `${packSlug}.zip`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
        setStatus('Download started. A backup link has also been sent to your email.');
      } catch (err) {
        setError(err?.message || 'The download could not be started.');
        setStatus('Payment was received, but the download needs one more click.');
      }
    }

    fulfillAndDownload();
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[#eef1ee] text-[#1d302c]">
      <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-6 py-28 md:px-10">
        <section className="w-full rounded-[2.5rem] border border-[#cbd6cf] bg-white/80 p-8 text-center shadow-[0_30px_80px_-58px_rgba(45,65,59,0.42)] md:p-14">
        <CheckCircle2 className="mx-auto size-12 text-[#548477]" />
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] text-[#1d302c] md:text-6xl">Your audio is ready.</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#52635f]">{status}</p>
        {status.includes('started') && <LoaderCircle className="mx-auto mt-7 size-5 animate-spin text-[#548477]" />}
        {downloadUrl && (
          <a href={downloadUrl} download className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1d302c] px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white hover:bg-[#315e55]">
            <Download className="size-4" /> Download {packName}
          </a>
        )}
        <div className="mx-auto mt-8 flex max-w-md items-start gap-3 rounded-2xl border border-[#dbe2dd] bg-[#f7f9f6] p-4 text-left text-xs leading-5 text-[#71807b]"><Mail className="mt-0.5 size-4 shrink-0 text-[#548477]" />Your receipt and backup delivery link are sent to the email you entered at checkout. No Cognistration account is required.</div>
        {error && <p className="mt-6 rounded-2xl border border-[#d6a58f] bg-[#fff6f1] px-4 py-3 text-sm text-[#8f513d]">{error}</p>}
        <Link href="/packs" className="mt-8 inline-block text-xs text-[#71807b] underline decoration-[#b7c9bf] underline-offset-4 hover:text-[#1d302c]">Return to packs</Link>
        </section>
      </div>
    </main>
  );
}
