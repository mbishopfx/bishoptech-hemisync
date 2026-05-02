'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

export function SignupClient() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSignup(event) {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.displayName },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      setStatus('Account created. If email confirmation is enabled, confirm your email before logging in.');
      router.push('/dashboard');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="w-full max-w-xl p-8">
        <div className="mb-8">
          <p className="section-label">Create Profile</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Start building shareable tones</h1>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Your account stores generated sessions, public tone cards, profile links, and feed activity.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Display name
            <Input value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} required />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Email
            <Input value={form.email} onChange={(event) => updateField('email', event.target.value)} type="email" required />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/70">
            Password
            <Input value={form.password} onChange={(event) => updateField('password', event.target.value)} type="password" minLength={8} required />
          </label>
          <Button disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
        </form>

        {status && <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/72">{status}</p>}
        <p className="mt-6 text-sm text-white/54">
          Already have an account? <Link className="text-white" href="/login">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
