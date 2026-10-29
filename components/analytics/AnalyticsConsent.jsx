'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cognistration:analytics-consent';

export function openAnalyticsPreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cognistration:open-analytics-preferences'));
  }
}

export function PrivacyChoicesButton({ children = 'Privacy choices', className = '' }) {
  return (
    <button type="button" onClick={openAnalyticsPreferences} className={className}>
      {children}
    </button>
  );
}

export function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    let savedChoice = null;
    try {
      const value = window.localStorage.getItem(CONSENT_KEY);
      if (value === 'granted' || value === 'denied') savedChoice = value;
    } catch {
      // Without persistent storage, consent remains denied and the choice stays available.
    }
    setChoice(savedChoice);
    setVisible(savedChoice === null);

    const onOpen = () => {
      setEditing(true);
      setVisible(true);
    };
    window.addEventListener('cognistration:open-analytics-preferences', onOpen);
    return () => window.removeEventListener('cognistration:open-analytics-preferences', onOpen);
  }, []);

  const saveChoice = (granted) => {
    const value = granted ? 'granted' : 'denied';
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      setChoice(null);
      setVisible(true);
      setEditing(false);
      setStorageUnavailable(true);
      return;
    }
    setStorageUnavailable(false);
    setChoice(value);
    setVisible(false);
    setEditing(false);
    window.dispatchEvent(new CustomEvent('cognistration:analytics-consent', {
      detail: { analytics: granted },
    }));
  };

  if (!visible) return null;

  return (
    <section
      aria-label="Analytics privacy choices"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-[#c1d2c7] bg-white p-5 text-[#1d302c] shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:inset-x-6 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold">Optional Google Analytics</h2>
          <p className="mt-2 text-sm leading-6 text-[#465a54]">
            {editing
              ? `Analytics are currently ${choice === 'granted' ? 'allowed' : choice === 'denied' ? 'off' : 'off until you choose'}. You can change this choice at any time.`
              : 'Choose whether Cognistration may use Google Analytics to measure general page views, button clicks, form starts, and completed purchases.'}
            {' '}Prompts, journal entries, health details, and form contents are not sent to analytics. See our{' '}
            <Link href="/cookies" className="underline underline-offset-2">Cookie Policy</Link>.
          </p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={() => { setVisible(false); setEditing(false); }}
            className="text-sm text-[#465a54] underline underline-offset-2"
          >
            Close
          </button>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => saveChoice(false)}
          className="min-h-11 rounded-full border border-[#93a99d] px-5 text-sm font-medium hover:bg-[#f2f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315e55]"
        >
          Reject analytics
        </button>
        <button
          type="button"
          onClick={() => saveChoice(true)}
          className="min-h-11 rounded-full bg-[#1d302c] px-5 text-sm font-medium text-white hover:bg-[#315e55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315e55]"
        >
          Allow analytics
        </button>
      </div>
      {storageUnavailable && (
        <p role="alert" className="mt-3 text-sm text-[#8b2e22]">
          Your browser could not save this choice, so analytics stays off. Allow local storage to save your preference.
        </p>
      )}
    </section>
  );
}
