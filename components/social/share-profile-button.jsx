'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShareProfileButton({ profilePath }) {
  const [status, setStatus] = useState('idle');

  const handleCopy = async () => {
    const shareUrl = new URL(profilePath, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="secondary"
        className="min-w-44 border border-[var(--line-soft)] bg-[var(--bg-1)]/80 backdrop-blur-sm shadow-premium"
        onClick={handleCopy}
      >
        {status === 'copied' ? (
          <>
            <Check className="mr-2 size-4 text-[var(--accent-gold-strong)]" /> Link copied
          </>
        ) : (
          <>
            <Copy className="mr-2 size-4" /> Copy profile link
          </>
        )}
      </Button>
      <p className={`text-xs ${status === 'error' ? 'text-red-200/80' : 'text-muted'}`}>
        {status === 'error' ? 'Clipboard access failed. Please copy the link manually.' : 'Share this profile with the community.'}
      </p>
    </div>
  );
}