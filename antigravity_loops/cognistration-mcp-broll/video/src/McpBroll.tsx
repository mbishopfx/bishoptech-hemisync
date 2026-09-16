import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import type { CSSProperties } from 'react';
import { brollCards, type BrollCard } from './catalog';

export const MCP_BROLL_FPS = 30;
export const MCP_BROLL_DURATION = 28 * MCP_BROLL_FPS;

const CARD_DURATION = 35;
const TRANSITION_DURATION = 10;
const BACKGROUND_CYCLE = 240;
const backgroundAssets = [
  'aurora-current-01.png',
  'aurora-current-02.png',
  'aurora-current-03.png',
  'aurora-current-04.png',
];

const ease = Easing.bezier(0.22, 1, 0.36, 1);

function clampProgress(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}

function AuroraBackground() {
  const frame = useCurrentFrame();
  const cycleFrame = frame % (BACKGROUND_CYCLE * backgroundAssets.length);
  const backgroundIndex = Math.floor(cycleFrame / BACKGROUND_CYCLE);
  const localFrame = cycleFrame % BACKGROUND_CYCLE;
  const nextIndex = (backgroundIndex + 1) % backgroundAssets.length;
  const crossfade = clampProgress(localFrame, BACKGROUND_CYCLE - 42, BACKGROUND_CYCLE);

  const imageStyle = (index: number, opacity: number): CSSProperties => ({
    position: 'absolute',
    inset: '-3%',
    width: '106%',
    height: '106%',
    objectFit: 'cover',
    opacity,
    transform: `scale(${1.035 + Math.sin(frame / 180 + index) * 0.008}) translate3d(${Math.sin(frame / 240 + index) * 0.4}%, ${Math.cos(frame / 270 + index) * 0.3}%, 0)`,
    filter: 'saturate(1.12) contrast(1.04)',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#02060d', overflow: 'hidden' }}>
      <Img src={staticFile(backgroundAssets[backgroundIndex])} style={imageStyle(backgroundIndex, 1 - crossfade)} />
      <Img src={staticFile(backgroundAssets[nextIndex])} style={imageStyle(nextIndex, crossfade)} />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 46%, rgba(116, 216, 191, 0.17), transparent 31%), radial-gradient(circle at 52% 55%, rgba(96, 111, 218, 0.10), transparent 46%)',
          mixBlendMode: 'screen',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(2, 6, 13, 0.72) 0%, rgba(2, 6, 13, 0.24) 36%, rgba(2, 6, 13, 0.24) 64%, rgba(2, 6, 13, 0.72) 100%), linear-gradient(180deg, rgba(2, 6, 13, 0.28), rgba(2, 6, 13, 0.52))',
        }}
      />
    </AbsoluteFill>
  );
}

function TextCard({ card, xPercent, opacity, blur, scale }: {
  card: BrollCard;
  xPercent: number;
  opacity: number;
  blur: number;
  scale: number;
}) {
  const isSkill = card.kind === 'skill';
  const fontSize = isSkill ? 64 : card.names.length === 1 ? 66 : 54;
  const nameStyle: CSSProperties = {
    color: '#ffffff',
    fontFamily: isSkill ? '"Avenir Next", "Helvetica Neue", Arial, sans-serif' : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize,
    fontWeight: isSkill ? 500 : 500,
    letterSpacing: isSkill ? '-0.055em' : '-0.045em',
    lineHeight: isSkill ? 1.04 : 1.16,
    whiteSpace: 'nowrap',
    textShadow: '0 3px 24px rgba(0, 0, 0, 0.58), 0 0 42px rgba(181, 238, 217, 0.12)',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '92%',
        textAlign: 'center',
        transform: `translate(-50%, -50%) translateX(${xPercent}vw) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        zIndex: 3,
      }}
    >
      <div style={{ display: 'grid', gap: isSkill ? 16 : 12, justifyItems: 'center' }}>
        {card.names.map((name) => <div key={name} style={nameStyle}>{name}</div>)}
      </div>
    </div>
  );
}

function CurrentCard({ card, index, localFrame }: { card: BrollCard; index: number; localFrame: number }) {
  const isFirst = index === 0;
  const isLast = index === brollCards.length - 1;
  const entering = isFirst && localFrame < TRANSITION_DURATION;
  const leaving = localFrame >= CARD_DURATION - TRANSITION_DURATION;

  if (entering) {
    const progress = clampProgress(localFrame, 0, TRANSITION_DURATION);
    return <TextCard card={card} xPercent={-106 + 106 * progress} opacity={progress} blur={8 * (1 - progress)} scale={0.965 + progress * 0.035} />;
  }

  if (leaving) {
    const progress = clampProgress(localFrame, CARD_DURATION - TRANSITION_DURATION, CARD_DURATION);
    const exitDistance = isLast ? 106 : 106;
    return <TextCard card={card} xPercent={exitDistance * progress} opacity={1 - progress} blur={6 * progress} scale={1 - progress * 0.025} />;
  }

  return <TextCard card={card} xPercent={0} opacity={1} blur={0} scale={1} />;
}

function NextCard({ card, localFrame }: { card: BrollCard; localFrame: number }) {
  const progress = clampProgress(localFrame, CARD_DURATION - TRANSITION_DURATION, CARD_DURATION);
  return <TextCard card={card} xPercent={-106 + 106 * progress} opacity={progress} blur={8 * (1 - progress)} scale={0.965 + progress * 0.035} />;
}

export const McpBroll = () => {
  const frame = useCurrentFrame();
  const cardIndex = Math.min(Math.floor(frame / CARD_DURATION), brollCards.length - 1);
  const localFrame = frame - cardIndex * CARD_DURATION;
  const globalFade = interpolate(frame, [0, 18, MCP_BROLL_DURATION - 18, MCP_BROLL_DURATION], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const nextCard = brollCards[cardIndex + 1];

  return (
    <AbsoluteFill style={{ backgroundColor: '#02060d', opacity: globalFade }}>
      <AuroraBackground />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(8, 19, 25, 0.06), rgba(1, 4, 8, 0.24) 72%)' }} />
      <CurrentCard card={brollCards[cardIndex]} index={cardIndex} localFrame={localFrame} />
      {nextCard && localFrame >= CARD_DURATION - TRANSITION_DURATION && <NextCard card={nextCard} localFrame={localFrame} />}
    </AbsoluteFill>
  );
};
