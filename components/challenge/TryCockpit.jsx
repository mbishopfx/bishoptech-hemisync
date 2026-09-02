'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CircleNotch, ShieldCheck, Target } from '@phosphor-icons/react';
import { ToneMachineDemo } from '@/components/machine/ToneMachineDemo';
import { SessionScoreConductor } from '@/components/machine/SessionScoreConductor';

const DEFAULT_INTENTION = 'I need a focused writing block';

const stepCopy = [
  ['01', 'Name the moment', 'Give the public agent a short intention.'],
  ['02', 'Compare directions', 'See the practical tradeoffs before choosing.'],
  ['03', 'Stage the ritual', 'Build arrive, practice, and close.'],
  ['04', 'Co-compose the signal', 'Shape every stage frequency plus binaural, monaural, isochronic, breath, and fade controls.'],
  ['05', 'Preview with consent', 'The browser stays quiet until you explicitly confirm it.']
];

function errorMessage(data, fallback) {
  return data?.error || data?.message || fallback;
}

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(data, 'That public capability is unavailable right now.'));
  return data;
}

export function TryCockpit() {
  const [intention, setIntention] = useState(DEFAULT_INTENTION);
  const [guidance, setGuidance] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [plan, setPlan] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [safetyRedirect, setSafetyRedirect] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentChallenge, setPaymentChallenge] = useState(null);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/machine-payments/session', { cache: 'no-store' })
      .then(async (response) => ({ response, data: await response.json().catch(() => ({})) }))
      .then(({ response, data }) => {
        if (!active) return;
        setPaymentInfo(response.ok ? data : { ok: false, code: data.code || 'UNAVAILABLE', error: errorMessage(data, 'Payment lane unavailable.') });
      })
      .catch(() => {
        if (active) setPaymentInfo({ ok: false, error: 'Payment lane could not be reached.' });
      });
    return () => { active = false; };
  }, []);

  const clearDownstream = () => {
    setComparison(null);
    setPlan(null);
    setSelectedTone(null);
  };

  const applySafety = (candidate) => {
    if (candidate?.status !== 'safety_redirect') return false;
    clearDownstream();
    setSafetyRedirect(candidate);
    return true;
  };

  const handleClarify = async (event) => {
    event.preventDefault();
    const nextIntention = intention.trim();
    if (!nextIntention) return;
    setWorking('clarify');
    setError('');
    setSafetyRedirect(null);
    clearDownstream();
    try {
      const data = await postJson('/api/agent/intent-guidance', { intention: nextIntention });
      setGuidance(data.guidance || null);
      if (!applySafety(data.guidance)) {
        setSelectedTone(data.guidance?.suggestedTone || null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking('');
    }
  };

  const handleCompare = async () => {
    setWorking('compare');
    setError('');
    setSafetyRedirect(null);
    try {
      const data = await postJson('/api/agent/tone-compare', { intention: intention.trim(), limit: 3 });
      setComparison(data.comparison || null);
      if (!applySafety(data.comparison)) setSelectedTone(data.comparison?.recommendation || selectedTone);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking('');
    }
  };

  const handlePlan = async () => {
    setWorking('plan');
    setError('');
    setSafetyRedirect(null);
    try {
      const data = await postJson('/api/agent/session-plan', { intention: intention.trim(), durationMin: 20 });
      setPlan(data.plan || null);
      if (applySafety(data.plan)) setPlan(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking('');
    }
  };

  const handlePaymentChallenge = async () => {
    setWorking('payment');
    setPaymentChallenge(null);
    setError('');
    try {
      const response = await fetch('/api/machine-payments/session', {
        method: 'POST',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 402) {
        setPaymentChallenge({
          status: '402_payment_required',
          challengeId: data.challengeId || data.id || null,
          amount: '$0.50',
          headerPresent: Boolean(response.headers.get('WWW-Authenticate'))
        });
      } else if (!response.ok) {
        throw new Error(errorMessage(data, 'The live payment challenge could not be read.'));
      } else {
        setPaymentChallenge({ status: 'paid', headerPresent: false });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorking('');
    }
  };

  const chooseTone = (tone) => {
    setSelectedTone(tone);
    setSafetyRedirect(null);
  };

  return (
    <div data-testid="try-cockpit" className="try-cockpit space-y-8">
      <div className="try-step-rail grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stepCopy.map(([number, title, copy]) => (
          <div key={number} className="glass-step-card rounded-2xl p-4">
            <span className="glass-step-number" aria-hidden="true">{number}</span>
            <p className="mt-5 text-sm font-medium text-white">{title}</p>
            <p className="mt-2 text-xs leading-5 text-white/45">{copy}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.68fr_1.32fr]">
        <aside className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/10 p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">Judge path</p>
          <div className="glass-step-list mt-5 space-y-5">
            {stepCopy.map(([number, title, copy]) => (
              <div key={number} className="glass-step-item flex gap-3">
                <span className="glass-step-number shrink-0" aria-hidden="true">{number}</span>
                <div>
                  <p className="text-sm text-white/80">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/35">{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 border-t border-[#b6ddcc]/10 pt-5 text-xs leading-5 text-white/40">
            <p className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#b6ddcc]" aria-hidden="true" /> Public tools are free, bounded, and audio-free until you choose to preview.</p>
            <Link href="/agent-instructions.md" className="mt-4 inline-flex items-center gap-2 text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4">Read the agent guide <ArrowRight className="size-3" aria-hidden="true" /></Link>
          </div>
        </aside>

        <div className="space-y-5">
          <form data-testid="try-step-intention" data-agent-action="clarify-intention" toolname="cognistration_clarify_intention" tooldescription="Turn the listener's short intention into bounded Cognistration listening directions without starting audio." onSubmit={handleClarify} className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">01 · Intent clarifier</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">What does the next moment need?</h2>
              </div>
              <Target className="size-6 text-[#b6ddcc]/60" weight="duotone" aria-hidden="true" />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={intention}
                onChange={(event) => setIntention(event.target.value)}
                maxLength={240}
                name="intention"
                autoComplete="off"
                aria-label="Intention for the Cognistration challenge"
                className="glass-input min-w-0 flex-1 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button type="submit" disabled={working !== '' || !intention.trim()} className="glass-action glass-action--primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium">
                {working === 'clarify' && <CircleNotch className="size-4 animate-spin" aria-hidden="true" />}
                Clarify direction
              </button>
            </div>
            {guidance && !safetyRedirect && (
              <div className="glass-subpanel mt-5 rounded-xl border border-[#b6ddcc]/15 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#b6ddcc]">{guidance.status === 'needs_input' ? 'Choose a direction' : 'Starting direction'}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{guidance.nextAction}</p>
                {guidance.choices?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{guidance.choices.map((choice) => <button key={choice.id} type="button" onClick={() => { setIntention(choice.example); setGuidance(null); clearDownstream(); }} className="glass-action glass-action--secondary rounded-full px-3 py-2 text-xs">Use {choice.label.toLowerCase()}</button>)}</div>}
              </div>
            )}
          </form>

          <section data-testid="try-step-comparison" className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">02 · Comparison</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">See the tradeoffs</h2>
              </div>
              <button type="button" onClick={handleCompare} disabled={working !== '' || !intention.trim()} className="glass-action glass-action--secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm">
                {working === 'compare' && <CircleNotch className="size-4 animate-spin" aria-hidden="true" />}
                Compare directions
              </button>
            </div>
            {comparison?.options?.length > 0 && !safetyRedirect && (
              <div className="mt-5 grid gap-3 md:grid-cols-3">{comparison.options.map((option) => (
                <button key={option.tone.id} type="button" onClick={() => chooseTone(option.tone)} className={`glass-choice rounded-xl p-4 text-left text-white/70 ${selectedTone?.id === option.tone.id ? 'is-selected text-white' : ''}`}>
                  <span className="font-mono text-[10px] text-[#b6ddcc]/70">0{option.rank}</span>
                  <p className="mt-3 text-sm font-medium text-white">{option.tone.name}</p>
                  <p className="mt-2 text-xs leading-5 text-white/45">{option.direction}</p>
                  <p className="mt-3 text-xs leading-5 text-white/65">Best for: {option.bestFor}</p>
                  <p className="mt-2 text-xs leading-5 text-white/35">Tradeoff: {option.tradeoff}</p>
                </button>
              ))}</div>
            )}
            {!comparison && <p className="mt-5 text-sm leading-6 text-white/40">The comparison stays inside the approved public tone catalog.</p>}
          </section>

          <section data-testid="try-step-plan" className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">03 · Ritual conductor</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">Stage a three-act session</h2>
              </div>
              <button type="button" onClick={handlePlan} disabled={working !== '' || !intention.trim()} className="glass-action glass-action--secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm">
                {working === 'plan' && <CircleNotch className="size-4 animate-spin" aria-hidden="true" />}
                Build the ritual
              </button>
            </div>
            {plan && !safetyRedirect && <div className="mt-5 grid gap-3 md:grid-cols-3">{plan.phases.map((phase) => <div key={phase.id} className="glass-subpanel rounded-xl border border-[#b6ddcc]/10 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#b6ddcc]/70">{phase.id}</p><p className="mt-3 text-sm font-medium text-white">{phase.label}</p><p className="mt-2 text-xs leading-5 text-white/45">{phase.instruction}</p><p className="mt-3 text-xs text-white/30">{Math.round(phase.durationSec / 60)} min · {phase.controls.targetState}</p></div>)}</div>}
            {!plan && <p className="mt-5 text-sm leading-6 text-white/40">Each phase has its own bounded controls and a manual transition.</p>}
          </section>

          {safetyRedirect && (
            <section data-testid="try-safety-redirect" className="glass-subpanel rounded-[1.75rem] border border-[#e0b493]/20 bg-[#e0b493]/[0.06] p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-100/75">Safety-aware routing</p>
              <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">{safetyRedirect.safety?.title || 'Pause before continuing'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{safetyRedirect.safety?.message}</p>
              <Link href="/health-warning" className="glass-action glass-action--warning mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium">Open health and safety page <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </section>
          )}

          {error && <p className="rounded-xl border border-red-200/15 bg-red-200/[0.06] px-4 py-3 text-sm text-red-100/75" role="alert">{error}</p>}
        </div>
      </div>

      {!safetyRedirect && <SessionScoreConductor intention={intention} />}

      <section data-testid="try-step-machine" className="glass-panel rounded-[2rem] border border-[#b6ddcc]/10 p-3 sm:p-5 lg:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 px-2 sm:px-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">05 · Machine widget</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">Make the direction visible</h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-white/40">{selectedTone ? `${selectedTone.name} is staged. Start preview is still a human click.` : 'Choose a direction above to seed the machine.'}</p>
        </div>
        <ToneMachineDemo agentTone={selectedTone} showWebMcpStatus ritualPlan={plan} />
      </section>

      <section data-testid="try-step-payment" className="glass-subpanel rounded-[1.75rem] border border-[#b6ddcc]/15 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#b6ddcc]/70">06 · Optional payment lane</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">Agent-to-agent machine access</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">The live route is fixed at $0.50 for one bounded machine session. This cockpit reads the real 402 challenge without submitting a charge.</p>
          </div>
          <div className="shrink-0">
            <button type="button" onClick={handlePaymentChallenge} disabled={working !== 'payment' && paymentInfo?.ok === false} className="glass-action glass-action--primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm">
              {working === 'payment' && <CircleNotch className="size-4 animate-spin" aria-hidden="true" />}
              Show live 402 challenge
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/45">
          <span className="glass-pill rounded-full px-3 py-2">{paymentInfo?.ok ? 'Route enabled' : paymentInfo ? 'Route needs attention' : 'Checking route'}</span>
          <span className="glass-pill rounded-full px-3 py-2">$0.50 · USD</span>
          <span className="glass-pill rounded-full px-3 py-2">No card credentials in the browser</span>
        </div>
        {paymentChallenge && <div className="mt-5 rounded-xl border border-[#b6ddcc]/20 bg-[#0d1714]/55 p-4"><p className="flex items-center gap-2 text-sm text-[#d7eadf]"><Check className="size-4" weight="bold" aria-hidden="true" /> {paymentChallenge.status === '402_payment_required' ? 'Live 402 challenge received' : 'Payment route returned a paid resource'}</p><p className="mt-2 text-xs leading-5 text-white/45">{paymentChallenge.status === '402_payment_required' ? 'The compatible agent can now pay and retry with its provider credential. No charge was submitted by this page.' : 'This page did not submit a payment credential.'} {paymentChallenge.headerPresent ? 'WWW-Authenticate challenge header present.' : ''}</p></div>}
      </section>
    </div>
  );
}
