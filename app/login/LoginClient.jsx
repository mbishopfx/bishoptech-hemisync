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
            <h1 className="text-3xl font-light tracking-tight mb-2">Welcome Back</h1>
            <p className="text-white/40 text-sm">Resume your neural synchronization.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-4">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                placeholder="operator@hemisync.sys"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-white/30 ml-4">Access Key</label>
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
              {loading ? <Loader2 className="size-5 animate-spin" /> : <>Access System <ArrowRight className="size-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
            <p className="text-white/30 text-xs">New operator? <Link href="/signup" className="text-cyan-400 hover:underline">Apply for credentials</Link></p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
