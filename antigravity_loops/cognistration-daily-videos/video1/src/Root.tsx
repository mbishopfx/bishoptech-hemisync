import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import metadataJson from "../public/video_metadata.json";

type VideoMetadata = {
  durationInFrames?: number;
};

const metadata = metadataJson as VideoMetadata;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={metadata.durationInFrames || 2700}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
