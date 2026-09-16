import { AbsoluteFill, Audio, Img, Video, staticFile } from "remotion";
import { MachineOverlay } from "./MachineOverlay";
import metadataJson from "../public/video_metadata.json";

type VisualSource = {
  source: string;
  file: string;
  title?: string;
  orientation?: string;
  aspect_ratio?: string;
  manifest?: string;
  startFrame: number;
  duration: number;
};

type VideoMetadata = {
  durationInFrames?: number;
  visualSourceUrl: string;
  visualSource?: VisualSource[];
  appStoreAssetFile?: string;
};

const metadata = metadataJson as VideoMetadata;

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#070811" }}>
      {/* Full 90-second clean binaural tone; no audio fade or video edit effects. */}
      <Audio src={staticFile("audio.wav")} volume={1} />

      {/* Full-bleed randomized vertical Favorites visual. */}
      <Video
        src={staticFile("bishoptech_visual_background.mp4")}
        muted
        pauseWhenBuffering
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundColor: "#070811",
        }}
      />

      {/* Section 1: frequency animation at the top. */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          height: 570,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <MachineOverlay />
      </div>

      {/* Section 2: centered App Store badge. */}
      <div
        style={{
          position: "absolute",
          top: 650,
          left: 0,
          right: 0,
          height: 640,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <Img
          src={staticFile(metadata.appStoreAssetFile || "app_store_badge.png")}
          style={{
            width: 760,
            height: "auto",
            maxWidth: "78%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Section 3: the lower third remains the clean full-screen visual. */}
    </AbsoluteFill>
  );
};
