import { AbsoluteFill, Img, OffthreadVideo, staticFile, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CognistrationWatermark } from "./Watermark";
import metadataJson from "../public/clip_metadata.json";

type CameraCut = { startFrame: number; endFrame: number; scale: number; xPct: number; yPct: number };
type FocusPoint = { frame: number; xPct: number; yPct: number; facePresent?: boolean; confidence?: number };
type ClosingCard = { asset: string; startFrame: number; durationFrames: number; fadeInFrames?: number };
type ClipMetadata = {
  durationInFrames: number;
  cameraCuts: CameraCut[];
  focusTrack?: FocusPoint[];
  closingCard?: ClosingCard;
  watermarkVariant?: "logo" | "domain";
};

const metadata = metadataJson as ClipMetadata;

const focusAtFrame = (frame: number, points: FocusPoint[]) => {
  if (points.length === 0) {
    return { xPct: 50, yPct: 50 };
  }
  const nextIndex = points.findIndex((point) => point.frame >= frame);
  if (nextIndex <= 0) {
    return { xPct: points[0].xPct, yPct: points[0].yPct };
  }
  if (nextIndex === -1) {
    const last = points[points.length - 1];
    return { xPct: last.xPct, yPct: last.yPct };
  }
  const previous = points[nextIndex - 1];
  const next = points[nextIndex];
  const span = Math.max(1, next.frame - previous.frame);
  const progress = Math.min(1, Math.max(0, (frame - previous.frame) / span));
  return {
    xPct: previous.xPct + (next.xPct - previous.xPct) * progress,
    yPct: previous.yPct + (next.yPct - previous.yPct) * progress,
  };
};

export const ClipComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const focus = focusAtFrame(frame, metadata.focusTrack ?? []);
  const cut = metadata.cameraCuts.find((item) => frame >= item.startFrame && frame < item.endFrame)
    ?? metadata.cameraCuts[metadata.cameraCuts.length - 1]
    ?? { startFrame: 0, endFrame: durationInFrames, scale: 1.02, xPct: 0, yPct: 0 };
  const cutProgress = interpolate(frame, [cut.startFrame, cut.startFrame + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(cutProgress, [0, 1], [cut.scale * 0.985, cut.scale]);
  const closingCard = metadata.closingCard;
  const closingStart = closingCard?.startFrame ?? Math.max(0, durationInFrames - 60);
  const closingEnd = closingStart + (closingCard?.durationFrames ?? 60);
  const closingOpacity = closingCard && frame >= closingStart
    ? interpolate(
        frame,
        [closingStart, closingStart + (closingCard?.fadeInFrames ?? 15), closingEnd],
        [0, 1, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    : 0;
  const sourceOpacity = Math.max(0, 1 - closingOpacity);
  const watermarkVariant = metadata.watermarkVariant === "domain" ? "domain" : "logo";
  return (
    <AbsoluteFill style={{ backgroundColor: "#050507", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("source.mp4")}
        className="sourceVideo"
        volume={sourceOpacity}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectPosition: `${focus.xPct}% ${focus.yPct}%`,
          transform: `translate(${cut.xPct / 2}%, ${cut.yPct / 2}%) scale(${scale})`,
          transformOrigin: "center center",
          opacity: sourceOpacity,
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,0) 38%, rgba(0,0,0,.32))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(-50%)",
          zIndex: 12,
          pointerEvents: "none",
        }}
      >
        <CognistrationWatermark variant={watermarkVariant} />
      </div>
      {closingCard ? (
        <AbsoluteFill
          style={{
            backgroundColor: "#050507",
            opacity: closingOpacity,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img
            src={staticFile(closingCard.asset)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
