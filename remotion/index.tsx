import { Composition, registerRoot } from 'remotion';
import { CognistrationShort, DEFAULT_HOOK, hookFrames } from './Composition';

const FPS = 30;

registerRoot(() => {
  return (
    <Composition
      id="CognistrationShort"
      component={CognistrationShort}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={65 * FPS + hookFrames(DEFAULT_HOOK)}
      defaultProps={{
        brainState: 'theta',
        audioPath: 'audio/theta.mp3',
        backgroundPath: 'backgrounds/2026-08-09-vertical-04-curl-field-weave.mp4',
        carrierHz: 200,
        durationSec: 65,
        hook: DEFAULT_HOOK,
      }}
      // Each queue item carries its own length (45s-75s) and its own cold
      // open, so the composition duration comes from the props: the session
      // length plus the measured length of that run's hook audio.
      calculateMetadata={({ props }) => {
        const p = props as { durationSec?: number; hook?: { audioSec?: number } };
        const seconds = Number(p.durationSec) || 65;
        return { durationInFrames: Math.round(seconds * FPS) + hookFrames(p.hook) };
      }}
    />
  );
});
