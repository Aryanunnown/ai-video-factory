import React from "react";
import { Composition, registerRoot } from "remotion";
import { Video, type SceneData } from "./Video";

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoShorts"
        component={Video}
        durationInFrames={(props: { scenes: SceneData[] }) =>
          props.scenes.reduce((total, scene) => total + scene.duration * 30, 0)
        }
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