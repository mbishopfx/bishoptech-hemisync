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
      <Card className="w-full max-w-lg p-10">
        <div className="mb-10 text-center">
          <p className="section-label">Member Access</p>
          <h1 className="mt-3 font-display text-4xl font-normal text-foreground">Log in to HemiSync</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Access saved tones, your feed, and the controlled audio workspace.
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handlePasswordLogin}>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground/80">
            Email
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground/80">
            Password
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <div className="flex flex-col gap-3 mt-2">
            <Button disabled={loading}>{loading ? 'Checking...' : 'Log In'}</Button>
            <Button type="button" variant="secondary" disabled={loading || !email} onClick={handleMagicLink}>
              Send Magic Link
            </Button>
          </div>
        </form>

        {status && <p className="mt-6 rounded-xl bg-[var(--bg-1)] p-4 text-center text-sm text-foreground shadow-premium">{status}</p>}
        <p className="mt-8 text-center text-sm text-muted">
          New here? <Link className="font-medium text-foreground transition-opacity hover:opacity-80" href="/signup">Create an account</Link>
        </p>
      </Card>
    </main>
  );
}