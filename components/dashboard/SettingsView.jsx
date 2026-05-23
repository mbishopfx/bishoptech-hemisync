'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SettingsView({ profile, onUpdateProfile }) {
  const [visibility, setVisibility] = useState(profile?.profile_visibility || 'public');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveSettings = async (patch) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data?.error || 'Failed to update settings');
      }
      if (onUpdateProfile) {
        onUpdateProfile(data.profile);
      }
      setMessage('Configuration committed successfully.');
    } catch (err) {
      console.error('Settings save error:', err);
      setError(err.message || 'Settings sync failure');
    } finally {
      setSaving(false);
    }
  };

  const handleResetOnboarding = () => {
    handleSaveSettings({ onboarding_complete: false });
    setMessage('Onboarding protocol reset. Welcome sequence will start on next reload.');
  };

  const handleVisibilityChange = (value) => {
    setVisibility(value);
    handleSaveSettings({ profile_visibility: value });
  };

  const isFreeTrial = !profile?.subscription_tier || profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free';

  const getTierIcon = () => {
    return isFreeTrial ? 'nature_people' : 'workspace_premium';
  };

  return (
    <div className="space-y-8">
      {/* Privacy settings */}
      <Card className="bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/20 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Security protocol</p>
            <h3 className="text-xl font-light text-white mt-1">Profile Privacy Node</h3>
          </div>
          <span className="material-symbols-outlined text-cyan-500 text-2xl">lock</span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-white/55 leading-relaxed">
            Control who can discover your broadcast timeline, view your saved binaural frequency waves, and check your profile statistics in the global explorer.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            {[
              { id: 'public', label: 'Public Broadcast', desc: 'Visible to everyone on the internet' },
              { id: 'members', label: 'Members Only', desc: 'Only registered platform users' },
              { id: 'private', label: 'Isolated Archive', desc: 'Only visible to your own console' }
            ].map((option) => {
              const active = visibility === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVisibilityChange(option.id)}
                  disabled={saving}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    active 
                      ? 'border-cyan-500 bg-cyan-500/[0.03] text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'border-white/5 bg-white/[0.02] text-white/40 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold">{option.label}</span>
                    {active && <span className="material-symbols-outlined text-cyan-400 text-sm">check_circle</span>}
                  </div>
                  <span className="text-[10px] text-white/35 mt-4 leading-normal font-light">{option.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Neural Entitlements - Plan Details */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[100px] bg-cyan-500/[0.02] blur-[40px] pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-400 text-2xl">license</span>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">Neural Entitlement Details</p>
            </div>
            
            <h3 className="text-2xl font-light text-white">Active Core Allocation</h3>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
                <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <span className="material-symbols-outlined">{getTierIcon()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white capitalize">{isFreeTrial ? 'Free Trial' : 'Paid Plan'}</span>
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 font-mono text-[9px] text-cyan-400 uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    {isFreeTrial 
                      ? 'Trial allocation. Play all Serenity catalog frequencies, master and export binaural parameters in the Workshop, and archive up to 5 custom sync waves in your neural library. Upgrade to Paid to unlock unlimited library saves, clone community waves, and broadcast on the global feed.'
                      : 'Premium active allocation. Enjoy unlimited custom synthesis renders, full Master audio export specs, and as many neural archive library saves as you need. Clone community waves to your personal archive and broadcast your mental reflections on the global Feed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wider uppercase px-6">
              Synthesize Allocation Upgrade
            </Button>
          </div>
        </Card>

        {/* System Settings & Onboarding Controls */}
        <Card className="md:col-span-4 bg-zinc-900/40 border border-white/5 backdrop-blur-3xl p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[80px] bg-purple-500/[0.02] blur-[30px] pointer-events-none" />
          
          <div className="space-y-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-purple-400">Cognitive Setup</p>
            <h4 className="text-lg font-semibold text-white">System Protocols</h4>
            
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 text-xs">
                <span className="text-white/40">Restore Console Tutorial</span>
                <p className="text-[10px] text-white/30 leading-normal font-light">Re-initialize the onboarding dialogue overlay next time you navigate to the main dashboard.</p>
                <Button 
                  onClick={handleResetOnboarding}
                  disabled={saving}
                  className="w-full mt-1 rounded-full border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500 hover:text-black font-mono text-[9px] uppercase tracking-widest text-purple-300 py-1.5 transition-all"
                >
                  Reset Onboarding Sequence
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 text-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">Operational core</span>
          </div>
        </Card>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}
    </div>
  );
}
