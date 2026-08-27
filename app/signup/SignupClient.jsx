'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, LockKey, SpinnerGap } from '@phosphor-icons/react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';

const accountBenefits = [
  'Shape sessions in the private Workshop',
  'Save projects and return to them later',
  'Download finished listening sessions'
];

export function SignupClient() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedUsername = username.trim().toLowerCase();
    try {
      const availabilityResponse = await fetch(`/api/account/username?value=${encodeURIComponent(normalizedUsername)}`, { cache: 'no-store' });
      const availability = await availabilityResponse.json();
      if (!availabilityResponse.ok || !availability.available) {
        setError(availability.error || 'That username is already taken.');
        setLoading(false);
        return;
      }
    } catch {
      setError('We could not check that username. Please try again.');
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: normalizedUsername,
          requested_plan: 'lifetime'
        }
      }
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await redirectToStripeCheckout({ fallbackPath: '/login' });
      return;
    }

    setError('Check your email to verify your account. After verification, sign in to complete the $20 one-time checkout.');
    setLoading(false);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <PublicHeader />

      <main className="relative mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-14 px-5 pb-20 pt-36 sm:px-8 lg:grid-cols-[0.9fr_0.8fr] lg:gap-24 lg:px-12 lg:pt-40">
        <section className="max-w-xl">
          <h1 className="max-w-[12ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">Make the next moment yours.</h1>
          <p className="mt-7 max-w-lg text-base leading-8 text-[#60716b] sm:text-lg">Create a private Cognistration workspace for listening sessions that can change with the way your day changes.</p>
          <ul className="mt-10 space-y-4 border-t border-[#cbd6cf] pt-7">
            {accountBenefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-[#4e625b] sm:text-base">
                <CheckCircle className="size-5 shrink-0 text-[#548477]" weight="fill" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[2rem] border border-[#cbd6cf] bg-white/90 p-7 shadow-[0_24px_70px_rgba(45,65,59,0.1)] backdrop-blur-xl sm:p-10"
        >
          <div>
            <h2 className="text-3xl font-medium tracking-[-0.045em]">Create your account</h2>
            <p className="mt-3 text-sm leading-6 text-[#66746f]">Create your login, then securely unlock the private platform for $20 one time.</p>
          </div>

          <form
            onSubmit={handleSignup}
            toolname="cognistration_create_account"
            tooldescription="Create a Cognistration account. The user must review the entered credentials and submit this form themselves."
            data-agent-action="account-signup"
            className="mt-8 space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="signup-username" className="block text-sm font-medium text-[#31443e]">Username</label>
              <p className="text-xs leading-5 text-[#7a8983]">Use 3–32 letters, numbers, periods, dashes, or underscores.</p>
              <input
                id="signup-username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 32))}
                required
                minLength={3}
                autoComplete="username"
                className="w-full rounded-2xl border border-[#cbd6cf] bg-[#f7f8f5] px-5 py-3.5 text-sm text-[#1d302c] outline-none transition focus:border-[#548477] focus:ring-4 focus:ring-[#b6ddcc]/35"
                placeholder="Choose a username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="block text-sm font-medium text-[#31443e]">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-[#cbd6cf] bg-[#f7f8f5] px-5 py-3.5 text-sm text-[#1d302c] outline-none transition focus:border-[#548477] focus:ring-4 focus:ring-[#b6ddcc]/35"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-password" className="block text-sm font-medium text-[#31443e]">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-[#cbd6cf] bg-[#f7f8f5] px-5 py-3.5 text-sm text-[#1d302c] outline-none transition focus:border-[#548477] focus:ring-4 focus:ring-[#b6ddcc]/35"
                placeholder="At least 8 characters"
              />
            </div>

            {error && <p role="alert" className="rounded-xl border border-[#d6a58f] bg-[#fff6f1] px-4 py-3 text-sm leading-6 text-[#8f513d]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <SpinnerGap className="size-5 animate-spin" aria-hidden="true" /> : <>Create account and continue <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></>}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 border-t border-[#dbe2dd] pt-6 text-xs leading-5 text-[#7a8983]">
            <LockKey className="mt-0.5 size-4 shrink-0 text-[#548477]" weight="bold" aria-hidden="true" />
            You control the account and checkout steps. Cognistration will never submit credentials or payment on your behalf.
          </div>
          <p className="mt-6 text-sm text-[#66746f]">Already have an account? <Link href="/login" className="font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 hover:text-[#1d302c]">Sign in</Link></p>
        </motion.section>
      </main>

      <footer className="border-t border-[#cbd6cf] px-5 py-10 text-center text-xs text-[#7a8983] sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {['/privacy', '/terms', '/cookies', '/ai-disclosure', '/health-warning', '/contact'].map((href) => (
            <Link key={href} href={href} className="transition-colors hover:text-[#1d302c]">{href.slice(1).replace('-', ' ')}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
