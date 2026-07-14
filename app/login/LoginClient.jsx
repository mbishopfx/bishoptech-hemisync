'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Loader2, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
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
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = getSupabaseBrowserClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
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
        setSubscriptionRequired(true);
      } catch {
        setError('We could not verify your membership. Please try again.');
      }
      setLoading(false);
    }
  };

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    await redirectToStripeCheckout({ fallbackPath: '/pricing' });
    setCheckoutLoading(false);
  };

  const signOut = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    setSubscriptionRequired(false);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <PublicHeader />
      
      <main className="pt-40 pb-20 px-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-900/50 backdrop-blur-2xl border border-white/5 p-10 rounded-[3rem] shadow-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">Welcome back</h1>
            <p className="text-white/40 text-sm">Sign in to continue your sessions and saved work.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-4">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-4">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <>Sign in <ArrowRight className="size-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-white/30 text-xs">Need an account? <Link href="/signup" className="text-cyan-400 hover:underline">Create one</Link></p>
          </div>
        </motion.div>
      </main>

      <footer className="pb-12 px-6">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] font-mono uppercase tracking-[0.28em] text-white/25 text-center">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          <Link href="/ai-disclosure" className="hover:text-white transition-colors">AI Disclosure</Link>
          <Link href="/health-warning" className="hover:text-white transition-colors">Health Warning</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </footer>

      <AnimatePresence>
        {subscriptionRequired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-5 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-zinc-950 p-8 shadow-[0_0_80px_rgba(34,211,238,0.12)] sm:p-10"
            >
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <CreditCard className="size-6" />
              </div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.32em] text-cyan-300">Membership required</p>
              <h2 className="text-3xl font-light tracking-tight">Unlock your private audio studio.</h2>
              <p className="mt-4 text-sm leading-6 text-white/45">
                Your account is ready, but an active Cognistration membership is required to enter the platform.
              </p>
              <div className="my-7 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div><p className="font-medium">Complete membership</p><p className="mt-1 text-xs text-white/35">Cancel anytime through Stripe</p></div>
                  <p className="text-2xl font-semibold">$9<span className="text-sm font-normal text-white/35">/mo</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={startCheckout}
                disabled={checkoutLoading}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-semibold text-black transition hover:bg-cyan-200 disabled:opacity-50"
              >
                {checkoutLoading ? <Loader2 className="size-5 animate-spin" /> : <>Continue to secure checkout <ArrowRight className="size-4" /></>}
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/30"><ShieldCheck className="size-3 text-cyan-400" /> Card details are handled securely by Stripe</p>
              <button type="button" onClick={signOut} className="mt-6 w-full text-xs text-white/30 transition hover:text-white/60">Sign out</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
