'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react';
import { ToneMachineDemo } from './ToneMachineDemo';

function readMachineCredential() {
  if (typeof window === 'undefined') return { accessKey: null, sessionId: null, accessType: null };
  const url = new URL(window.location.href);
  const sessionId = url.searchParams.get('workshop_session_id');
  const hash = window.location.hash.replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);
  const machineAccessKey = hashParams.get('machine') || url.searchParams.get('machine_access_key');
  const workshopAccessKey = hashParams.get('workshop') || url.searchParams.get('access_key');
  return machineAccessKey
    ? { accessKey: machineAccessKey, sessionId: null, accessType: 'machine_payment' }
    : { accessKey: workshopAccessKey, sessionId, accessType: workshopAccessKey ? 'workshop' : null };
}

function clearWorkshopCredentialFromAddress() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.delete('workshop_session_id');
  url.searchParams.delete('access_key');
  url.searchParams.delete('machine_access_key');
  url.hash = '';
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

async function validate(accessKey) {
  const response = await fetch('/api/workshop/access/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessKey })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'That workshop access key is not active.');
  return data;
}

async function validateMachineAccess(accessKey) {
  const response = await fetch('/api/machine/access/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessKey })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'That machine access grant is not active.');
  return data;
}

export function WorkshopMachineExperience() {
  const [access, setAccess] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const { accessKey: initialAccessKey, sessionId, accessType } = readMachineCredential();
      if (!initialAccessKey && !sessionId) return;
      setStatus('checking');

      try {
        let accessKey = initialAccessKey;
        if (!accessKey && sessionId) {
          const response = await fetch(`/api/workshop/access?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.accessKey) throw new Error(data.error || 'Your payment is still being verified. Refresh in a moment.');
          accessKey = data.accessKey;
        }

        const validated = accessType === 'machine_payment'
          ? await validateMachineAccess(accessKey)
          : await validate(accessKey);
        if (cancelled) return;
        setAccess(validated);
        setStatus('active');
        setMessage(accessType === 'machine_payment' ? 'Your paid machine session is active.' : 'Your 24-hour workshop access is active.');
        clearWorkshopCredentialFromAddress();
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        setMessage(error?.message || 'Workshop access could not be verified.');
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-4">
      {status === 'checking' && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60" role="status">
          <Clock className="size-5 animate-pulse text-[#b6ddcc]" weight="light" aria-hidden="true" />
          Checking your workshop access…
        </div>
      )}
      {status === 'active' && access && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#b6ddcc]/20 bg-[#b6ddcc]/[0.08] px-4 py-3 text-sm text-[#d7eadf] sm:flex-row sm:items-center sm:justify-between" role="status">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-5 shrink-0 text-[#b6ddcc]" weight="fill" aria-hidden="true" />
            <span>{message}</span>
          </div>
          <span className="text-xs text-white/50">Active until {new Date(access.expiresAt).toLocaleString()}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] px-4 py-3 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div className="flex items-center gap-3">
            <WarningCircle className="size-5 shrink-0 text-amber-200" weight="light" aria-hidden="true" />
            <span>{message}</span>
          </div>
          <Link href="/pricing#machine-workshop" className="inline-flex shrink-0 items-center gap-2 text-xs text-[#d7eadf] underline decoration-white/20 underline-offset-4">Get access <ArrowRight className="size-3" weight="bold" aria-hidden="true" /></Link>
        </div>
      )}
      <ToneMachineDemo workshopAccess={access} />
    </div>
  );
}
