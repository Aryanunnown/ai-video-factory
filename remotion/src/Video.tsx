import React from "react";
import {
  Series,
  Audio,
  staticFile,
} from "remotion";
import { Scene, type SceneData } from "./Scene";

export interface VideoProps {
  scenes: SceneData[];
  backgroundMusicUrl?: string;
}

export const Video: React.FC<VideoProps> = ({ scenes, backgroundMusicUrl }) => {
  if (!scenes || scenes.length === 0) {
    return null;
  }

  return (
    <>
      {backgroundMusicUrl && (
        <Audio
          src={staticFile(backgroundMusicUrl)}
          volume={0.1}
          loop
        />
      )}
      <Series>
        {scenes.map((scene, index) => (
          <Series.Sequence
            key={index}
            durationInFrames={Math.round(scene.duration * 30)}
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
    </>
  );
};

export default Video;