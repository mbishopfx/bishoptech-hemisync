'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Lightning, Power, Pulse } from '@phosphor-icons/react';
import { nativeWebMcpTool, WEBMCP_TOOL_DEFINITIONS, WEBMCP_CONTRACT_ID, WEBMCP_CONTRACT_VERSION } from '@/lib/agentic/webmcp-contract';

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

export function ToneMachineDemo({ agentTone = null, showWebMcpStatus = false, workshopAccess = null }) {
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
    cognistration_generate_tone: generateToneForAgent,
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
          </div>
        </div>
      </div>

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
