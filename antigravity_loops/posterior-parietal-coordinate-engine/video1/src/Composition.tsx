import { AbsoluteFill, Sequence, staticFile, Img, Audio } from "remotion";
import timings from "../public/timings.json";

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Audio src={staticFile("audio.mp3")} />
      {timings.map((t, idx) => (
        <Sequence key={idx} from={t.startFrame} durationInFrames={t.duration} layout="none">
          <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
            <Img
              src={staticFile(t.img)}
              style={{
                width: "1080px",
                height: "1080px",
                objectFit: "contain"
              }}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
