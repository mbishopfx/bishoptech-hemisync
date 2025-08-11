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
import { TechGridBackground } from '@/components/visuals/TechGridBackground';
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
  const [voiceMixDb, setVoiceMixDb] = useState(-16);
  const [ttsUrl, setTtsUrl] = useState(null);
  const [mp3Url, setMp3Url] = useState(null);
  const [mixing, setMixing] = useState(false);
  const [mixState, setMixState] = useState({ ctx: null, srcA: null, srcB: null });
  const bedRef = useRef(null);
  const ttsRef = useRef(null);
  const timersRef = useRef([]);
  const [combinedUrl, setCombinedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [overlayUrl, setOverlayUrl] = useState(null);
  const [musicTrack, setMusicTrack] = useState('track1');
  const [overlayBand, setOverlayBand] = useState('alpha');
  const [overlayTempo, setOverlayTempo] = useState(120);
  const [overlayDb, setOverlayDb] = useState(-10);
  const [journey, setJourney] = useState([]);

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
          tts: { voice, mixDb: Number(voiceMixDb) }
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

  const onMakeOverlay = async () => {
    setLoading(true); setError(null); setOverlayUrl(null);
    try {
      const resp = await fetch('/api/audio/overlay', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: musicTrack, band: overlayBand, bpm: Number(overlayTempo)||120, overlayDb: Number(overlayDb), baseFreqHz: Number(baseFreq)||240, lengthSec: Number(lengthSec)||undefined })
      });
      const json = await resp.json();
      if (!resp.ok || !json.ok) throw new Error(json.error || 'Overlay generation failed');
      setOverlayUrl(json.wav);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const onGenerateJourney = async () => {
    setLoading(true); setError(null); setJourney([]);
    try {
      const resp = await fetch('/api/audio/journey', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: journal,
          perTrackSec: Number(lengthSec) || 300,
          baseFreqHz: Number(baseFreq) || 240,
          breathGuide: breath ? { enabled: true, pattern, bpm: Number(breathBpm) || undefined } : undefined,
          background: background ? { type: 'ocean', mixDb: Number(bgLevel) } : undefined,
          ducking: { bedPercentWhileTalking: Number(duckPercent)||0.75, attackMs: Number(duckAttack)||40, releaseMs: Number(duckRelease)||220 },
          tts: { voice, mixDb: Number(voiceMixDb) },
          modes: { binaural: true, monaural, isochronic }
        })
      });
      const json = await resp.json();
      if (!resp.ok || !json.ok) throw new Error(json.error || 'Journey generation failed');
      setJourney(json.tracks || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="mx-auto max-w-[1200px] p-6">
      <TechGridBackground />
      <ThemeToggle />
      <Card className="mb-6 glass-emphasis">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Important: About HemiSync and Gateway Practice</h2>
          <p className="text-white/80">
            Binaural and isochronic entrainment can support relaxation, focused attention, and meditative depth by
            presenting low-frequency differences between ears. Results vary by individual. Many users report calmer
            mood, improved sleep hygiene, and better concentration with regular practice. These techniques are not
            medical treatments and do not replace professional care.
          </p>
          <ul className="ml-5 list-disc space-y-1 text-white/75">
            <li>Use high‑quality stereo headphones at comfortable volume. Do not listen while driving or operating machinery.</li>
            <li>If you have a history of seizures, pacemaker/arrhythmia, or other neurological concerns, consult a clinician before use.</li>
            <li>Deep states can evoke strong emotions or drowsiness. If uncomfortable, stop the session and ground (open eyes, breathe, hydrate).</li>
            <li>Gateway-style practice benefits from consistency: brief daily sessions often outperform sporadic long sessions.</li>
          </ul>
          <p className="text-white/75">
            Evidence suggests entrainment can nudge brain rhythms toward alpha (relaxation), theta (deep meditation),
            and delta (restorative states). Experiences are subjective and no specific outcome is guaranteed. Proceed thoughtfully and
            track how you feel over time.
          </p>
          <div className="mt-3 rounded-md border border-white/10 bg-white/5 p-3">
            <p className="text-sm text-white/80">
              Disclaimer: This program is custom-built by <a href="https://bishoptech.dev" target="_blank" rel="noreferrer" className="text-sky-300 underline">BishopTech.dev</a> to expand upon
              established Gateway methods and explore the unique access potential observed with this technology. The creator has personally
              tested and experienced benefits, and we aim to make thoughtful, responsible access available to everyone. This is educational
              and wellness-oriented software, not a medical device.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="mt-2 grid grid-cols-2 gap-2 items-center">
                <label className="text-sm text-white/80">Voice Mix (dB)</label>
                <Input type="number" step={1} value={voiceMixDb} onChange={(e)=>setVoiceMixDb(e.target.value)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={onGenerate} disabled={loading}>
                {loading ? 'Generating…' : 'Generate Session'}
              </Button>
              <Button onClick={onGenerateJourney} disabled={loading}>
                {loading ? 'Working…' : 'Generate Master Journey (5 tracks)'}
              </Button>
            </div>
            <div className="pt-2 border-t border-white/10" />
            <div className="space-y-2">
              <h3 className="text-white font-medium">Music Overlay (no TTS)</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-white/80">Music Track</label>
                  <Select value={musicTrack} onChange={(e)=>setMusicTrack(e.target.value)}>
                    <option value="track1">Track 1</option>
                    <option value="track2">Track 2</option>
                    <option value="track3">Track 3</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-white/80">Band</label>
                  <Select value={overlayBand} onChange={(e)=>setOverlayBand(e.target.value)}>
                    <option value="alpha">Alpha</option>
                    <option value="theta">Theta</option>
                    <option value="delta">Delta</option>
                    <option value="beta">Beta</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-white/80">Tempo (BPM)</label>
                  <Input type="number" value={overlayTempo} onChange={(e)=>setOverlayTempo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-white/80">Overlay Level (dB)</label>
                  <Input type="number" step={1} value={overlayDb} onChange={(e)=>setOverlayDb(e.target.value)} />
                </div>
              </div>
              <Button onClick={onMakeOverlay} disabled={loading}>{loading ? 'Processing...' : 'Make Overlay'}</Button>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>
        </Card>

        <Card className="lg:col-span-1 max-w-full">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-white">Preview</h2>
            {combinedUrl || audioUrl || ttsUrl ? (
              <div className="space-y-3">
                {combinedUrl && <audio controls className="w-full" src={combinedUrl} />}
                {overlayUrl && <audio controls className="w-full" src={overlayUrl} />}
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
                {journey && journey.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-white font-medium">Journey Tracks</h3>
                    {journey.map((t, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3">
                        <div className="text-white/90">{t.title}</div>
                        <div className="flex gap-2">
                          {t.wav && <a href={t.wav} download={`journey-${i+1}.wav`} className="rounded-md bg-sky-400/90 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-sky-300">WAV</a>}
                          {t.mp3 && <a href={t.mp3} download={`journey-${i+1}.mp3`} className="rounded-md bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20">MP3</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : <p className="text-white/70">No audio yet. Generate to preview.</p>}
            <p className="text-xs text-white/60">Tip: Large sessions may take time and memory in development. Consider starting at 180–300s.</p>
          </div>
        </Card>

        <Card className="lg:col-span-3">
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

