import React from "react";
import { Series } from "remotion";
import { Scene, type SceneData } from "./Scene";

export interface VideoProps {
  scenes: SceneData[];
}

export const Video: React.FC<VideoProps> = ({ scenes }) => {
  if (!scenes || scenes.length === 0) {
    return null;
  }

  return (
    <Series>
      {scenes.map((scene, index) => (
        <Series.Sequence
          key={index}
          durationInFrames={scene.duration * 30}
          layout="none"
        >
          <Scene
            imageUrl={scene.imageUrl}
            audioUrl={scene.audioUrl}
            text={scene.text}
            duration={scene.duration}
          />
        </Series.Sequence>
      ))}
    </Series>
  );
};

export default Video;