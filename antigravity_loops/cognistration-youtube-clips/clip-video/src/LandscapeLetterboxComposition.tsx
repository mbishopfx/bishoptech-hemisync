import "./index.css";
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { CognistrationWatermark } from "./Watermark";
import metadataJson from "../public/clip_metadata.json";

type ClipMetadata = {
  watermarkVariant?: "logo" | "domain";
};

const metadata = metadataJson as ClipMetadata;

export const LandscapeLetterboxComposition: React.FC = () => {
  const watermarkVariant = metadata.watermarkVariant === "domain" ? "domain" : "logo";

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("source.mp4")}
        className="letterboxVideo"
        volume={1}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectPosition: "center center",
        }}
      />

      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,.22), rgba(0,0,0,0) 35%, rgba(0,0,0,.22))",
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

      <div
        style={{
          position: "absolute",
          top: 112,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: 1.5,
          textShadow: "0 3px 14px rgba(0,0,0,.9)",
        }}
      >
        cognistration.com
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 92,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          textShadow: "0 3px 14px rgba(0,0,0,.9)",
        }}
      >
        <Img
          src={staticFile("cognistration-app-icon.png")}
          style={{
            width: 116,
            height: 116,
            borderRadius: 26,
            boxShadow: "0 0 0 2px rgba(255,255,255,.65), 0 8px 24px rgba(0,0,0,.5)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 0.5 }}>
            Get Cognistration for iOS
          </div>
          <div style={{ fontSize: 27, fontWeight: 500, color: "#6ddcff" }}>
            Available on the App Store
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
