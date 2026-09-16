import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import metadataJson from "../public/video_metadata.json";

type VideoMetadata = {
  carrierFrom?: number;
  carrierTo?: number;
  deltaFrom?: number;
  deltaTo?: number;
};

const metadata = metadataJson as VideoMetadata;

export const MachineOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Load sweep parameters from metadata, with safe fallbacks
  const carrierFrom = metadata.carrierFrom ?? 220;
  const carrierTo = metadata.carrierTo ?? 220;
  const deltaFrom = metadata.deltaFrom ?? 10;
  const deltaTo = metadata.deltaTo ?? 6;

  // Calculate instantaneous frequencies for the current frame
  const currentCarrier = interpolate(frame, [0, durationInFrames], [carrierFrom, carrierTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentDelta = interpolate(frame, [0, durationInFrames], [deltaFrom, deltaTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leftFreq = Math.round(currentCarrier);
  const rightFreq = Math.round(currentCarrier + currentDelta);
  const deltaFreq = Math.round(currentDelta);

  // Use frequency-range labels as audio-design references, not brain-state claims.
  let rangeLabel = "LOWER RANGE";
  if (deltaFreq >= 2 && deltaFreq < 4) rangeLabel = "DELTA-RANGE";
  else if (deltaFreq >= 4 && deltaFreq < 8) rangeLabel = "THETA-RANGE";
  else if (deltaFreq >= 8 && deltaFreq < 13) rangeLabel = "ALPHA-RANGE";
  else if (deltaFreq >= 13 && deltaFreq < 30) rangeLabel = "BETA-RANGE";
  else if (deltaFreq >= 30) rangeLabel = "GAMMA-RANGE";

  const time = frame * 0.15; // Animation speed multiplier

  // Mathematical sine generator for drawing vector waves
  const getSinePath = (freq: number, amp: number, speedMultiplier: number) => {
    const points = [];
    const width = 800;
    const height = 40;
    const visualFreq = freq * 0.006;
    
    for (let x = 0; x <= width; x += 10) {
      const y = height / 2 + Math.sin((x * visualFreq) - (time * speedMultiplier)) * amp;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const getDifferentialPath = (freq: number, amp: number, speedMultiplier: number) => {
    const points = [];
    const width = 800;
    const height = 60;
    for (let x = 0; x <= width; x += 10) {
      const envelope = Math.sin(x * 0.015); // visual interference pattern
      const y = height / 2 + Math.sin((x * freq * 0.03) - (time * speedMultiplier)) * amp * envelope;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div
      style={{
        width: "920px",
        backgroundColor: "rgba(9, 9, 11, 0.88)", // Sleek dark glassmorphism
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        padding: "24px 36px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* 1. Left Ear Carrier */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "1.5px", color: "#22d3ee" }}>LEFT EAR CARRIER (L)</span>
          <span style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: "800", color: "#22d3ee" }}>{leftFreq} HZ</span>
        </div>
        <svg width="100%" height="40" style={{ overflow: "visible" }}>
          <path d={getSinePath(leftFreq, 12, 1.2)} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
        </svg>
      </div>

      {/* 2. Right Ear Carrier */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "1.5px", color: "#c084fc" }}>RIGHT EAR CARRIER (R)</span>
          <span style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: "800", color: "#c084fc" }}>{rightFreq} HZ</span>
        </div>
        <svg width="100%" height="40" style={{ overflow: "visible" }}>
          <path d={getSinePath(rightFreq, 12, 1.4)} fill="none" stroke="#c084fc" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "2px 0" }} />

      {/* 3. Binaural Beat */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: "800", letterSpacing: "1.5px", color: "#38bdf8" }}>TWO-TONE DIFFERENTIAL (R - L)</span>
          <span style={{ fontSize: "16px", fontFamily: "monospace", fontWeight: "800", color: "#38bdf8" }}>{deltaFreq} HZ ({rangeLabel})</span>
        </div>
        <svg width="100%" height="60" style={{ overflow: "visible" }}>
          <path
            d={getDifferentialPath(deltaFreq, 16, 1.0)}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            style={{ filter: "drop-shadow(0px 0px 6px rgba(34, 211, 238, 0.5))" }}
          />
        </svg>
      </div>
    </div>
  );
};
export default MachineOverlay;
