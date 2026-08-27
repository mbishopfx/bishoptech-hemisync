'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CreditCard, LockKey, ShieldCheck, SpinnerGap, X } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [membershipRequired, setMembershipRequired] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/account/access', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
        cache: 'no-store'
      });
      const result = await response.json();
      if (response.ok && result.access?.granted) {
        router.push(next);
        return;
      }
      setMembershipRequired(true);
    } catch {
      setError('We could not verify your platform access. Please try again.');
    }
    setLoading(false);
  };

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    await redirectToStripeCheckout({ fallbackPath: '/pricing' });
    setCheckoutLoading(false);
  };

  const signOut = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    setMembershipRequired(false);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#eef1ee] text-[#1d302c] selection:bg-[#b6ddcc]/60">
      <PublicHeader />

      <main className="relative mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-14 px-5 pb-20 pt-36 sm:px-8 lg:grid-cols-[0.9fr_0.8fr] lg:gap-24 lg:px-12 lg:pt-40">
        <section className="max-w-xl">
          <h1 className="max-w-[11ch] text-5xl font-medium leading-[0.98] tracking-[-0.065em] sm:text-7xl">Return to your practice.</h1>
          <p className="mt-7 max-w-lg text-base leading-8 text-[#60716b] sm:text-lg">Pick up the sessions, projects, and listening habits you have shaped inside Cognistration.</p>
          <div className="mt-10 border-t border-[#cbd6cf] pt-7 text-sm leading-7 text-[#4e625b] sm:text-base">
            <p>Sign in to reach your private Workshop and Studio.</p>
            <p className="mt-3 text-[#7a8983]">Your account stays yours. Access is unlocked once the one-time platform payment is complete.</p>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[2rem] border border-[#cbd6cf] bg-white/90 p-7 shadow-[0_24px_70px_rgba(45,65,59,0.1)] backdrop-blur-xl sm:p-10"
        >
          <div>
            <h2 className="text-3xl font-medium tracking-[-0.045em]">Welcome back</h2>
            <p className="mt-3 text-sm leading-6 text-[#66746f]">Sign in to continue your sessions and saved work.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-sm font-medium text-[#31443e]">Email address</label>
              <input
                id="login-email"
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
              <label htmlFor="login-password" className="block text-sm font-medium text-[#31443e]">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-[#cbd6cf] bg-[#f7f8f5] px-5 py-3.5 text-sm text-[#1d302c] outline-none transition focus:border-[#548477] focus:ring-4 focus:ring-[#b6ddcc]/35"
                placeholder="Your password"
              />
            </div>

            {error && <p role="alert" className="rounded-xl border border-[#d6a58f] bg-[#fff6f1] px-4 py-3 text-sm leading-6 text-[#8f513d]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <SpinnerGap className="size-5 animate-spin" aria-hidden="true" /> : <>Sign in <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></>}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 border-t border-[#dbe2dd] pt-6 text-xs leading-5 text-[#7a8983]">
            <LockKey className="mt-0.5 size-4 shrink-0 text-[#548477]" weight="bold" aria-hidden="true" />
            Need an account? <Link href="/signup" className="font-medium text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 hover:text-[#1d302c]">Create one</Link>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-[#cbd6cf] px-5 py-10 text-center text-xs text-[#7a8983] sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {['/privacy', '/terms', '/cookies', '/ai-disclosure', '/health-warning', '/contact'].map((href) => (
            <Link key={href} href={href} className="transition-colors hover:text-[#1d302c]">{href.slice(1).replace('-', ' ')}</Link>
          ))}
        </div>
      </footer>

      <AnimatePresence>
        {membershipRequired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#13201d]/80 px-5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative w-full max-w-md rounded-[2rem] border border-[#cbd6cf] bg-[#f7f8f5] p-8 text-[#1d302c] shadow-2xl sm:p-10"
            >
              <button type="button" onClick={() => setMembershipRequired(false)} className="absolute right-5 top-5 rounded-full p-2 text-[#7a8983] transition hover:bg-[#e5ece7] hover:text-[#1d302c]" aria-label="Close access message">
                <X className="size-5" aria-hidden="true" />
              </button>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#dcece2] text-[#315e55]">
                <CreditCard className="size-6" weight="duotone" aria-hidden="true" />
              </div>
                  <h2 className="mt-7 text-3xl font-medium tracking-[-0.045em]">Membership required to enter your private workspace.</h2>
              <p className="mt-4 text-sm leading-6 text-[#66746f]">Your account is ready. Complete the one-time platform payment to enter the private Workshop and Studio.</p>
              <div className="my-7 flex items-end justify-between gap-4 border-y border-[#dbe2dd] py-5">
                <div><p className="font-medium">Lifetime access</p><p className="mt-1 text-xs text-[#7a8983]">One payment through Stripe</p></div>
                <p className="text-3xl font-medium tracking-[-0.05em]">$20<span className="text-sm font-normal text-[#7a8983]"> once</span></p>
              </div>
              <button
                type="button"
                onClick={startCheckout}
                disabled={checkoutLoading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px disabled:opacity-60"
              >
                {checkoutLoading ? <SpinnerGap className="size-5 animate-spin" aria-hidden="true" /> : <>Continue to secure checkout <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></>}
              </button>
              <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#7a8983]"><ShieldCheck className="size-4 text-[#548477]" weight="fill" aria-hidden="true" /> Card details are handled by Stripe</p>
              <button type="button" onClick={signOut} className="mt-6 w-full text-xs text-[#7a8983] underline decoration-[#7a8983]/30 underline-offset-4 transition hover:text-[#1d302c]">Sign out</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
