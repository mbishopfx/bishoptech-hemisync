'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('next') || '/dashboard';

  async function handlePasswordLogin(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setLoading(true);
    setStatus('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
      setStatus('Magic link sent. Check your email.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="w-full max-w-lg p-8">
        <div className="mb-8">
          <p className="section-label">Member Access</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Log in to HemiSync Studio</h1>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Access saved tones, your feed, and the controlled audio workspace.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handlePasswordLogin}>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Email
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Password
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <Button disabled={loading}>{loading ? 'Checking...' : 'Log In'}</Button>
          <Button type="button" variant="secondary" disabled={loading || !email} onClick={handleMagicLink}>
            Send Magic Link
          </Button>
        </form>

        {status && <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/72">{status}</p>}
        <p className="mt-6 text-sm text-white/54">
          New here? <Link className="text-white" href="/signup">Create an account</Link>
        </p>
      </Card>
    </main>
  );
}
