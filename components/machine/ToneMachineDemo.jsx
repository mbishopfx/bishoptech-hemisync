'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lightning, Power, Pulse } from '@phosphor-icons/react';
import { nativeWebMcpTool, WEBMCP_TOOL_DEFINITIONS, WEBMCP_CONTRACT_ID, WEBMCP_CONTRACT_VERSION } from '@/lib/agentic/webmcp-contract';
import { buildSessionRecipe, sessionRecipeInputFromControls } from '@/lib/agentic/recipe-capability';
import { SCIENCE_GUIDE_RESOURCE_URI } from '@/lib/agentic/science-content';
import { ToneScienceLesson } from '@/components/science/ToneScienceLesson';
import { RitualConductor } from './RitualConductor';

const DEFAULT_MAX_DURATION_SEC = 120;

const STATE_OPTIONS = [
  { id: 'delta', label: 'Delta', hz: 3, range: '0.5 - 4 Hz · Deep rest' },
  { id: 'theta', label: 'Theta', hz: 6, range: '4 - 8 Hz · Dreamy space' },
  { id: 'alpha', label: 'Alpha', hz: 10, range: '8 - 14 Hz · Calm flow' },
  { id: 'beta', label: 'Beta', hz: 18, range: '14 - 30 Hz · Active focus' },
  { id: 'gamma', label: 'Gamma', hz: 39.5, range: '30 - 50 Hz · Creative synthesis' }
];

const STATE_VISUALS = {
  delta: {
    accent: 'text-slate-200',
    border: 'border-slate-200/25',
    shadow: 'shadow-[0_0_50px_rgba(226,232,240,0.08)]',
    wave: 'bg-slate-200',
    glow: 'bg-slate-200 shadow-[0_0_8px_rgba(226,232,240,0.45)]'
  },
  theta: {
    accent: 'text-stone-200',
    border: 'border-stone-200/25',
    shadow: 'shadow-[0_0_50px_rgba(231,229,228,0.08)]',
    wave: 'bg-stone-200',
    glow: 'bg-stone-200 shadow-[0_0_8px_rgba(231,229,228,0.45)]'
  },
  alpha: {
    accent: 'text-[#b6ddcc]',
    border: 'border-[#b6ddcc]/30',
    shadow: 'shadow-[0_0_50px_rgba(182,221,204,0.12)]',
    wave: 'bg-[#b6ddcc]',
    glow: 'bg-[#b6ddcc] shadow-[0_0_8px_rgba(182,221,204,0.55)]'
  },
  beta: {
    accent: 'text-[#e0b493]',
    border: 'border-[#e0b493]/30',
    shadow: 'shadow-[0_0_50px_rgba(224,180,147,0.1)]',
    wave: 'bg-[#e0b493]',
    glow: 'bg-[#e0b493] shadow-[0_0_8px_rgba(224,180,147,0.45)]'
  },
  gamma: {
    accent: 'text-[#d7c7aa]',
    border: 'border-[#d7c7aa]/30',
    shadow: 'shadow-[0_0_50px_rgba(215,199,170,0.1)]',
    wave: 'bg-[#d7c7aa]',
    glow: 'bg-[#d7c7aa] shadow-[0_0_8px_rgba(215,199,170,0.45)]'
  }
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function browserCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `browser-${Date.now()}`;
}

export function ToneMachineDemo({ agentTone = null, showWebMcpStatus = false, workshopAccess = null, ritualPlan: initialRitualPlan = null }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(200);
  const [targetState, setTargetState] = useState('theta');
  const [beatFreq, setBeatFreq] = useState(6);
  const [volume, setVolume] = useState(80);
  const [time, setTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [webmcpStatus, setWebmcpStatus] = useState('checking');
  const [agentActivity, setAgentActivity] = useState('');
  const [packPreview, setPackPreview] = useState(null);
  const [ritualPlan, setRitualPlan] = useState(initialRitualPlan?.phases?.length ? initialRitualPlan : null);
  const [ritualPhase, setRitualPhase] = useState(initialRitualPlan?.phases?.[0]?.id || null);
  const [recipeMessage, setRecipeMessage] = useState('');
  const [scienceGuideOpen, setScienceGuideOpen] = useState(false);
  const maxDurationSec = workshopAccess?.valid ? 60 * 60 : DEFAULT_MAX_DURATION_SEC;
  const isWorkshopAccess = Boolean(workshopAccess?.valid);

  const audioCtxRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);
  const masterGainRef = useRef(null);
  const packAudioRef = useRef(null);
  const startAudioRef = useRef(null);
  const sessionStateRef = useRef(null);
  const toolHandlersRef = useRef({});
  const visual = STATE_VISUALS[targetState] || STATE_VISUALS.theta;

  const stopAudioNodes = useCallback(() => {
    if (leftOscRef.current) {
      try { leftOscRef.current.stop(); } catch {}
      try { leftOscRef.current.disconnect(); } catch {}
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      try { rightOscRef.current.stop(); } catch {}
      try { rightOscRef.current.disconnect(); } catch {}
      rightOscRef.current = null;
    }
    if (masterGainRef.current) {
      try { masterGainRef.current.disconnect(); } catch {}
      masterGainRef.current = null;
    }
  }, []);

  const stopPackAudio = useCallback(() => {
    const audio = packAudioRef.current;
    if (audio) {
      try { audio.pause(); } catch {}
      try { audio.currentTime = 0; } catch {}
      packAudioRef.current = null;
    }
    setPackPreview(null);
  }, []);

  const stopAudio = useCallback(() => {
    stopPackAudio();
    if (audioCtxRef.current && masterGainRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      try {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.15);
      } catch {}
    }

    window.setTimeout(() => {
      stopAudioNodes();
      setIsPlaying(false);
    }, 200);
  }, [stopAudioNodes, stopPackAudio]);

  const startAudio = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        window.alert('Web Audio API is not supported in this browser.');
        return false;
      }

      const ctx = audioCtxRef.current || new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') ctx.resume();
      stopPackAudio();
      stopAudioNodes();

      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(carrierFreq, ctx.currentTime);
      rightOsc.frequency.setValueAtTime(carrierFreq + beatFreq, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(volume / 100, ctx.currentTime + 0.15);
      merger.connect(masterGain);
      masterGain.connect(ctx.destination);

      leftOsc.start();
      rightOsc.start();
      leftOscRef.current = leftOsc;
      rightOscRef.current = rightOsc;
      masterGainRef.current = masterGain;
      setIsPlaying(true);
      return true;
    } catch (error) {
      console.error('Failed to start demonstration synthesizer:', error);
      return false;
    }
  }, [beatFreq, carrierFreq, stopAudioNodes, stopPackAudio, volume]);

  const togglePower = useCallback(() => {
    if (isPlaying) stopAudio();
    else {
      if (packPreview) stopPackAudio();
      startAudio();
    }
  }, [isPlaying, packPreview, startAudio, stopAudio, stopPackAudio]);

  const handleStateSelect = useCallback((state, hz) => {
    setTargetState(state);
    setBeatFreq(hz);
  }, []);

  const applyToneSettings = useCallback((settings = {}) => {
    const stateOption = STATE_OPTIONS.find((state) => state.id === (settings.targetState || settings.state));
    const currentControls = sessionStateRef.current || {};
    const nextState = stateOption ? stateOption.id : currentControls.targetState || 'theta';
    const nextCarrier = Number.isFinite(Number(settings.carrierHz ?? settings.baseFreqHz))
      ? Math.round(clamp(Number(settings.carrierHz ?? settings.baseFreqHz), 100, 400))
      : currentControls.carrierHz ?? 200;
    const nextBeat = Number.isFinite(Number(settings.beatHz ?? settings.targetHz))
      ? Math.round(clamp(Number(settings.beatHz ?? settings.targetHz), 0.5, 40) * 2) / 2
      : stateOption
        ? stateOption.hz
        : currentControls.beatHz ?? 6;
    const nextVolume = Number.isFinite(Number(settings.volume))
      ? Math.round(clamp(Number(settings.volume), 0, 100))
      : currentControls.volume ?? 80;

    setTargetState(nextState);
    setCarrierFreq(nextCarrier);
    setBeatFreq(nextBeat);
    setVolume(nextVolume);

    return {
      targetState: nextState,
      carrierHz: nextCarrier,
      beatHz: nextBeat,
      volume: nextVolume
    };
  }, []);

  const getSessionState = useCallback(() => ({
    capabilityId: WEBMCP_CONTRACT_ID,
    version: WEBMCP_CONTRACT_VERSION,
    correlationId: browserCorrelationId(),
    status: 'completed',
    state: sessionStateRef.current
  }), []);

  const generateToneForAgent = useCallback(async (input = {}) => {
    const intention = typeof input.intention === 'string' ? input.intention.trim() : '';
    if (!intention || intention.length > 240) {
      return {
        capabilityId: WEBMCP_CONTRACT_ID,
        version: WEBMCP_CONTRACT_VERSION,
        correlationId: browserCorrelationId(),
        status: 'needs_input',
        error: { code: 'INVALID_INTENTION', safeMessage: 'Provide a short intention of 1 to 240 characters.', retryable: false }
      };
    }

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intention })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAgentActivity(data.message || data.error || 'The public preview is not available right now.');
        return {
          capabilityId: data.capabilityId || WEBMCP_CONTRACT_ID,
          version: data.version || WEBMCP_CONTRACT_VERSION,
          correlationId: data.correlationId || browserCorrelationId(),
          status: data.code === 'AUTH_REQUIRED' || data.code === 'SUBSCRIPTION_REQUIRED' ? 'needs_input' : 'failed',
          error: {
            code: data.code || 'TONE_GENERATION_FAILED',
            safeMessage: data.error || 'The public preview is not available right now.',
            retryable: response.status >= 500
          },
          nextAction: data.code === 'AUTH_REQUIRED' ? '/signup?source=webmcp' : null
        };
      }

      if (data.status === 'safety_redirect') {
        setAgentActivity(data.safety?.message || 'Please review the Cognistration health and safety page before continuing.');
        return agentResult('safety_redirect', {
          safety: data.safety,
          nextAction: data.nextAction,
          boundaries: data.boundaries
        });
      }

      const applied = applyToneSettings(data.track || {});
      setAgentActivity(`Your session is set to ${applied.targetState} with ${data.track?.name || 'a public tone'}.`);
      return {
        capabilityId: data.capabilityId || WEBMCP_CONTRACT_ID,
        version: data.version || WEBMCP_CONTRACT_VERSION,
        correlationId: data.correlationId || browserCorrelationId(),
        status: 'completed',
        tone: data.track,
        controls: applied,
        message: data.agentMessage,
        matchMode: data.matchMode || 'deterministic'
      };
    } catch {
      setAgentActivity('The library matcher could not connect. The local controls are still available.');
      return {
        capabilityId: WEBMCP_CONTRACT_ID,
        version: WEBMCP_CONTRACT_VERSION,
        correlationId: browserCorrelationId(),
        status: 'failed',
        error: { code: 'NETWORK_ERROR', safeMessage: 'The library matcher could not connect.', retryable: true }
      };
    }
  }, [applyToneSettings]);

  const agentResult = useCallback((status, extra = {}) => ({
    capabilityId: WEBMCP_CONTRACT_ID,
    version: WEBMCP_CONTRACT_VERSION,
    correlationId: browserCorrelationId(),
    status,
    ...extra
  }), []);

  const fetchAgentCapability = useCallback(async (path, body) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'The public session capability is unavailable.');
      error.code = data.code || 'CAPABILITY_UNAVAILABLE';
      error.retryable = Boolean(data.retryable || response.status >= 500);
      throw error;
    }
    return data;
  }, []);

  const clarifyIntentionForAgent = useCallback(async (input = {}) => {
    const intention = typeof input.intention === 'string' ? input.intention.trim() : '';
    if (!intention || intention.length > 240) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_INTENTION', safeMessage: 'Provide a short intention of 1 to 240 characters.', retryable: false }
      });
    }

    try {
      const data = await fetchAgentCapability('/api/agent/intent-guidance', { intention });
      return agentResult(data.guidance?.status === 'safety_redirect' ? 'safety_redirect' : 'completed', { guidance: data.guidance });
    } catch (error) {
      return agentResult('failed', {
        error: { code: error.code || 'INTENT_GUIDANCE_UNAVAILABLE', safeMessage: 'The direction helper could not be reached. Try one of the visible state controls.', retryable: Boolean(error.retryable) }
      });
    }
  }, [agentResult, fetchAgentCapability]);

  const calibrateToneForAgent = useCallback(async (input = {}) => {
    const feedback = input.feedback;
    const feedbackOptions = new Set(['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right']);
    const allowedStates = new Set(STATE_OPTIONS.map((option) => option.id));
    const current = sessionStateRef.current || {};
    const targetState = input.targetState ?? current.targetState ?? 'theta';
    const carrierHz = Number(input.carrierHz ?? current.carrierHz ?? 200);
    const beatHz = Number(input.beatHz ?? current.beatHz ?? 6);
    const nextVolume = Number(input.volume ?? current.volume ?? 80);
    if (!feedbackOptions.has(feedback) || !allowedStates.has(targetState) || !Number.isInteger(carrierHz) || carrierHz < 100 || carrierHz > 400 || !Number.isFinite(beatHz) || beatHz < 0.5 || beatHz > 40 || !Number.isInteger(nextVolume) || nextVolume < 0 || nextVolume > 100) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_TONE_CALIBRATION', safeMessage: 'Choose a published feedback option and keep the visible controls within their published bounds.', retryable: false }
      });
    }

    try {
      const data = await fetchAgentCapability('/api/agent/tone-calibrate', {
        feedback,
        targetState,
        carrierHz,
        beatHz,
        volume: nextVolume
      });
      const controls = applyToneSettings(data.calibration?.controls || {});
      setAgentActivity(data.calibration?.message || 'The visible controls were calibrated from your feedback.');
      return agentResult('completed', { calibration: data.calibration, controls });
    } catch (error) {
      return agentResult('failed', {
        error: { code: error.code || 'TONE_CALIBRATION_UNAVAILABLE', safeMessage: 'The tone could not be calibrated. Try the visible sliders instead.', retryable: Boolean(error.retryable) }
      });
    }
  }, [agentResult, applyToneSettings, fetchAgentCapability]);

  const compareToneDirectionsForAgent = useCallback(async (input = {}) => {
    const intention = typeof input.intention === 'string' ? input.intention.trim() : '';
    const limit = input.limit === undefined ? 3 : Number(input.limit);
    if (!intention || intention.length > 240 || !Number.isInteger(limit) || limit < 2 || limit > 4) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_TONE_COMPARISON', safeMessage: 'Provide a short intention and a comparison limit from 2 to 4.', retryable: false }
      });
    }

    try {
      const data = await fetchAgentCapability('/api/agent/tone-compare', { intention, limit });
      return agentResult(data.comparison?.status === 'safety_redirect' ? 'safety_redirect' : 'completed', { comparison: data.comparison });
    } catch (error) {
      return agentResult('failed', {
        error: { code: error.code || 'TONE_COMPARISON_UNAVAILABLE', safeMessage: 'The tone comparison could not be reached. Try the visible controls instead.', retryable: Boolean(error.retryable) }
      });
    }
  }, [agentResult, fetchAgentCapability]);

  const planListeningSessionForAgent = useCallback(async (input = {}) => {
    const intention = typeof input.intention === 'string' ? input.intention.trim() : '';
    const durationMin = input.durationMin === undefined ? 20 : Number(input.durationMin);
    const allowedModes = new Set(['rest', 'reflect', 'focus', 'momentum', 'synthesis']);
    const allowedStates = new Set(STATE_OPTIONS.map((option) => option.id));
    if (!intention || intention.length > 240 || !Number.isInteger(durationMin) || durationMin < 5 || durationMin > 60 || (input.mode !== undefined && !allowedModes.has(input.mode)) || (input.targetState !== undefined && !allowedStates.has(input.targetState))) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_SESSION_PLAN', safeMessage: 'Provide a short intention, a duration from 5 to 60 minutes, and published mode or state values.', retryable: false }
      });
    }

    try {
      const data = await fetchAgentCapability('/api/agent/session-plan', {
        intention,
        durationMin,
        ...(input.mode ? { mode: input.mode } : {}),
        ...(input.targetState ? { targetState: input.targetState } : {})
      });
      return agentResult(data.plan?.status === 'safety_redirect' ? 'safety_redirect' : 'completed', { plan: data.plan });
    } catch (error) {
      return agentResult('failed', {
        error: { code: error.code || 'SESSION_PLAN_UNAVAILABLE', safeMessage: 'The session plan could not be reached. The visible machine is still ready to tune.', retryable: Boolean(error.retryable) }
      });
    }
  }, [agentResult, fetchAgentCapability]);

  const getSessionCueForAgent = useCallback(async (input = {}) => {
    const intention = typeof input.intention === 'string' ? input.intention.trim() : '';
    const allowedModes = new Set(['rest', 'reflect', 'focus', 'momentum', 'synthesis']);
    if (intention.length > 240 || (input.mode !== undefined && !allowedModes.has(input.mode))) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_SESSION_CUE', safeMessage: 'Use a short intention or one of the published session modes.', retryable: false }
      });
    }

    try {
      const data = await fetchAgentCapability('/api/agent/session-cue', {
        ...(intention ? { intention } : {}),
        ...(input.mode ? { mode: input.mode } : {})
      });
      return agentResult(data.cue?.status === 'safety_redirect' ? 'safety_redirect' : 'completed', { cue: data.cue });
    } catch (error) {
      return agentResult('failed', {
        error: { code: error.code || 'SESSION_CUE_UNAVAILABLE', safeMessage: 'The session cue could not be reached. Try a visible machine direction instead.', retryable: Boolean(error.retryable) }
      });
    }
  }, [agentResult, fetchAgentCapability]);

  const beginRitualForAgent = useCallback(async (input = {}) => {
    const result = await planListeningSessionForAgent(input);
    if (result.status !== 'completed' || !result.plan?.phases?.length) return result;

    const firstPhase = result.plan.phases[0];
    const controls = applyToneSettings(firstPhase.controls);
    setRitualPlan(result.plan);
    setRitualPhase(firstPhase.id);
    setAgentActivity(`Three-act ritual staged at ${firstPhase.label.toLowerCase()}. Audio remains off until you confirm a preview.`);
    return agentResult('completed', {
      plan: result.plan,
      activePhase: firstPhase.id,
      phase: firstPhase,
      controls,
      manualTransition: true
    });
  }, [agentResult, applyToneSettings, planListeningSessionForAgent]);

  const advanceRitualForAgent = useCallback((input = {}) => {
    const phaseId = input.phase;
    if (!['arrive', 'practice', 'close'].includes(phaseId)) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_RITUAL_PHASE', safeMessage: 'Choose arrive, practice, or close.', retryable: false }
      });
    }

    const phase = ritualPlan?.phases?.find((candidate) => candidate.id === phaseId);
    if (!phase) {
      return agentResult('needs_input', {
        error: { code: 'RITUAL_NOT_STARTED', safeMessage: 'Start a ritual before selecting a phase.', retryable: false }
      });
    }

    const controls = applyToneSettings(phase.controls);
    setRitualPhase(phaseId);
    setAgentActivity(`${phase.label} is staged with ${controls.targetState} controls. Audio remains off until you confirm a preview.`);
    return agentResult('completed', { activePhase: phaseId, phase, controls, manualTransition: true });
  }, [agentResult, applyToneSettings, ritualPlan]);

  const prepareSessionRecipeForAgent = useCallback((input = {}) => {
    try {
      const current = sessionStateRef.current || {};
      const recipe = buildSessionRecipe(sessionRecipeInputFromControls({
        targetState: input.targetState ?? current.targetState ?? 'theta',
        carrierHz: input.carrierHz ?? current.carrierHz ?? 200,
        beatHz: input.beatHz ?? current.beatHz ?? 6,
        volume: input.volume ?? current.volume ?? 72,
        durationSec: input.durationSec ?? 120,
        intentionLabel: input.intentionLabel ?? 'reflect'
      }));
      return recipe;
    } catch {
      return agentResult('needs_input', {
        error: { code: 'INVALID_SESSION_RECIPE', safeMessage: 'Use a published intention label and keep the recipe settings within their published bounds.', retryable: false }
      });
    }
  }, [agentResult]);

  const selectRitualPhase = useCallback((phaseId) => {
    const phase = ritualPlan?.phases?.find((candidate) => candidate.id === phaseId);
    if (!phase) return;
    const controls = applyToneSettings(phase.controls);
    setRitualPhase(phaseId);
    setAgentActivity(`${phase.label} is staged with ${controls.targetState} controls.`);
  }, [applyToneSettings, ritualPlan]);

  const buildLocalRecipe = useCallback(() => buildSessionRecipe(sessionRecipeInputFromControls({
    targetState,
    carrierHz: carrierFreq,
    beatHz: beatFreq,
    volume,
    durationSec: ritualPlan?.totalDurationSec || 120,
    intentionLabel: ({ delta: 'rest', theta: 'reflect', alpha: 'focus', beta: 'momentum', gamma: 'synthesis' })[targetState] || 'reflect'
  })), [beatFreq, carrierFreq, targetState, volume, ritualPlan]);

  const exportLocalRecipe = useCallback(() => {
    try {
      const recipe = buildLocalRecipe().recipe;
      const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'cognistration-session-recipe.json';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setRecipeMessage('Recipe exported. Only technical settings were included.');
    } catch {
      setRecipeMessage('The recipe could not be exported in this browser.');
    }
  }, [buildLocalRecipe]);

  const shareLocalRecipe = useCallback(async () => {
    try {
      const recipe = buildLocalRecipe().recipe;
      const text = JSON.stringify(recipe, null, 2);
      if (navigator.share) {
        await navigator.share({ title: 'Cognistration session recipe', text });
        setRecipeMessage('Recipe shared. Only technical settings were included.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setRecipeMessage('Recipe copied. Only technical settings were included.');
      } else {
        throw new Error('sharing unavailable');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') setRecipeMessage('Sharing is unavailable here; use Export JSON instead.');
    }
  }, [buildLocalRecipe]);

  const nudgeCarrierForAgent = useCallback((input = {}) => {
    const direction = input.direction;
    const stepHz = input.stepHz === undefined ? 24 : Number(input.stepHz);
    if (!['smaller', 'larger'].includes(direction) || !Number.isFinite(stepHz) || stepHz < 1 || stepHz > 50) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_CARRIER_NUDGE', safeMessage: 'Choose smaller or larger and use a step from 1 to 50 Hz.', retryable: false }
      });
    }

    const previousCarrierHz = Number(sessionStateRef.current?.carrierHz ?? carrierFreq);
    const requestedCarrierHz = direction === 'smaller' ? previousCarrierHz - stepHz : previousCarrierHz + stepHz;
    const nextCarrierHz = Math.round(clamp(requestedCarrierHz, 100, 400));
    const controls = applyToneSettings({ carrierHz: nextCarrierHz });
    setAgentActivity(`Carrier moved ${direction} to ${controls.carrierHz} Hz.`);
    return agentResult('completed', {
      adjustment: {
        direction,
        requestedStepHz: stepHz,
        previousCarrierHz,
        carrierHz: controls.carrierHz,
        clamped: requestedCarrierHz < 100 || requestedCarrierHz > 400
      },
      controls
    });
  }, [agentResult, applyToneSettings, carrierFreq]);

  const searchTonePacksForAgent = useCallback(async (input = {}) => {
    const query = typeof input.query === 'string' ? input.query.trim() : '';
    const state = input.state;
    const limit = input.limit === undefined ? 8 : Number(input.limit);
    const allowedStates = new Set(STATE_OPTIONS.map((option) => option.id));
    if (query.length > 240 || (state !== undefined && !allowedStates.has(state)) || !Number.isInteger(limit) || limit < 1 || limit > 8) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_PACK_SEARCH', safeMessage: 'Use a short query, a published state, and a result limit from 1 to 8.', retryable: false }
      });
    }

    try {
      const params = new URLSearchParams({ agent: '1', limit: String(limit) });
      if (query) params.set('query', query);
      if (state) params.set('state', state);
      const response = await fetch(`/api/packs?${params.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return agentResult('failed', {
          error: { code: data.code || 'PACK_SEARCH_FAILED', safeMessage: data.error || 'The public tone-pack catalog could not be loaded.', retryable: response.status >= 500 }
        });
      }
      return agentResult('completed', { packs: data.packs || [], source: data.source || 'agentic-public' });
    } catch {
      return agentResult('failed', {
        error: { code: 'NETWORK_ERROR', safeMessage: 'The public tone-pack catalog could not be reached.', retryable: true }
      });
    }
  }, [agentResult]);

  const previewTonePackForAgent = useCallback(async (input = {}) => {
    const packSlug = typeof input.packSlug === 'string' ? input.packSlug.trim() : '';
    const trackId = typeof input.trackId === 'string' ? input.trackId.trim() : '';
    if (!packSlug || packSlug.length > 120) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_PACK_SLUG', safeMessage: 'Provide a public tone-pack slug from the catalog.', retryable: false }
      });
    }
    if (input.confirmed !== true) {
      return agentResult('needs_input', {
        error: { code: 'CONFIRMATION_REQUIRED', safeMessage: 'Explicit confirmation is required before a tone-pack preview starts.', retryable: false }
      });
    }

    try {
      const response = await fetch(`/api/packs?agent=1&slug=${encodeURIComponent(packSlug)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.pack) {
        return agentResult('failed', {
          error: { code: data.code || 'NOT_FOUND', safeMessage: data.error || 'That public tone pack could not be found.', retryable: false }
        });
      }

      const pack = data.pack;
      const track = (pack.previewTracks || []).find((candidate) => !trackId || candidate.id === trackId) || null;
      if (!track?.previewUrl) {
        return agentResult('failed', {
          error: { code: 'PREVIEW_UNAVAILABLE', safeMessage: 'That tone pack does not have a playable public preview track.', retryable: false }
        });
      }

      stopAudio();
      const audio = new Audio(track.previewUrl);
      audio.preload = 'auto';
      audio.volume = clamp(volume / 100, 0, 1);
      packAudioRef.current = audio;
      audio.addEventListener('ended', () => {
        if (packAudioRef.current !== audio) return;
        packAudioRef.current = null;
        setPackPreview(null);
        setAgentActivity('Tone-pack preview finished.');
      }, { once: true });
      await audio.play();
      setPackPreview({ name: pack.name, trackName: track.name });
      setAgentActivity(`Previewing ${pack.name}: ${track.name}.`);
      return agentResult('completed', {
        audio: 'local-browser-tone-pack-preview',
        pack,
        track: { ...track, previewUrl: track.previewUrl }
      });
    } catch {
      packAudioRef.current = null;
      setPackPreview(null);
      return agentResult('failed', {
        error: { code: 'AUDIO_UNAVAILABLE', safeMessage: 'The browser could not start that local tone-pack preview. Try the preview button again after interacting with the page.', retryable: true }
      });
    }
  }, [agentResult, stopAudio, volume]);

  const getPolicyInfoForAgent = useCallback(async (input = {}) => {
    const topics = new Set(['safety', 'terms', 'privacy', 'cookies', 'ai', 'pricing', 'account']);
    if (!topics.has(input.topic)) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_POLICY_TOPIC', safeMessage: 'Choose safety, terms, privacy, cookies, ai, pricing, or account.', retryable: false }
      });
    }
    try {
      const response = await fetch(`/api/agent/policy?topic=${encodeURIComponent(input.topic)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return agentResult('failed', { error: { code: data.code || 'POLICY_LOOKUP_FAILED', safeMessage: data.error || 'The policy page could not be loaded.', retryable: response.status >= 500 } });
      return agentResult('completed', { policy: data.policy });
    } catch {
      return agentResult('failed', { error: { code: 'NETWORK_ERROR', safeMessage: 'The policy page could not be reached.', retryable: true } });
    }
  }, [agentResult]);

  const getAccountOptionsForAgent = useCallback(async () => {
    try {
      const response = await fetch('/api/agent/account');
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return agentResult('failed', { error: { code: 'ACCOUNT_OPTIONS_FAILED', safeMessage: 'Account options could not be loaded.', retryable: response.status >= 500 } });
      return agentResult('completed', { ...data });
    } catch {
      return agentResult('failed', { error: { code: 'NETWORK_ERROR', safeMessage: 'Account options could not be reached.', retryable: true } });
    }
  }, [agentResult]);

  const openScienceGuideForAgent = useCallback((input = {}) => {
    const allowedStates = new Set(STATE_OPTIONS.map((option) => option.id));
    const allowedLabels = new Set(['rest', 'reflect', 'focus', 'momentum', 'synthesis']);
    const allowedKeys = ['toneId', 'state', 'targetState', 'carrierHz', 'beatHz', 'volume', 'intentionLabel'];
    const hasUnknownKey = Object.keys(input).some((key) => !allowedKeys.includes(key));
    const invalidToneId = input.toneId !== undefined && (typeof input.toneId !== 'string' || input.toneId.trim().length === 0 || input.toneId.length > 120);
    const invalidState = input.state !== undefined && !allowedStates.has(input.state);
    const invalidTargetState = input.targetState !== undefined && !allowedStates.has(input.targetState);
    const carrierHz = input.carrierHz === undefined ? null : Number(input.carrierHz);
    const beatHz = input.beatHz === undefined ? null : Number(input.beatHz);
    const nextVolume = input.volume === undefined ? null : Number(input.volume);
    const invalidControls = (carrierHz !== null && (!Number.isInteger(carrierHz) || carrierHz < 100 || carrierHz > 400))
      || (beatHz !== null && (!Number.isFinite(beatHz) || beatHz < 0.5 || beatHz > 40))
      || (nextVolume !== null && (!Number.isInteger(nextVolume) || nextVolume < 0 || nextVolume > 100));
    const invalidLabel = input.intentionLabel !== undefined && !allowedLabels.has(input.intentionLabel);

    if (hasUnknownKey || invalidToneId || invalidState || invalidTargetState || invalidControls || invalidLabel) {
      return agentResult('needs_input', {
        error: { code: 'INVALID_SCIENCE_GUIDE_INPUT', safeMessage: 'Use the current machine direction or approved bounded controls to open the science guide.', retryable: false }
      });
    }

    setScienceGuideOpen(true);
    setAgentActivity('Science guide opened. Audio remains off.');
    window.setTimeout(() => document.getElementById('tone-science-guide')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    return agentResult('completed', {
      guide: {
        resourceUri: SCIENCE_GUIDE_RESOURCE_URI,
        status: 'ready',
        audioStarted: false,
        diaryContentIncluded: false
      },
      controls: sessionStateRef.current
    });
  }, [agentResult]);

  startAudioRef.current = startAudio;
  sessionStateRef.current = {
    isPlaying,
    targetState,
    carrierHz: carrierFreq,
    beatHz: beatFreq,
    volume,
    remainingPreviewSec: Math.max(0, maxDurationSec - sessionTime)
  };

  toolHandlersRef.current = {
    cognistration_get_session_state: async () => getSessionState(),
    cognistration_set_session_controls: async (input = {}) => {
      const allowedStates = new Set(STATE_OPTIONS.map((state) => state.id));
      const keys = ['targetState', 'carrierHz', 'beatHz', 'volume'];
      if (Object.keys(input).some((key) => !keys.includes(key))) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'failed', error: { code: 'INVALID_CONTROL', safeMessage: 'Only published tone controls can be changed.', retryable: false } };
      }
      if (input.targetState !== undefined && !allowedStates.has(input.targetState)) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'failed', error: { code: 'INVALID_STATE', safeMessage: 'Choose one of the published tone states.', retryable: false } };
      }
      if (input.carrierHz !== undefined && (!Number.isFinite(Number(input.carrierHz)) || Number(input.carrierHz) < 100 || Number(input.carrierHz) > 400)) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'failed', error: { code: 'INVALID_CARRIER', safeMessage: 'Carrier frequency must be between 100 and 400 Hz.', retryable: false } };
      }
      if (input.beatHz !== undefined && (!Number.isFinite(Number(input.beatHz)) || Number(input.beatHz) < 0.5 || Number(input.beatHz) > 40)) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'failed', error: { code: 'INVALID_BEAT', safeMessage: 'Beat frequency must be between 0.5 and 40 Hz.', retryable: false } };
      }
      if (input.volume !== undefined && (!Number.isFinite(Number(input.volume)) || Number(input.volume) < 0 || Number(input.volume) > 100)) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'failed', error: { code: 'INVALID_VOLUME', safeMessage: 'Volume must be between 0 and 100 percent.', retryable: false } };
      }
      const controls = applyToneSettings(input);
      setAgentActivity(`Session controls set to ${controls.targetState}, ${controls.carrierHz} Hz carrier, and ${controls.beatHz} Hz beat.`);
      return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'completed', controls };
    },
    cognistration_nudge_carrier: nudgeCarrierForAgent,
    cognistration_generate_tone: generateToneForAgent,
    cognistration_clarify_intention: clarifyIntentionForAgent,
    cognistration_calibrate_tone: calibrateToneForAgent,
    cognistration_compare_tone_directions: compareToneDirectionsForAgent,
    cognistration_plan_listening_session: planListeningSessionForAgent,
    cognistration_get_session_cue: getSessionCueForAgent,
    cognistration_begin_ritual: beginRitualForAgent,
    cognistration_advance_ritual: advanceRitualForAgent,
    cognistration_prepare_session_recipe: prepareSessionRecipeForAgent,
    cognistration_open_science_guide: openScienceGuideForAgent,
    cognistration_search_tone_packs: searchTonePacksForAgent,
    cognistration_preview_tone_pack: previewTonePackForAgent,
    cognistration_get_policy_info: getPolicyInfoForAgent,
    cognistration_get_account_options: getAccountOptionsForAgent,
    cognistration_begin_preview: async (input = {}) => {
      if (input.confirmed !== true) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'needs_input', error: { code: 'CONFIRMATION_REQUIRED', safeMessage: 'Explicit confirmation is required before browser audio starts.', retryable: false } };
      }
      const started = startAudioRef.current?.();
      if (!started) {
        return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'failed', error: { code: 'AUDIO_UNAVAILABLE', safeMessage: 'The browser could not start local audio.', retryable: true } };
      }
      setAgentActivity('Your confirmed preview is playing.');
      return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'completed', audio: 'local-browser-preview', controls: sessionStateRef.current };
    },
    cognistration_open_account_signup: async () => {
      setAgentActivity('Opening the account form; the user must review and submit it.');
      window.location.assign('/signup?source=webmcp');
      return { capabilityId: WEBMCP_CONTRACT_ID, version: WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'completed', nextAction: '/signup?source=webmcp', userSubmissionRequired: true };
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const modelContext = document.modelContext || (typeof navigator !== 'undefined' ? navigator.modelContext : null);
    if (!modelContext || typeof modelContext.registerTool !== 'function') {
      setWebmcpStatus('unsupported');
      return undefined;
    }

    const controller = new AbortController();
    const nativeTools = WEBMCP_TOOL_DEFINITIONS.map((definition) => nativeWebMcpTool(
      definition,
      (input, context) => toolHandlersRef.current[definition.name]?.(input, context)
    ));

    Promise.all(nativeTools.map((tool) => modelContext.registerTool(tool, { signal: controller.signal })))
      .then(() => setWebmcpStatus('ready'))
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.warn('WebMCP registration failed:', error?.message || 'unsupported registration surface');
          setWebmcpStatus('error');
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!agentTone?.id) return;
    const applied = applyToneSettings(agentTone);
    setAgentActivity(`Your session is set to ${applied.targetState} with ${agentTone.name || 'a public tone'}.`);
  }, [agentTone, applyToneSettings]);

  useEffect(() => {
    if (!initialRitualPlan?.phases?.length) return;
    const firstPhase = initialRitualPlan.phases[0];
    setRitualPlan(initialRitualPlan);
    setRitualPhase((current) => initialRitualPlan.phases.some((phase) => phase.id === current) ? current : firstPhase.id);
    applyToneSettings(firstPhase.controls);
  }, [applyToneSettings, initialRitualPlan]);

  useEffect(() => {
    let frame;
    const tick = () => {
      setTime((previous) => previous + (isPlaying ? 0.08 : 0));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setSessionTime((previous) => previous + 1);
      }, 1000);
    } else {
      setSessionTime(0);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (sessionTime >= maxDurationSec) {
      stopAudio();
      setShowLimitModal(true);
      setSessionTime(0);
    }
  }, [maxDurationSec, sessionTime, stopAudio]);

  useEffect(() => {
    if (isPlaying && leftOscRef.current && rightOscRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      leftOscRef.current.frequency.linearRampToValueAtTime(carrierFreq, now + 0.05);
      rightOscRef.current.frequency.linearRampToValueAtTime(carrierFreq + beatFreq, now + 0.05);
    }
  }, [carrierFreq, beatFreq, isPlaying]);

  useEffect(() => {
    if (isPlaying && masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      masterGainRef.current.gain.linearRampToValueAtTime(volume / 100, ctx.currentTime + 0.05);
    }
  }, [volume, isPlaying]);

  useEffect(() => () => {
    stopAudioNodes();
    stopPackAudio();
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
    }
  }, [stopAudioNodes, stopPackAudio]);

  const getSinePath = (freq, amp, speedMultiplier = 1) => {
    const points = [];
    const width = 400;
    const height = 80;
    const visualFreq = freq * 0.05;
    for (let x = 0; x <= width; x += 4) {
      const y = height / 2 + Math.sin((x * visualFreq * 0.5) - (time * speedMultiplier * 1.5)) * amp;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const getEntrainmentPath = (freq, amp, speedMultiplier = 1) => {
    const points = [];
    const width = 400;
    const height = 100;
    for (let x = 0; x <= width; x += 4) {
      const envelope = Math.sin(x * 0.015);
      const y = height / 2 + Math.sin((x * freq * 0.08) - (time * speedMultiplier * 1.2)) * amp * envelope;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const webmcpLabel = {
    checking: 'Checking for WebMCP',
    ready: 'WebMCP ready',
    unsupported: 'Browser bridge unavailable',
    error: 'WebMCP registration needs attention'
  }[webmcpStatus] || 'Browser agent bridge';

  const webmcpDetail = webmcpStatus === 'ready'
    ? 'An agent can inspect this machine, set bounded controls, and ask before starting audio.'
    : 'Use Chrome WebMCP testing or a compatible ChatGPT in-app browser to expose the browser tools.';

  return (
    <section
      id="tone-machine-demo"
      aria-label="Cognistration tone machine demo"
      className={`w-full rounded-[2rem] border border-white/12 bg-[#14231f]/90 p-6 backdrop-blur-2xl transition-all duration-500 sm:p-8 ${visual.border} ${visual.shadow}`}
    >
      <div data-testid="webmcp-bridge" data-webmcp-status={webmcpStatus}>
        {showWebMcpStatus && (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${webmcpStatus === 'ready' ? 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]' : 'bg-cyan-300/60'}`} aria-hidden="true" />
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-200">{webmcpLabel}</p>
              </div>
              <p className="max-w-2xl text-xs leading-5 text-white/45">{webmcpDetail}</p>
              {agentActivity && <p className="text-xs leading-5 text-cyan-100/75" aria-live="polite">{agentActivity}</p>}
            </div>
            <Link href="/agent-instructions.md" className="shrink-0 text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 underline decoration-white/15 underline-offset-4 transition hover:text-white">
              Agent guide ↗
            </Link>
          </div>
        )}
      </div>

      {ritualPlan && (
        <div className="mb-8">
          <RitualConductor plan={ritualPlan} activePhase={ritualPhase} onSelectPhase={selectRitualPhase} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-4">
                <p className="text-sm font-medium text-white/70">See the session take shape</p>
            <div className="relative space-y-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101815]/70 p-5 sm:p-6">
              <div className="relative z-10 space-y-1">
                <div className="flex justify-between text-xs font-medium tracking-wide text-[#b6ddcc]">
                  <span>Left channel</span>
                  <span>{carrierFreq} Hz</span>
                </div>
                <svg className="h-12 w-full text-[#b6ddcc]/80" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
                  <path d={getSinePath(carrierFreq, isPlaying ? 20 : 0.5, 1.2)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10 space-y-1">
                <div className="flex justify-between text-xs font-medium tracking-wide text-[#d7c7aa]">
                  <span>Right channel</span>
                  <span>{carrierFreq + beatFreq} Hz</span>
                </div>
                <svg className="h-12 w-full text-[#d7c7aa]/75" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
                  <path d={getSinePath(carrierFreq + beatFreq, isPlaying ? 20 : 0.5, 1.3)} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="relative z-10 space-y-1 border-t border-white/5 pt-4">
                <div className="flex justify-between text-xs font-medium tracking-wide text-white/75">
                  <span>Perceived rhythm</span>
                  <span className="font-medium">{beatFreq.toFixed(1)} Hz · {targetState}</span>
                </div>
                <svg className="h-16 w-full text-[#d7eadf]" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <filter id="homepage-glow-wave">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d={getEntrainmentPath(beatFreq, isPlaying ? 30 : 0, 0.4)} fill="none" stroke="currentColor" strokeWidth="2.5" filter="url(#homepage-glow-wave)" />
                </svg>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[#b6ddcc]/[0.04] blur-[80px]" />
            </div>
          </div>

          <div className="space-y-5 border-t border-white/5 pt-5">
            <p className="text-sm font-medium text-white/70">Shape the session</p>

            <label className="block space-y-2">
              <span className="flex justify-between text-sm text-white/65">
                <span>Shared tone</span>
                <span>{carrierFreq} Hz</span>
              </span>
              <input aria-label="Shared tone" type="range" min="100" max="400" value={carrierFreq} onChange={(event) => setCarrierFreq(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-200" />
              <span className="block text-xs leading-5 text-white/35">Choose the tone both channels receive.</span>
            </label>

            <label className="block space-y-2">
              <span className="flex justify-between text-sm text-white/65">
                <span>Rhythm</span>
                <span>{beatFreq.toFixed(1)} Hz</span>
              </span>
              <input aria-label="Rhythm" type="range" min="0.5" max="40" step="0.5" value={beatFreq} onChange={(event) => setBeatFreq(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-200" />
              <span className="block text-xs leading-5 text-white/35">Adjust the pace independently from the directions below.</span>
            </label>

            <label className="block space-y-2">
              <span className="flex justify-between text-sm text-white/65">
                <span>Volume</span>
                <span>{volume}%</span>
              </span>
              <input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-200" />
            </label>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <Pulse aria-hidden="true" className={`size-5 shrink-0 ${visual.accent}`} weight="light" />
            <p className="text-sm text-white/60">Current rhythm: {beatFreq.toFixed(1)} Hz</p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Listen to the session</p>
            <button
              type="button"
              onClick={togglePower}
              className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-sm font-medium transition-all ${isPlaying ? 'border-[#b6ddcc]/35 bg-[#b6ddcc]/10 text-[#d7eadf] hover:bg-[#b6ddcc]/15' : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:bg-white/[0.08] hover:text-white'}`}
            >
              <Power aria-hidden="true" weight="light" className={`size-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              {isPlaying ? 'Pause preview' : 'Start preview'}
            </button>
          </div>

          <div className="select-none space-y-2 rounded-2xl border border-white/10 bg-[#101815]/60 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/45">Preview time</span>
              <span className={isPlaying || packPreview ? 'animate-pulse font-medium text-[#b6ddcc]' : 'text-white/35'}>{isPlaying || packPreview ? 'Playing' : 'Ready'}</span>
            </div>
            <div className="flex items-baseline justify-between">
                  <span className="text-xl font-medium tracking-tight text-white">{formatTime(Math.max(0, maxDurationSec - sessionTime))}</span>
                  <span className="text-xs text-white/30">/ {isWorkshopAccess ? '60 min workshop' : '2 min preview'}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full bg-[#b6ddcc] transition-all duration-1000" style={{ width: `${(sessionTime / maxDurationSec) * 100}%` }} />
            </div>
            {packPreview && <p className="text-xs leading-5 text-[#b6ddcc]/75">Pack preview · {packPreview.name} · {packPreview.trackName}</p>}
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/70">Choose a direction</p>
              <h3 className="text-3xl font-light tracking-tight text-white">Where do you want to go?</h3>
              <p className="text-sm font-light leading-6 text-white/45">Choose a starting pattern, then use the controls to make the session feel like yours.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STATE_OPTIONS.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  aria-pressed={targetState === state.id}
                  onClick={() => handleStateSelect(state.id, state.hz)}
                  className={`rounded-2xl border p-4 text-left transition-all ${targetState === state.id ? 'border-[#b6ddcc]/35 bg-[#b6ddcc]/10 text-white shadow-[0_0_20px_rgba(182,221,204,0.08)]' : 'border-white/10 bg-[#101815]/60 text-white/50 hover:border-white/20 hover:text-white/80'}`}
                >
                  <p className="text-sm font-bold tracking-tight">{state.label}</p>
                          <p className="mt-1 text-xs text-white/35">{state.range}</p>
                </button>
              ))}
            </div>

            <div data-testid="session-recipe" className="space-y-3 rounded-2xl border border-white/10 bg-[#101815]/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white/75">Portable session recipe</p>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/35">Technical settings only</span>
              </div>
              <p className="text-xs leading-5 text-white/40">Export or share the current direction without diary text, account data, or audio.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={exportLocalRecipe} className="rounded-full bg-[#d7eadf] px-3.5 py-2 text-xs font-medium text-[#17332e] transition hover:bg-white">Export JSON</button>
                <button type="button" onClick={shareLocalRecipe} className="rounded-full border border-white/15 px-3.5 py-2 text-xs text-white/70 transition hover:border-white/30 hover:text-white">Share / copy</button>
              </div>
              {recipeMessage && <p className="text-xs leading-5 text-[#b6ddcc]/80" aria-live="polite">{recipeMessage}</p>}
            </div>
          </div>
        </div>
      </div>

      <ToneScienceLesson
        id="tone-science-guide"
        tone={agentTone}
        controls={{ targetState, carrierHz: carrierFreq, beatHz: beatFreq, volume }}
        open={scienceGuideOpen}
        onOpenChange={setScienceGuideOpen}
      />

      {showLimitModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="relative w-full max-w-md space-y-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#1d2926]/95 p-8 text-center shadow-[0_0_50px_rgba(182,221,204,0.1)]">
            <div className="pointer-events-none absolute inset-0 bg-[#b6ddcc]/[0.04] blur-[80px]" />
            <div className="relative space-y-6">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[#b6ddcc]/20 bg-[#b6ddcc]/10 text-[#b6ddcc]">
                <Lightning aria-hidden="true" className="size-6" weight="light" />
              </div>
              <div className="space-y-3 text-left">
                <h3 className="text-center text-2xl font-light tracking-tight text-white">{isWorkshopAccess ? 'Workshop session complete' : 'Preview complete'}</h3>
                <p className="text-sm font-light leading-relaxed text-zinc-400">{isWorkshopAccess ? 'Your 60-minute workshop session has finished. You can start another session while your 24-hour access key is active.' : 'Your two-minute preview has finished. Create an account to keep exploring the full Cognistration platform.'}</p>
              </div>
              <div className="flex flex-col gap-3">
                {isWorkshopAccess ? (
                  <button type="button" onClick={() => setShowLimitModal(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7eadf] px-4 py-3.5 text-center text-sm font-medium text-[#17332e] transition-colors hover:bg-white">Close session <ArrowRight aria-hidden="true" className="size-4" weight="bold" /></button>
                ) : (
                  <Link href="/signup" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7eadf] px-4 py-3.5 text-center text-sm font-medium text-[#17332e] transition-colors hover:bg-white">
                    Unlock the full platform <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
                  </Link>
                )}
                <button type="button" onClick={() => setShowLimitModal(false)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-zinc-400 transition-all hover:bg-white/10 hover:text-white">Close preview</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
