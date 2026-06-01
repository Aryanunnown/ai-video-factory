import React from "react";
import { Composition, registerRoot } from "remotion";
import { Video } from "./Video";

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoShorts"
        component={Video}
        durationInFrames={300}
        calculateDurationInFrames={(props: { scenes: { duration: number }[] }) => {
          const totalFrames = props.scenes.reduce((total, scene) => total + scene.duration * 30, 0);
          return totalFrames || 300;
        }}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          scenes: [],
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
