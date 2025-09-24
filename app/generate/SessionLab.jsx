'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { defaultSessionSpec } from './chatspec';
import { FocusPresets } from '@/lib/audio/presets';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID;
const RENDER_BUCKET = DEMO_USER_ID ? `renders-${DEMO_USER_ID}` : null;
const AMBIENT_TRACK = `/api/ambient?file=${encodeURIComponent('ES_Lumina - Valante.mp3')}`;

let toneModulePromise;
function loadToneModule() {
  if (!toneModulePromise) {
    toneModulePromise = import('tone');
  }
  return toneModulePromise;
}

let pizzicatoModulePromise;
function loadPizzicatoModule() {
  if (!pizzicatoModulePromise) {
    pizzicatoModulePromise = import('pizzicato').then((mod) => mod.default || mod);
  }
  return pizzicatoModulePromise;
}

function useToneReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    loadToneModule()
      .then(() => mounted && setReady(true))
      .catch(() => mounted && setReady(false));
    return () => {
      mounted = false;
    };
  }, []);
  return ready;
}

export function SessionLab() {
  const toneReady = useToneReady();
  const [spec, setSpec] = useState(defaultSessionSpec);
  const [scene, setScene] = useState('alpha-drift');
  const [intent, setIntent] = useState('Guided expansion and calm focus.');
  const [status, setStatus] = useState('Idle');
  const [playing, setPlaying] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderResult, setRenderResult] = useState(null);
  const [chatInput, setChatInput] = useState('Can you soften the guidance and stretch the delta ramp to 12 minutes?');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const stopHandlesRef = useRef([]);

  const supabase = useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    return () => {
      stopPreviewInternal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLayerParams = (type, partial) => {
    setSpec((prev) => ({
      ...prev,
      layers: prev.layers.map((layer) =>
        layer.type === type ? { ...layer, params: { ...layer.params, ...partial } } : layer
      )
    }));
  };

  const getLayer = (type) => spec.layers.find((layer) => layer.type === type);

  const startPreview = async () => {
    if (!toneReady) {
      setStatus('Tone engine not ready yet');
      return;
    }
    try {
      setStatus('Starting preview…');
      const ToneLib = await loadToneModule();
      const PizzicatoLib = await loadPizzicatoModule();
      if (typeof ToneLib.start === 'function') {
        await ToneLib.start();
      }
      stopPreviewInternal();

      const master = ToneLib.getDestination();
      master.volume.value = spec.volumeDb ?? -12;

      const binaural = getLayer('binaural');
      if (binaural) {
        const carrier = binaural.params.baseFreqHz || spec.baseFreqHz;
        const deltaFrom = binaural.params.delta?.from || spec.deltaHz;
        const deltaTo = binaural.params.delta?.to || spec.deltaHz;
        const durationSec = 30;
        const startTime = ToneLib.now();
        const freqDiff = deltaTo - deltaFrom;

        const left = new PizzicatoLib.Sound({ source: 'wave', options: { frequency: carrier } });
        const right = new PizzicatoLib.Sound({ source: 'wave', options: { frequency: carrier + deltaFrom } });
        left.volume = 0.45;
        right.volume = 0.45;
        left.addEffect(new PizzicatoLib.Effects.StereoPanner({ pan: -1 }));
        right.addEffect(new PizzicatoLib.Effects.StereoPanner({ pan: 1 }));
        left.play();
        right.play();

        const interval = setInterval(() => {
          const elapsed = ToneLib.now() - startTime;
          const progress = Math.min(1, elapsed / durationSec);
          right.frequency = carrier + deltaFrom + freqDiff * progress;
        }, 200);
        stopHandlesRef.current.push(() => {
          clearInterval(interval);
          try { left.stop(); } catch {}
          try { right.stop(); } catch {}
        });
      }

      const background = getLayer('background');
      if (background?.params?.preset === 'ocean') {
        const noise = new ToneLib.Noise('pink');
        const volume = new ToneLib.Volume(background.params.mixDb ?? -24).connect(ToneLib.getDestination());
        const filter = new ToneLib.Filter(800, 'lowpass').connect(volume);
        const lfo = new ToneLib.LFO({ frequency: 0.08, min: 200, max: 1200 }).start();
        lfo.connect(filter.frequency);
        noise.connect(filter);
        noise.start();
        stopHandlesRef.current.push(() => {
          try { noise.stop(); } catch {}
          noise.dispose();
          filter.dispose();
          volume.dispose();
          lfo.dispose();
        });
      }

      const ambient = new ToneLib.Player({ url: AMBIENT_TRACK, autostart: false, loop: true });
      await ambient.load();
      ambient.volume.value = -18;
      ambient.fadeIn = 2;
      ambient.fadeOut = 2;
      ambient.connect(ToneLib.getDestination());
      ambient.start();
      stopHandlesRef.current.push(() => {
        try { ambient.stop(); } catch {}
        ambient.dispose();
      });

      setStatus('Previewing');
      setPlaying(true);
    } catch (err) {
      console.error(err);
      setStatus(`Preview error: ${err.message}`);
      stopPreviewInternal();
    }
  };

  const stopPreviewInternal = () => {
    stopHandlesRef.current.forEach((stopFn) => {
      try {
        stopFn?.();
      } catch (e) {
        console.warn('Preview stop handler failed', e);
      }
    });
    stopHandlesRef.current = [];
    setStatus('Stopped');
    setPlaying(false);
  };

  const stopPreview = () => {
    stopPreviewInternal();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!supabase || !RENDER_BUCKET) {
      setStatus('Supabase client missing; check environment keys.');
      return;
    }
    setStatus('Uploading file…');
    const path = `uploads/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(RENDER_BUCKET).upload(path, file, { upsert: true });
    if (error) {
      setStatus(`Upload failed: ${error.message}`);
      return;
    }
    const { data: signed } = await supabase.storage.from(RENDER_BUCKET).createSignedUrl(path, 3600);
    setUploadedFiles((prev) => [{ name: file.name, path, url: signed?.signedUrl }, ...prev]);
    setStatus('File uploaded');
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const prompt = chatInput.trim();
    setChatHistory((prev) => [...prev, { role: 'user', content: prompt }]);
    setChatInput('');
    try {
      setStatus('Contacting Session Architect…');
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sessionId,
          sessionSpec: spec,
          sessionName: 'TahoeOS Session',
          email: 'demo@tahoeos.local'
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) throw new Error(data.error || 'Chat request failed');
      setSessionId(data.sessionId);
      if (data.spec) setSpec(data.spec);
      if (data.reply) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
      setStatus('Session Architect updated the plan');
    } catch (err) {
      console.error(err);
      setStatus(`Chat failed: ${err.message}`);
    }
  };

  const handleGenerate = async () => {
    try {
      setRendering(true);
      setStatus('Rendering session…');
      const binaural = getLayer('binaural');
      const breath = getLayer('breath');
      const background = getLayer('background');
      const voice = getLayer('voice');

      const body = {
        text: intent,
        focusLevel: spec.focusLevel,
        lengthSec: spec.lengthSec,
        baseFreqHz: spec.baseFreqHz,
        entrainmentModes: { binaural: true, monaural: true, isochronic: true },
        breathGuide: breath
          ? {
              enabled: true,
              pattern: breath.params.pattern || 'coherent-5.5',
              bpm: spectoBpm(spec.breathRate)
            }
          : undefined,
        background: background ? { type: background.params.preset || 'ocean', mixDb: background.params.mixDb } : undefined,
        tts: voice ? { voice: voice.params.voice || 'alloy', mixDb: voice.params.mixDb ?? -16 } : undefined
      };

      const resp = await fetch('/api/audio/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Render failed');
      }
      setRenderResult({ wav: data.wav, mp3: data.mp3, analytics: data.analytics });
      setStatus('Render complete');
    } catch (err) {
      console.error(err);
      setStatus(`Render failed: ${err.message}`);
    } finally {
      setRendering(false);
    }
  };

  const spectoBpm = (rate) => {
    if (!rate) return undefined;
    return Number((rate * 60).toFixed(2));
  };

  return (
    <section className="mt-10 space-y-8">
      <Card className="glass-emphasis border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">TahoeOS Session Lab</h2>
            <p className="text-sm text-white/70">Design, preview, chat, and render long-form hemi-sync sessions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={playing ? stopPreview : startPreview} disabled={!toneReady}>
              {toneReady ? (playing ? 'Stop Preview' : 'Play Preview') : 'Loading Audio Engine…'}
            </Button>
            <span className="text-sm text-white/60">{status}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="glass p-6 space-y-4 xl:col-span-2">
          <h3 className="text-white font-medium">Scene Designer</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-white/60">Focus Level</label>
            <Select
              value={spec.focusLevel}
              onChange={(e) => {
                const value = e.target.value;
                const preset = FocusPresets[value] || FocusPresets.F12;
                const deltaPath = preset.deltaHzPath || [];
                const deltaFrom = deltaPath[0]?.hz ?? spec.deltaHz;
                const deltaTo = deltaPath[deltaPath.length - 1]?.hz ?? deltaFrom;
                setSpec((prev) => ({
                  ...prev,
                  focusLevel: value,
                  baseFreqHz: preset.carriers.leftHz,
                  deltaHz: deltaFrom,
                  layers: prev.layers.map((layer) => {
                    if (layer.type === 'binaural') {
                      return {
                        ...layer,
                        params: {
                          ...layer.params,
                          baseFreqHz: preset.carriers.leftHz,
                          delta: { from: deltaFrom, to: deltaTo }
                        }
                      };
                    }
                    if (layer.type === 'background' && preset.noise) {
                      return {
                        ...layer,
                        params: {
                          ...layer.params,
                          mixDb: preset.noise.mixDb ?? layer.params.mixDb ?? -24
                        }
                      };
                    }
                    return layer;
                  })
                }));
              }}
            >
              <option value="F10">F10 – Induction</option>
              <option value="F12">F12 – Expanded Awareness</option>
              <option value="F15">F15 – No-time</option>
              <option value="F21">F21 – Boundary</option>
            </Select>
            <label className="text-xs uppercase tracking-wide text-white/60">Duration (minutes)</label>
            <Input
              type="number"
              min={5}
              max={120}
              value={Math.round(spec.lengthSec / 60)}
              onChange={(e) => setSpec((prev) => ({ ...prev, lengthSec: Number(e.target.value) * 60 }))}
            />
            <label className="text-xs uppercase tracking-wide text-white/60">Carrier Frequency</label>
            <Input
              type="number"
              value={getLayer('binaural')?.params?.baseFreqHz || spec.baseFreqHz}
              onChange={(e) => {
                updateLayerParams('binaural', { baseFreqHz: Number(e.target.value) });
                setSpec((prev) => ({ ...prev, baseFreqHz: Number(e.target.value) }));
              }}
            />
            <label className="text-xs uppercase tracking-wide text-white/60">Delta From / To</label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={getLayer('binaural')?.params?.delta?.from || spec.deltaHz}
                onChange={(e) => updateLayerParams('binaural', {
                  delta: { ...(getLayer('binaural')?.params?.delta || {}), from: Number(e.target.value) }
                })}
              />
              <Input
                type="number"
                value={getLayer('binaural')?.params?.delta?.to || spec.deltaHz}
                onChange={(e) => updateLayerParams('binaural', {
                  delta: { ...(getLayer('binaural')?.params?.delta || {}), to: Number(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Scene</label>
              <div className="mt-2 flex items-center gap-3">
                <Switch
                  checked={scene === 'alpha-drift'}
                  onChange={(checked) => setScene(checked ? 'alpha-drift' : 'theta-dive')}
                  label="Alpha Drift"
                />
                <span className="text-sm text-white/60">Toggle for Theta Dive automation.</span>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Voice Mix (dB)</label>
              <Input
                type="number"
                value={getLayer('voice')?.params?.mixDb ?? -16}
                onChange={(e) => updateLayerParams('voice', { mixDb: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Breath Depth</label>
              <Input
                type="number"
                step="0.01"
                value={getLayer('breath')?.params?.depth ?? 0.12}
                onChange={(e) => updateLayerParams('breath', { depth: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Breath Pattern</label>
              <Select
                value={getLayer('breath')?.params?.pattern || 'coherent-5.5'}
                onChange={(e) => updateLayerParams('breath', { pattern: e.target.value })}
              >
                <option value="coherent-5.5">Coherent 5.5</option>
                <option value="box">Box 4-4-4-4</option>
                <option value="4-7-8">4-7-8</option>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Ocean Background</label>
              <div className="mt-2 flex items-center gap-3">
                <Switch
                  checked={Boolean(getLayer('background'))}
                  onChange={(checked) => {
                    if (checked && !getLayer('background')) {
                      setSpec((prev) => ({
                        ...prev,
                        layers: [...prev.layers, { id: 'layer-background', type: 'background', params: { preset: 'ocean', mixDb: -24 } }]
                      }));
                    } else if (!checked) {
                      setSpec((prev) => ({
                        ...prev,
                        layers: prev.layers.filter((layer) => layer.type !== 'background')
                      }));
                    }
                  }}
                  label="Enable"
                />
                {getLayer('background') && (
                  <Input
                    type="number"
                    value={getLayer('background')?.params?.mixDb ?? -24}
                    onChange={(e) => updateLayerParams('background', { mixDb: Number(e.target.value) })}
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass p-6 space-y-4">
          <h3 className="text-white font-medium">Session Sources</h3>
          <div className="space-y-3">
            <Button asChild variant="secondary" className="w-full justify-center">
              <label className="cursor-pointer">
                Upload MP3 / WAV
                <input type="file" accept="audio/mpeg,audio/wav" className="hidden" onChange={handleFileUpload} />
              </label>
            </Button>
            <p className="text-xs text-white/60">
              Files are stored in your private Supabase bucket. Attach narrated books or ambient beds to remix.
            </p>
            <div className="space-y-2 max-h-40 overflow-auto">
              {uploadedFiles.length === 0 && <p className="text-sm text-white/50">No custom sources yet.</p>}
              {uploadedFiles.map((file) => (
                <div key={file.path} className="rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                  <p className="font-medium">{file.name}</p>
                  {file.url && (
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-xs text-sky-300 underline">
                      Preview / Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wide text-white/60">Session Intent / Guidance Notes</label>
            <Textarea value={intent} onChange={(e) => setIntent(e.target.value)} rows={4} placeholder="How should this session feel?" />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass p-6 space-y-4">
          <h3 className="text-white font-medium">Session Architect Chat</h3>
          <div className="space-y-3 max-h-72 overflow-auto rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            {chatHistory.length === 0 && <p className="text-white/60">No messages yet. Describe what you want and the AI architect will adjust the spec.</p>}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-white/50">{msg.role}</p>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Textarea rows={3} value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask for adjustments…" />
            <div className="flex justify-end">
              <Button onClick={handleChatSend}>Send to Session Architect</Button>
            </div>
          </div>
        </Card>

        <Card className="glass p-6 space-y-4">
          <h3 className="text-white font-medium">Render & Download</h3>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <p className="text-sm text-white/70">
              Once you like the preview, render the full-length session with AI narration, ducking, and analytics.
            </p>
            <Button onClick={handleGenerate} disabled={rendering}>{rendering ? 'Rendering…' : 'Generate Session'}</Button>
            {renderResult && (
              <div className="space-y-3">
                <audio controls className="w-full" src={renderResult.wav} />
                <div className="flex flex-wrap gap-3">
                  <a
                    href={renderResult.wav}
                    download="hemisync-session.wav"
                    className="rounded-md bg-sky-400/90 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-300"
                  >
                    Download WAV
                  </a>
                  {renderResult.mp3 && (
                    <a
                      href={renderResult.mp3}
                      download="hemisync-session.mp3"
                      className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
                    >
                      Download MP3
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </Card>
      </div>
    </section>
  );
}
