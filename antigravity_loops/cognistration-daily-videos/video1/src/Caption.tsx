import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Caption: React.FC<{
  text: string;
}> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring physics setup for smooth bouncy pop-in animation
  const spr = spring({
    frame,
    fps,
    config: {
      damping: 10,
      mass: 0.4,
      stiffness: 120,
    },
  });

  const scale = interpolate(spr, [0, 1], [0.85, 1]);
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        fontSize: "54px",
        fontWeight: "900",
        color: "#00ffff", // Vibrant neon cyan
        textAlign: "center",
        fontFamily: "'Outfit', 'Impact', system-ui, -apple-system, sans-serif",
        textShadow: "0 0 15px rgba(0, 255, 255, 0.7), 0 0 25px rgba(0, 255, 255, 0.4), 0px 4px 15px rgba(0, 0, 0, 1)",
        padding: "0 20px",
        textTransform: "uppercase",
        letterSpacing: "3px",
        lineHeight: "1.35",
        whiteSpace: "pre-line",
      }}
    >
      {text}
    </div>
  );
};
