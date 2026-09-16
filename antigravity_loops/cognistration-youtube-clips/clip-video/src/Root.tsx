import "./index.css";
import { Composition } from "remotion";
import metadataJson from "../public/clip_metadata.json";
import { ClipComposition } from "./Composition";
import { LandscapeLetterboxComposition } from "./LandscapeLetterboxComposition";

type ClipMetadata = { durationInFrames?: number };
const metadata = metadataJson as ClipMetadata;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ClipComp"
      component={ClipComposition}
      durationInFrames={metadata.durationInFrames || 1350}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="ClipLandscapeLetterbox"
      component={LandscapeLetterboxComposition}
      durationInFrames={metadata.durationInFrames || 1350}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
