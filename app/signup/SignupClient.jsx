'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { redirectToStripeCheckout } from '@/lib/frontend/checkout';

export function SignupClient() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
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
          requested_plan: 'monthly'
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
    } else {
      setError('Check your email to verify your account. After verification, sign in to complete the $9 monthly checkout.');
      setLoading(false);
    }
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
            <h1 className="text-3xl font-light tracking-tight mb-2">Create your account</h1>
            <p className="text-white/40 text-sm">Create your login, then securely add your card through Stripe for <strong className="text-white">$9/month</strong>.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-4">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 32))}
                required
                minLength={3}
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                placeholder="Your username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-4">Email address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                placeholder="Minimum 8 characters"
              />
            </div>

            {error && <p className={`text-xs text-center ${error.includes('email') ? 'text-cyan-400' : 'text-red-400'}`}>{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <>Create account & continue <ArrowRight className="size-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-white/30 text-xs italic flex items-center justify-center gap-2">
              <ShieldCheck className="size-3 text-cyan-500" /> Secure account handling and encrypted transport in place
            </p>
            <p className="text-white/30 text-xs mt-6">Already have an account? <Link href="/login" className="text-cyan-400 hover:underline">Sign in</Link></p>
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
    </div>
  );
}
