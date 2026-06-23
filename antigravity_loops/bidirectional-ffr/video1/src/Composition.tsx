import { AbsoluteFill, Sequence, staticFile, Img, Video, Audio, useCurrentFrame } from "remotion";
import timings from "../public/timings.json";

const Slide = ({ img, duration }) => {
  const frame = useCurrentFrame();
  const isVideo = img.toLowerCase().endsWith(".mp4");
  
  if (isVideo) {
    return (
      <AbsoluteFill style={{ backgroundColor: "white", overflow: "hidden" }}>
        <Video
          src={staticFile(img)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          startFrom={0}
        />
      </AbsoluteFill>
    );
  }
  
  // Cinematic Ken Burns slow zoom (from 1.0 to 1.08 over the duration of the slide)
  const scale = 1 + (frame / duration) * 0.08;
  
  return (
    <AbsoluteFill style={{ backgroundColor: "white", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Img
        src={staticFile(img)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`
        }}
      />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Audio src={staticFile("audio.mp3")} />
      {timings.map((t, idx) => (
        <Sequence key={idx} from={t.startFrame} durationInFrames={t.duration} layout="none">
          <Slide img={t.img} duration={t.duration} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
