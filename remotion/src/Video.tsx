import React from "react";
import { Series } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene, type SceneData } from "./Scene";

export interface VideoProps {
  scenes: SceneData[];
}

export const Video: React.FC<VideoProps> = ({ scenes }) => {
  if (!scenes || scenes.length === 0) {
    return null;
  }

  return (
    <TransitionSeries>
      {scenes.map((scene, index) => {
        const sceneDuration = scene.duration * 30;
        const isLastScene = index === scenes.length - 1;

        return (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence durationInFrames={sceneDuration}>
              <Scene
                imageUrl={scene.imageUrl}
                audioUrl={scene.audioUrl}
                text={scene.text}
                duration={scene.duration}
              />
            </TransitionSeries.Sequence>
            {!isLastScene && (
              <TransitionSeries.Transition
                durationInFrames={15}
                presentation={fade()}
              />
            )}
          </React.Fragment>
        );
      })}
    </TransitionSeries>
  );
};

export default Video;