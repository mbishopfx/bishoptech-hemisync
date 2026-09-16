import { Img, staticFile } from "remotion";

export type WatermarkVariant = "logo" | "domain";

type CognistrationWatermarkProps = {
  variant: WatermarkVariant;
};

/** A deliberately visible but translucent brand mark across the source. */
export const CognistrationWatermark: React.FC<CognistrationWatermarkProps> = ({ variant }) => {
  if (variant === "domain") {
    return (
      <div
        style={{
          color: "rgba(255, 255, 255, 0.28)",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 58,
          fontWeight: 800,
          letterSpacing: 8,
          lineHeight: 1,
          textShadow: "0 2px 12px rgba(0, 0, 0, 0.65)",
          whiteSpace: "nowrap",
        }}
      >
        COGNISTRATION.COM
      </div>
    );
  }

  return (
    <Img
      src={staticFile("cognistration-app-icon.png")}
      style={{
        width: 260,
        height: 260,
        objectFit: "contain",
        opacity: 0.28,
        filter: "drop-shadow(0 2px 12px rgba(0, 0, 0, 0.65))",
      }}
    />
  );
};
