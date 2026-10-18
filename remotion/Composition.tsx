import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
} from 'remotion';

// ---------------------------------------------------------------------------
// Brain state config — matches the Cognistration machine palette
// ---------------------------------------------------------------------------
type StateInfo = {
  label: string;
  hz: number;
  range: string;
  outcome: string;
  leftColor: string;
  rightColor: string;
  beatColor: string;
  glowColor: string;
};

const STATE_INFO: Record<string, StateInfo> = {
  delta:  { label: 'Delta', hz: 2.5,  range: '0.5–4 Hz',  outcome: 'Deep sleep, inner restoration', leftColor: '#e2e8f0', rightColor: '#cbd5e1', beatColor: '#f1f5f9', glowColor: 'rgba(226,232,240,0.45)' },
  theta:  { label: 'Theta', hz: 6.0,  range: '4–8 Hz',    outcome: 'Meditation, creative flow, inner voice', leftColor: '#b6ddcc', rightColor: '#d7c7aa', beatColor: '#d7eadf', glowColor: 'rgba(182,221,204,0.55)' },
  alpha:  { label: 'Alpha', hz: 10.0, range: '8–13 Hz',   outcome: 'Calm awareness, quiet the noise', leftColor: '#b6ddcc', rightColor: '#d7c7aa', beatColor: '#d7eadf', glowColor: 'rgba(182,221,204,0.55)' },
  smr:    { label: 'SMR',   hz: 13.0, range: '12–15 Hz',  outcome: 'Still body, sharp mind', leftColor: '#a2d8d0', rightColor: '#d7c7aa', beatColor: '#c8f0e8', glowColor: 'rgba(162,216,208,0.45)' },
  beta:   { label: 'Beta',  hz: 18.0, range: '13–30 Hz',  outcome: 'Active focus, mental clarity', leftColor: '#e0b493', rightColor: '#d7c7aa', beatColor: '#f0d4b8', glowColor: 'rgba(224,180,147,0.45)' },
  gamma:  { label: 'Gamma', hz: 38.0, range: '30–45 Hz',  outcome: 'Higher awareness, connected consciousness', leftColor: '#d7c7aa', rightColor: '#e0b493', beatColor: '#efe0c8', glowColor: 'rgba(215,199,170,0.45)' },
};

type HookWord = { text: string; start: number; end: number; accent?: boolean };

// The cold-open manifest produced by scripts/generate_hook.py on every render.
// When it is absent — generation failed, or an older run — the composition
// falls back to DEFAULT_HOOK so a short always opens with a spoken line.
export interface HookManifest {
  state?: string;
  text: string;
  audioPath: string;
  audioSec: number;
  frames?: number;
  words: HookWord[];
}

export interface CognistrationShortProps {
  brainState: string;
  audioPath: string;
  backgroundPath?: string;
  carrierHz?: number;
  durationSec?: number;
  hook?: HookManifest;
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// ---------------------------------------------------------------------------
// COLD OPEN — whispered hook on a blank screen
// ---------------------------------------------------------------------------
//
// A soft, slow, whispered line over near-black, one word at a time in large
// type, then a snap and straight into the session. The point is a pause and a
// promise before the machine appears, which is what holds the first seconds.
//
// Voice: ElevenLabs `eleven-v3`, voice "Rachel" (21m00Tcm4TlvDq8ikWAM), with the
// `[whispers]` tag, then EQ'd and slowed to 0.80x and padded 0.45s lead /
// 0.35s tail. Regenerate with:
//
//   python3 or_tts.py --model elevenlabs/eleven-v3 --voice 21m00Tcm4TlvDq8ikWAM \
//     --text "[whispers] You're about to have a digital reset in theta." \
//     --out final_voice_raw.mp3
//   ffmpeg -y -i final_voice_raw.mp3 -af "highpass=f=95,\
//     equalizer=f=200:t=q:w=1:g=-3,equalizer=f=2800:t=q:w=1.3:g=2.5,\
//     acompressor=threshold=-20dB:ratio=3.2:attack=8:release=220,atempo=0.80,\
//     volume=2.2,alimiter=limit=0.92" -ar 48000 -ac 2 body.wav
//   # then concat 0.45s silence + body.wav + 0.35s silence -> hook/hook_voice.mp3
//
// Word timings below are whisper word timestamps from that exact file, with the
// first word corrected to the real speech onset at 0.607s (the lead silence).

export const HOOK_AUDIO_SEC = 3.892;
export const HOOK_FRAMES = Math.round(HOOK_AUDIO_SEC * 30); // 117 frames

// The line that ships when generate_hook.py could not run. Same voice, same
// shaping, same timings as the original cold open — kept as the safe default.
const DEFAULT_HOOK_WORDS: HookWord[] = [
  { text: "You're",  start: 0.607, end: 0.840 },
  { text: "about",   start: 0.840, end: 1.060 },
  { text: "to",      start: 1.060, end: 1.300 },
  { text: "have",    start: 1.300, end: 1.480 },
  { text: "a",       start: 1.480, end: 1.620 },
  { text: "digital", start: 1.620, end: 2.100 },
  { text: "reset",   start: 2.100, end: 2.740 },
  { text: "in",      start: 2.740, end: 3.080 },
  { text: "theta",   start: 3.080, end: 3.542, accent: true },
];

export const DEFAULT_HOOK: HookManifest = {
  text: "You're about to have a digital reset in theta.",
  audioPath: 'hook/hook_voice.mp3',
  audioSec: HOOK_AUDIO_SEC,
  frames: HOOK_FRAMES,
  words: DEFAULT_HOOK_WORDS,
};

// Frames the cold open occupies for a given run. The generator measures the
// real audio, so the length comes from the manifest, not a constant.
export function hookFrames(hook?: { audioSec?: number } | null): number {
  const sec = hook?.audioSec ?? DEFAULT_HOOK.audioSec;
  return Math.round(sec * 30);
}

const HookScreen: React.FC<{ words: HookWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const breath = 0.5 + 0.5 * Math.sin(t * 1.9);

  return (
    <AbsoluteFill style={{ backgroundColor: '#070811' }}>
      {/* A barely-there glow so the black reads as intentional, not empty. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 46%, rgba(182,221,204,${(
            0.03 + 0.028 * breath
          ).toFixed(3)}) 0%, rgba(7,8,17,0) 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 44%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      <AbsoluteFill
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {words.map((w, i) => {
          const isLast = i === words.length - 1;
          const fadeIn = interpolate(t, [w.start, w.start + 0.1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          // The final word holds until the snap cuts it away.
          const fadeOut = isLast
            ? 1
            : interpolate(t, [w.end - 0.04, w.end + 0.03], [1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
          const opacity = Math.min(fadeIn, fadeOut);
          if (opacity <= 0.002) return null;

          const rise = interpolate(t, [w.start, w.start + 0.18], [16, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          // Uppercase and heavy reads far larger than lowercase at the same
          // point size, and capital glyphs are much wider, so the fit divisor
          // is tuned for caps (0.74 em/char) to keep the longest word inside
          // the frame instead of touching the edges.
          const size = Math.max(104, Math.min(244, 920 / Math.max(2, w.text.length * 0.74)));

          return (
            <div
              key={i}
              style={{
                // Explicitly centred rather than relying on a flex container to
                // centre an absolutely positioned child.
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                transform: `translateY(calc(-50% + ${rise.toFixed(1)}px))`,
                textAlign: 'center',
                opacity,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: '0.01em',
                textTransform: 'uppercase',
                color: w.accent ? '#d7eadf' : 'rgba(244,247,250,0.98)',
                textShadow: w.accent
                  ? '0 0 52px rgba(215,234,223,0.38), 0 3px 30px rgba(7,8,17,0.95)'
                  : '0 3px 30px rgba(7,8,17,0.95)',
                whiteSpace: 'nowrap',
              }}
            >
              {w.text}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// The burst that lands with the snap: a theta-tinted radial pulse that expands
// and fades, so the cut into the session reads as a reset rather than a jump.
const TransitionPulse: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const d = frame - at;
  if (d < 0 || d > 18) return null;

  const opacity = interpolate(d, [0, 2, 18], [0, 0.62, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(d, [0, 18], [0.55, 1.75]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        transform: `scale(${scale.toFixed(3)})`,
        background:
          'radial-gradient(circle at 50% 50%, rgba(231,245,238,0.95) 0%, rgba(182,221,204,0.42) 20%, rgba(7,8,17,0) 56%)',
      }}
    />
  );
};

// SVG wave helpers — match the machine's getSinePath / getEntrainmentPath
function sinePath(freq: number, amp: number, time: number, speed: number, w: number, h: number): string {
  const pts: string[] = [];
  const visualFreq = freq * 0.05;
  for (let x = 0; x <= w; x += 4) {
    const y = h / 2 + Math.sin(x * visualFreq * 0.5 - time * speed * 1.5) * amp;
    pts.push(`${x},${(y * 0.8 + h * 0.1).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
}

function beatPath(freq: number, amp: number, time: number, speed: number, w: number, h: number): string {
  const pts: string[] = [];
  for (let x = 0; x <= w; x += 4) {
    const envelope = Math.sin(x * 0.015);
    const y = h / 2 + Math.sin(x * freq * 0.08 - time * speed * 1.2) * amp * envelope;
    pts.push(`${x},${(y * 0.8 + h * 0.1).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
}

function WaveCard({
  label,
  readout,
  color,
  border,
  path,
  waveW,
  waveH,
  glow,
}: {
  label: string;
  readout: string;
  color: string;
  border: string;
  path: string;
  waveW: number;
  waveH: number;
  glow?: boolean;
}) {
  return (
    <div
      style={{
        background: 'rgba(6,8,14,0.42)',
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: '12px 20px 8px',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color, letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color }}>{readout}</span>
      </div>
      <svg width={waveW} height={waveH} viewBox={`0 0 ${waveW} ${waveH}`} style={{ overflow: 'hidden', display: 'block' }}>
        {glow && (
          <defs>
            <filter id="glow-wave">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={glow ? 2.5 : 1.5}
          filter={glow ? 'url(#glow-wave)' : undefined}
          opacity={0.9}
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The session itself. Lives inside a <Sequence from={HOOK_FRAMES}>, so its
// frame counter is local and its own length is passed in explicitly.
// ---------------------------------------------------------------------------
const ShortBody: React.FC<CognistrationShortProps & { shortFrames: number }> = ({
  brainState,
  backgroundPath,
  carrierHz = 200,
  shortFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const time = frame / fps;
  const state = STATE_INFO[brainState] || STATE_INFO.theta;
  const rightHz = carrierHz + state.hz;

  const introFade = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: 'clamp' });
  const contentFade = interpolate(frame, [16, 44], [0, 1], { extrapolateRight: 'clamp' });

  // Last five seconds: the machine fades away and the app CTA takes over.
  const ctaStart = shortFrames - 150;
  const machineOut = interpolate(frame, [ctaStart, ctaStart + 55], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ctaFade = interpolate(frame, [ctaStart + 20, ctaStart + 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroFade = interpolate(frame, [shortFrames - 12, shortFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fade = introFade * outroFade;

  const waveW = width - 104; // 32px outer margins + 20px inner padding per side
  const waveH = 130;

  return (
    <>
      {/* ── LAYER 1: the HTML animation, running behind everything ──
          Optional: a sandbox without a working Chromium can render without it. */}
      {backgroundPath ? (
        <AbsoluteFill style={{ opacity: 0.62 }}>
          <OffthreadVideo
            src={staticFile(backgroundPath)}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AbsoluteFill>
      ) : null}

      {/* ── LAYER 2: scrim so the machine UI and copy stay readable ── */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg,
            rgba(7,8,17,0.72) 0%,
            rgba(7,8,17,0.34) 26%,
            rgba(7,8,17,0.30) 62%,
            rgba(7,8,17,0.86) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 34%, ${state.glowColor.replace(/0\.\d+/, '0.12')} 0%, transparent 62%)`,
        }}
      />

      <AbsoluteFill style={{ opacity: fade }}>

        {/* ── Top bar: state label (left) + app icon (right) ── */}
        <div style={{ position: 'absolute', top: 40, left: 34, zIndex: 20 }}>
          <span style={{
            fontFamily: MONO,
            fontSize: 14,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.62)',
            textShadow: '0 1px 10px rgba(7,8,17,0.9)',
          }}>
            {state.label} · {state.range}
          </span>
        </div>

        <div style={{
          position: 'absolute', top: 30, right: 30, zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            padding: 6,
            borderRadius: 20,
            background: 'rgba(6,8,14,0.45)',
            border: '1px solid rgba(255,255,255,0.16)',
            backdropFilter: 'blur(8px)',
          }}>
            <Img
              src={staticFile('images/cognistration-app-icon.png')}
              style={{ width: 78, height: 78, borderRadius: 15, display: 'block' }}
            />
          </div>
          <span style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}>
            App Store
          </span>
        </div>

        {/* ── Machine readout: frequencies + expected state ── */}
        <div style={{
          position: 'absolute', top: '20%', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          opacity: contentFade * machineOut,
        }}>
          <span style={{
            fontFamily: MONO, fontSize: 12, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
          }}>
            Cognistration session
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 76, fontWeight: 300, color: state.leftColor, letterSpacing: '-0.02em', lineHeight: 1, textShadow: '0 2px 24px rgba(7,8,17,0.9)' }}>{carrierHz}</span>
            <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 300, color: 'rgba(255,255,255,0.32)' }}>Hz</span>
            <span style={{ fontFamily: MONO, fontSize: 76, fontWeight: 300, color: state.rightColor, letterSpacing: '-0.02em', lineHeight: 1, textShadow: '0 2px 24px rgba(7,8,17,0.9)' }}>{rightHz.toFixed(1)}</span>
            <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 300, color: 'rgba(255,255,255,0.32)' }}>Hz</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.08em' }}>
            {state.hz.toFixed(1)} Hz binaural beat
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 32, fontWeight: 300, color: 'rgba(255,255,255,0.94)',
            letterSpacing: '-0.01em', marginTop: 6, textAlign: 'center', padding: '0 44px',
            textShadow: '0 2px 20px rgba(7,8,17,0.95)',
          }}>
            {state.outcome}
          </div>
        </div>

        {/* ── Machine waves: two carriers + the perceived beat ── */}
        <div style={{
          position: 'absolute', bottom: '19%', left: 32, right: 32,
          display: 'flex', flexDirection: 'column', gap: 18,
          opacity: contentFade * machineOut,
        }}>
          <WaveCard
            label="Left ear carrier"
            readout={`${carrierHz} Hz`}
            color={state.leftColor}
            border={`${state.leftColor}2e`}
            path={sinePath(carrierHz, 30, time, 1.2, waveW, waveH)}
            waveW={waveW}
            waveH={waveH}
          />
          <WaveCard
            label="Right ear carrier"
            readout={`${rightHz.toFixed(1)} Hz`}
            color={state.rightColor}
            border={`${state.rightColor}2e`}
            path={sinePath(rightHz, 30, time, 1.3, waveW, waveH)}
            waveW={waveW}
            waveH={waveH}
          />
          <WaveCard
            label="Perceived beat"
            readout={`${state.hz.toFixed(1)} Hz · ${state.label}`}
            color={state.beatColor}
            border={`${state.beatColor}33`}
            path={beatPath(state.hz, 40, time, 0.4, waveW, waveH)}
            waveW={waveW}
            waveH={waveH}
            glow
          />
        </div>

        {/* ── Closing CTA to the mobile app ── */}
        <AbsoluteFill style={{
          opacity: ctaFade,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 26,
          padding: '0 60px',
        }}>
          <Img
            src={staticFile('images/cognistration-app-icon.png')}
            style={{ width: 132, height: 132, borderRadius: 30, boxShadow: '0 12px 48px rgba(0,0,0,0.55)' }}
          />
          <div style={{
            fontFamily: SANS, fontSize: 40, fontWeight: 300, color: '#ffffff',
            letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.25,
            textShadow: '0 2px 24px rgba(7,8,17,0.95)',
          }}>
            Connect with your higher self
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 22, color: 'rgba(255,255,255,0.72)',
            textAlign: 'center', letterSpacing: '0.01em',
          }}>
            Guide your own brain states with the Cognistration app
          </div>
          <Img
            src={staticFile('images/download-on-the-app-store.svg')}
            style={{ width: 250, height: 'auto', display: 'block' }}
          />
          <div style={{
            fontFamily: MONO, fontSize: 17, color: '#b6ddcc', letterSpacing: '0.05em',
            border: '1px solid rgba(182,221,204,0.28)', borderRadius: 14,
            padding: '12px 28px', background: 'rgba(255,255,255,0.05)',
          }}>
            cognistration.com/machine
          </div>
        </AbsoluteFill>

      </AbsoluteFill>
    </>
  );
};

// The session's binaural track. It starts on the same frame as the snap, and
// both peak well below full scale on their own — summed at the cut they clip
// (measured 1.008 before this ramp). A short fade-in gives the snap the first
// ~0.6s of headroom, so the click lands clean and the tone swells under it.
const SessionAudio: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const gain = interpolate(frame, [0, 18], [0.12, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <Audio src={staticFile(src)} volume={gain} />;
};

// ---------------------------------------------------------------------------
// Composition root — cold open, snap, session
// ---------------------------------------------------------------------------
export const CognistrationShort: React.FC<CognistrationShortProps> = (props) => {
  const { durationInFrames } = useVideoConfig();
  const hook = props.hook ?? DEFAULT_HOOK;
  const frames = hookFrames(hook);
  const shortFrames = Math.max(1, durationInFrames - frames);

  return (
    <AbsoluteFill style={{ backgroundColor: '#070811' }}>

      {/* ── The whispered cold open, playing from frame 0 ── */}
      <Audio src={staticFile(hook.audioPath)} />

      {/* ── Blank screen with the words, exactly as long as the voice ── */}
      <Sequence durationInFrames={frames}>
        <HookScreen words={hook.words} />
      </Sequence>

      {/* ── The snap lands here and the session begins on the same frame ── */}
      <Sequence from={frames}>
        <Audio src={staticFile('hook/snap.mp3')} volume={0.62} />
      </Sequence>

      <Sequence from={frames}>
        <SessionAudio src={props.audioPath} />
        <ShortBody {...props} shortFrames={shortFrames} />
      </Sequence>

      {/* ── The pulse that lands with the snap, drawn over everything ── */}
      <TransitionPulse at={frames} />

    </AbsoluteFill>
  );
};
