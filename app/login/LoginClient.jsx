'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Loader2, ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = getSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      router.push(next);
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
    </div>
  );
}
