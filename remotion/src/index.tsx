import React from "react";
import { Composition, registerRoot, type AnyZodObject } from "remotion";
import { Video, type VideoProps } from "./Video";

type VideoCompositionProps = VideoProps & Record<string, unknown>;

const defaultProps: VideoCompositionProps = {
  scenes: [],
};

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<AnyZodObject, VideoCompositionProps>
        id="VideoShorts"
        component={Video}
        calculateMetadata={({ props, isRendering }) => {
          if (!props.scenes || props.scenes.length === 0) {
            if (isRendering) {
              throw new Error("Cannot render VideoShorts without scene props");
            }

            return {
              durationInFrames: 300,
            };
          }

          const totalFrames = props.scenes.reduce((total, scene) => total + Math.round(scene.duration * 30), 0);
          console.log(`[Composition] Calculated durationInFrames from scenes: ${totalFrames}`);

          return {
            durationInFrames: Math.max(totalFrames, 30),
          };
        }}
        fps={30}
        width={540}
        height={960}
        defaultProps={defaultProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);
