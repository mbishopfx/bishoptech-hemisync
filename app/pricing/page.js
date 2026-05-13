'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Zap, Shield, Cpu, Info, DollarSign } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    id: 'starter',
    price: '$9',
    priceId: 'price_1TWlb7DJtpuPVfuFfSVEXPYU',
    description: 'Precision orchestration for individual growth.',
    features: [
      'Unlimited AI Tone Generation',
      'High-Quality Stereo Exports',
      'Personal Session Archive',
      '7-Day Full Access Trial',
      'Basic Neural Analytics'
    ],
    highlight: false,
    cta: 'Initialize Starter'
  },
  {
    name: 'Pro',
    id: 'pro',
    price: '$19',
    priceId: 'price_1TWlbTDJtpuPVfuFG5ejsTAG',
    description: 'Complete neural platform for advanced practitioners.',
    features: [
      'Everything in Starter',
      'Community Feed & Social Tools',
      'Public Profile & Sharing',
      'Advanced Bio-Acoustic Metrics',
      'Priority Agent Cognition',
      'Early Access to New Nodes'
    ],
    highlight: true,
    cta: 'Ascend to Pro'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-white flex items-center justify-center text-black font-bold group-hover:scale-110 transition-transform">H</div>
            <span className="text-xl font-bold tracking-tighter">HemiSync<span className="text-white/40">.sys</span></span>
          </Link>
          <nav className="flex items-center gap-8 text-sm font-medium text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 group"
            >
              Get Started <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-40 pb-20 px-6 relative z-10 flex flex-col items-center">
        <div className="text-center space-y-6 max-w-3xl mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-light tracking-tighter text-white"
          >
            Upgrade your <span className="text-white/20 italic">frequency.</span>
          </motion.h1>
          <p className="text-white/40 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Choose the tier that aligns with your cognitive goals. All plans include a 7-day trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative p-10 rounded-[3rem] border transition-all duration-500 group
                ${plan.highlight ? 'bg-white/5 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)]' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest">
                  Most Advanced
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-medium mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                  <span className="text-white/30 text-sm">/month</span>
                </div>
                <p className="text-white/40 text-sm mt-4 leading-relaxed">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-white/70">
                    <div className={`size-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/30'}`}>
                      <Check className="size-3" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href={`/signup?plan=${plan.id}&priceId=${plan.priceId}`}
                className={`
                  w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                  ${plan.highlight ? 'bg-white text-black hover:bg-zinc-200' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}
                `}
              >
                {plan.cta} <ChevronRight className="size-4" />
              </Link>
            </motion.div>
          ))}
        </div>

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
            <span>7-Day Refund Policy</span>
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
