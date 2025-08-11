'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { SessionCharts } from '@/components/analytics/SessionCharts';
import { FrequencyBackground } from '@/components/visuals/FrequencyBackground';
import { GlitchTitle } from '@/components/visuals/GlitchTitle';
import { HeroImage } from '@/components/visuals/HeroImage';
import { Accordion } from '@/components/ui/accordion';

export default function GeneratePage() {
  const [journal, setJournal] = useState('I seek deep relaxation and expanded awareness.');
  const [focus, setFocus] = useState('F12');
  const [lengthSec, setLengthSec] = useState(300);
  const [isochronic, setIsochronic] = useState(true);
  const [monaural, setMonaural] = useState(true);
  const [breath, setBreath] = useState(false);
  const [pattern, setPattern] = useState('coherent-5.5');
  const [background, setBackground] = useState(false);
  const [bgLevel, setBgLevel] = useState(-22);
  const [baseFreq, setBaseFreq] = useState(240);
  const [breathBpm, setBreathBpm] = useState(5.5);
  const [duckPercent, setDuckPercent] = useState(0.75);
  const [duckAttack, setDuckAttack] = useState(40);
  const [duckRelease, setDuckRelease] = useState(220);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [voice, setVoice] = useState('alloy');
  const [ttsUrl, setTtsUrl] = useState(null);
  const [mp3Url, setMp3Url] = useState(null);
  const [mixing, setMixing] = useState(false);
  const [mixState, setMixState] = useState({ ctx: null, srcA: null, srcB: null });
  const bedRef = useRef(null);
  const ttsRef = useRef(null);
  const timersRef = useRef([]);
  const [combinedUrl, setCombinedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const onGenerate = async () => {
    setLoading(true); setError(null); setAudioUrl(null); setCombinedUrl(null); setGuidance(null);
    try {
      // Single server-side combined render: 5 minutes total with ~2.5 minutes guidance
      const comb = await fetch('/api/audio/combined', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: journal,
          focusLevel: focus,
          lengthSec: Number(lengthSec) || 300,
          baseFreqHz: Number(baseFreq) || undefined,
          entrainmentModes: { binaural: true, monaural, isochronic },
          breathGuide: breath ? { enabled: true, pattern, bpm: Number(breathBpm) || undefined } : undefined,
          background: background ? { type: 'ocean', mixDb: Number(bgLevel) } : undefined,
          ducking: { enabled: true, bedPercentWhileTalking: Number(duckPercent) || 0.75, attackMs: Number(duckAttack)||40, releaseMs: Number(duckRelease)||220 },
          tts: { voice }
        })
      });
      const cj = await comb.json();
      if (!comb.ok || !cj.ok) throw new Error(cj.error || 'Failed to render combined audio');
      setCombinedUrl(cj.wav);
      if (cj.mp3) setMp3Url(cj.mp3);
      if (Array.isArray(cj.stages)) setGuidance({ stages: cj.stages });
      if (cj.analytics) setAnalytics(cj.analytics);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const playBoth = async () => {
    if (!audioUrl || mixing) return;
    setMixing(true);
    try {
      // Simple path: play native audio elements in-sync
      const bed = bedRef.current;
      const tts = ttsRef.current;
      if (ttsUrl && tts) {
        tts.currentTime = 0;
        bed.currentTime = 0;
        const start = () => {
          bed.play();
          tts.play();
        };
        const timer = setTimeout(start, 50);
        timersRef.current.push(timer);
      } else {
        // No TTS yet: just play bed
        bed.currentTime = 0;
        bed.play();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopBoth = () => {
    try {
      const bed = bedRef.current; const tts = ttsRef.current;
      if (bed) { bed.pause(); bed.currentTime = 0; }
      if (tts) { tts.pause(); tts.currentTime = 0; }
      timersRef.current.forEach(clearTimeout); timersRef.current = [];
    } catch {}
    setMixState({ ctx: null, srcA: null, srcB: null });
    setMixing(false);
  };

  return (
    <main className="mx-auto max-w-[1200px] p-6">
      <FrequencyBackground />
      <ThemeToggle />
      <GlitchTitle text="HemiSync Session Generator" />
      <p className="mb-6 text-center text-white/80">Create a 5-minute hemispheric synchronization session with guided cues and analytics.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <label className="block text-sm text-white/80">Journal (optional)</label>
            <Textarea value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="Your intention/journal..." />

            <label className="block text-sm text-white/80">Focus Level</label>
            <Select value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="F10">F10 – Induction</option>
              <option value="F12">F12 – Expanded Awareness</option>
              <option value="F15">F15 – No-time</option>
              <option value="F21">F21 – Boundary</option>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-white/80">Length (seconds)</label>
                <Input type="number" min={60} max={1800} value={lengthSec} onChange={(e)=>setLengthSec(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-white/80">Base Frequency (Hz)</label>
                <Input type="number" min={100} max={400} value={baseFreq} onChange={(e)=>setBaseFreq(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-3 py-2">
              <Switch checked={isochronic} onChange={setIsochronic} label="Isochronic pulses" />
              <Switch checked={monaural} onChange={setMonaural} label="Monaural overlay" />
              <Switch checked={breath} onChange={setBreath} label="Breath entrainment" />
            <Switch checked={background} onChange={setBackground} label="Ocean background" />
            </div>

          {background && (
            <div className="grid grid-cols-2 items-center gap-2">
              <label className="text-sm text-white/80">Ocean level (dB)</label>
              <Input type="number" value={bgLevel} onChange={(e) => setBgLevel(e.target.value)} />
            </div>
          )}

            {breath && (
              <div>
                <label className="block text-sm text-white/80">Breath pattern</label>
                <Select value={pattern} onChange={(e) => setPattern(e.target.value)}>
                  <option value="coherent-5.5">Coherent (5.5 bpm)</option>
                  <option value="box">Box 4-4-4-4</option>
                  <option value="4-7-8">4-7-8</option>
                </Select>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-sm text-white/80">Coherent BPM</label>
                  <Input type="number" step={0.1} value={breathBpm} onChange={(e)=>setBreathBpm(e.target.value)} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm text-white/80">Duck while TTS</label>
                <Input type="number" min={0.5} max={1} step={0.01} value={duckPercent} onChange={(e)=>setDuckPercent(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-white/80">Attack (ms)</label>
                <Input type="number" min={5} max={300} value={duckAttack} onChange={(e)=>setDuckAttack(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-white/80">Release (ms)</label>
                <Input type="number" min={5} max={800} value={duckRelease} onChange={(e)=>setDuckRelease(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/80">TTS Voice</label>
              <Select value={voice} onChange={(e)=>setVoice(e.target.value)}>
                <option value="alloy">Alloy</option>
                <option value="verse">Verse</option>
                <option value="sage">Sage</option>
              </Select>
            </div>

            <Button onClick={onGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Session'}
            </Button>
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white">Preview</h2>
            {combinedUrl || audioUrl || ttsUrl ? (
              <div className="space-y-3">
                {combinedUrl && <audio controls className="w-full" src={combinedUrl} />}
                {audioUrl && <audio ref={bedRef} controls className="w-full" src={audioUrl} />}
                {ttsUrl && <audio ref={ttsRef} controls className="w-full" src={ttsUrl} />}
                {combinedUrl && (
                  <div className="flex gap-2">
                    <a
                      href={combinedUrl}
                      download={`hemisync-${focus}-${lengthSec}s.wav`}
                      className="rounded-md bg-sky-400/90 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-300"
                    >Download WAV</a>
                    {mp3Url && (
                      <a href={mp3Url} download={`hemisync-${focus}-${lengthSec}s.mp3`} className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">Download MP3</a>
                    )}
                  </div>
                )}
                {audioUrl && (ttsUrl || guidance) && (
                  <div className="flex gap-2">
                    <button onClick={playBoth} disabled={mixing} className="rounded-md bg-cyan-500 px-3 py-1 text-sm text-slate-900 disabled:opacity-60">Play Both</button>
                    <button onClick={stopBoth} className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">Stop</button>
                  </div>
                )}
              </div>
            ) : <p className="text-white/70">No audio yet. Generate to preview.</p>}
            <p className="text-xs text-white/60">Tip: Large sessions may take time and memory in development. Consider starting at 180–300s.</p>
            {guidance && (
              <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-3 text-sm text-white/90 max-h-64 overflow-auto">
                <h3 className="mb-1 font-medium">Guidance</h3>
                {Array.isArray(guidance.stages) && guidance.stages.map((s, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-white/70">{s.name} — t={s.atSec}s • {s.durationSec}s</div>
                    <div>{s.script}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white">Session Analytics</h2>
            {analytics ? (
              <SessionCharts analytics={analytics} />
            ) : (
              <p className="text-white/70">Generate a session to view frequency ramps and ducking envelope.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-xl font-semibold text-white">Instructional Guide</h2>
        <Accordion
          items={[
            { title: '1. Choose your Focus', content: 'F10 (induction), F12 (expanded awareness), F15 (no-time), F21 (boundary). For first-time users, start with F12.' },
            { title: '2. Session Length & Background', content: 'Length is fixed at 5 minutes for MVP. Optionally add ocean background for comfort. Volume mixing is handled automatically.' },
            { title: '3. Generate & Listen', content: 'Click Generate. The system creates the audio bed and guidance TTS, mixes them with ducking, and returns a single WAV.' },
            { title: '4. Understand the Analytics', content: (
              <ul className="ml-5 list-disc space-y-1">
                <li>Delta Frequency: shows Δf over time; α≈8–12 Hz (relax), θ≈4–7 Hz (deep meditation).</li>
                <li>Ducking Envelope: bed reduces to 80% during guidance for clarity.</li>
                <li>RMS: relative loudness of bed vs voice; voice should be slightly higher during speaking.</li>
                <li>Band Coverage: percentage of time spent in each band based on preset ramp.</li>
              </ul>
            ) },
            { title: '5. Best Practices (Gateway-informed)', content: 'Use headphones. Sit comfortably. Eyes closed. Allow breath to slow naturally. Treat guidance as gentle suggestions.' }
          ]}
        />
      </div>
    </main>
  );
}

