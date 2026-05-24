'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Zap, Shield, Cpu, Info, DollarSign, X } from 'lucide-react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';

const plans = [
  {
    name: 'Free Trial',
    id: 'free',
    price: '$0',
    priceId: 'free',
    description: 'Explore foundational binaural dynamics and synchronization.',
    features: [
      { text: 'Generate up to 5 tones per month', allowed: true },
      { text: 'Access to full soundwave library', allowed: true },
      { text: 'Cannot export master WAV/MP3 files', allowed: false },
      { text: 'Cannot broadcast to global feed', allowed: false },
      { text: 'Cannot listen to collective feeds', allowed: false }
    ],
    highlight: false,
    cta: 'Access Free Console',
    mode: 'free'
  },
  {
    name: 'Premium Console',
    id: 'premium',
    price: '$9',
    priceId: 'price_1TWlb7DJtpuPVfuFfSVEXPYU',
    description: 'Complete auditory synchronization and master broadcasting.',
    features: [
      { text: 'Unlimited AI Tone Generation', allowed: true },
      { text: 'High-Fidelity WAV/MP3 Master Exports', allowed: true },
      { text: 'Broadcast to Collective Waves Feed', allowed: true },
      { text: 'Access Public Collective Waves Stream', allowed: true },
      { text: 'Advanced Bio-Acoustic Metrics', allowed: true },
      { text: '7-Day Full Access Trial Included', allowed: true }
    ],
    highlight: true,
    cta: 'Ascend to Premium',
    mode: 'subscription'
  },
  {
    name: 'Lifetime Access',
    id: 'lifetime',
    price: '$50',
    priceId: 'price_lifetime_one_time',
    description: 'Permanent founding license with zero recurring costs.',
    features: [
      { text: 'All Premium Console privileges permanently', allowed: true },
      { text: 'Never pay recurring monthly fees', allowed: true },
      { text: 'Exclusive Founding Member Badge', allowed: true },
      { text: 'Priority Agent Cognition & Core Nodes', allowed: true },
      { text: 'Lifetime System updates & nodes', allowed: true }
    ],
    highlight: false,
    cta: 'Secure Lifetime License',
    mode: 'payment'
  }
];

const tonePack = {
  name: 'Tone Pack 01',
  id: 'tone-pack-01',
  price: 'TBD',
  priceId: 'price_tone_pack_pending',
  mode: 'payment',
  description: 'A one-time 16-tone pack built from the first HemiSync sample collection.',
  features: [
    '16 Generated HemiSync-style preview tones',
    'One-time purchase on Stripe',
    'Includes the first launch pack',
    'Public MP3 downloads'
  ],
  highlight: false,
  cta: 'Pack Coming Soon',
  disabled: true
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <PublicHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mb-20">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em]">Subscription Nodes</p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tighter text-white"
          >
            Upgrade your <span className="text-white/20 italic">frequency.</span>
          </motion.h1>
          <p className="text-white/40 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Choose the synchronization tier that aligns with your cognitive goals. All paid plans include a 7-day trial.
          </p>
        </div>

        {/* 3-Column Plan Grid */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-24">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative p-10 rounded-[3rem] border transition-all duration-500 group flex flex-col justify-between
                ${plan.highlight ? 'bg-white/5 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest">
                  Most Calibrated
                </div>
              )}

              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-white/30 text-sm">
                      {plan.id === 'lifetime' ? ' /one-time' : plan.id === 'free' ? '' : '/month'}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm mt-4 leading-relaxed min-h-[40px]">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <div key={j} className={`flex items-start gap-3 text-sm ${feature.allowed ? 'text-white/70' : 'text-white/25 line-through'}`}>
                      <div className={`size-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${!feature.allowed 
                          ? 'bg-red-500/10 text-red-400/50' 
                          : plan.highlight 
                            ? 'bg-cyan-500/10 text-cyan-400' 
                            : 'bg-white/5 text-white/30'
                        }
                      `}>
                        {feature.allowed ? <Check className="size-3" /> : <X className="size-3" />}
                      </div>
                      <span className="leading-tight">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('supabase-auth-token');
                    
                    if (plan.id === 'free') {
                      if (token) {
                        window.location.href = '/dashboard';
                      } else {
                        window.location.href = '/signup?plan=free';
                      }
                      return;
                    }

                    if (!token) {
                      window.location.href = `/signup?plan=${plan.id}&priceId=${plan.priceId}`;
                      return;
                    }

                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${JSON.parse(token).access_token}`
                      },
                      body: JSON.stringify({ 
                        priceId: plan.priceId, 
                        planId: plan.id, 
                        mode: plan.mode 
                      })
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch (err) {
                    console.error('Checkout redirect failed', err);
                    window.location.href = `/signup?plan=${plan.id}&priceId=${plan.priceId}`;
                  }
                }}
                className={`
                  w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-auto
                  ${plan.highlight ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
                `}
              >
                {plan.cta} <ChevronRight className="size-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Muted Tone Pack details */}
        <section className="mt-20 w-full max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Alternative Node</p>
              <h2 className="text-3xl font-light tracking-tight mt-2">HemiSync Sample Pack Seeding</h2>
            </div>
            <p className="max-w-xl text-left md:text-right text-sm text-white/40 font-light leading-relaxed">
              We&apos;ll activate Stripe checkout one-time packs on the dashboard once cataloging is locked. For now, the pack card acts as a system placeholder.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-10 rounded-[3rem] border bg-zinc-900/50 border-white/5"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                One-time pack
              </div>

              <div className="mb-8 text-left">
                <h3 className="text-2xl font-medium mb-2">{tonePack.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">{tonePack.price}</span>
                  <span className="text-white/30 text-sm">/one time</span>
                </div>
                <p className="text-white/40 text-sm mt-4 leading-relaxed">{tonePack.description}</p>
              </div>

              <div className="space-y-4 mb-10">
                {tonePack.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <div className="size-5 rounded-full flex items-center justify-center bg-white/5 text-white/30">
                      <Check className="size-3" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                disabled
                type="button"
                className="w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
              >
                {tonePack.cta} <ChevronRight className="size-4" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Stats segment */}
        <section className="mt-32 w-full max-w-4xl text-center">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-12">System Architecture</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Latency', value: '< 150ms' },
              { label: 'Uptime', value: '99.99%' },
              { label: 'Frequencies', value: '100+' },
              { label: 'Encryption', value: 'AES-256' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-white/20 text-[10px] uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-medium tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/50 mt-20">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            <span>Secured by Stripe</span>
            <span>7-Day Trial Refund policy</span>
          </div>
          <div className="flex gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>&copy; 2026 HemiSync.sys</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
