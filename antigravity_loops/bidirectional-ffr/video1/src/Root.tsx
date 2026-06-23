import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import timings from "../public/timings.json";

export const RemotionRoot: React.FC = () => {
  const totalDuration = timings.reduce((acc, t) => acc + t.duration, 0);
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={totalDuration}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MyCompVertical"
        component={MyComposition}
        durationInFrames={totalDuration}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
