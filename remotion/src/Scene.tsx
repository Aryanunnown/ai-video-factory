import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";

export interface SceneData {
  imageUrl: string;
  audioUrl: string;
  text: string;
  duration: number;
}

export interface SceneProps {
  imageUrl: string;
  audioUrl: string;
  text: string;
  duration: number;
}

export const Scene: React.FC<SceneProps> = ({
  imageUrl,
  audioUrl,
  text,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = duration * fps;

  const scale = interpolate(
    frame,
    [0, totalFrames],
    [1, 1.2],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }
  );

  const kenBurnsX = interpolate(
    frame,
    [0, totalFrames],
    [0, -60],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }
  );

  const kenBurnsY = interpolate(
    frame,
    [0, totalFrames],
    [0, -40],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Img
          src={imageUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${kenBurnsX}px, ${kenBurnsY}px)`,
            transformOrigin: "center center",
          }}
        />
        <AbsoluteFill
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      <Sequence from={20}>
        <SubtitleOverlay text={text} duration={duration} />
      </Sequence>

      {audioUrl && (
        <Audio
          src={audioUrl}
          startFrom={0}
        />
      )}
    </AbsoluteFill>
  );
};

interface SubtitleOverlayProps {
  text: string;
  duration: number;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ text, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = duration * fps;

  const textOpacity = spring({
    frame,
    fps,
    config: {
      stiffness: 100,
      damping: 20,
    },
    delay: 0,
    durationInFrames: 30,
  });

  const words = text.split(" ");

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 60px",
        paddingBottom: "160px",
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: "52px",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.3,
          textShadow: "0 2px 10px rgba(0,0,0,0.8)",
          opacity: textOpacity,
          maxWidth: "100%",
        }}
      >
        {words.map((word, index) => (
          <WordFadeIn
            key={index}
            word={word}
            index={index}
            totalWords={words.length}
            totalFrames={totalFrames}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

interface WordFadeInProps {
  word: string;
  index: number;
  totalWords: number;
  totalFrames: number;
}

const WordFadeIn: React.FC<WordFadeInProps> = ({
  word,
  index,
  totalWords,
  totalFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wordDelay = totalFrames / totalWords;

  const wordOpacity = spring({
    frame,
    fps,
    config: {
      stiffness: 150,
      damping: 20,
    },
    delay: index * wordDelay,
    durationInFrames: Math.floor(wordDelay) + 40,
  });

  const wordTranslateY = spring({
    frame,
    fps,
    config: {
      stiffness: 150,
      damping: 20,
    },
    delay: index * wordDelay,
    durationInFrames: Math.floor(wordDelay) + 40,
    reverse: true,
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity: wordOpacity,
        transform: `translateY(${20 * (1 - wordTranslateY)}px)`,
        marginRight: "5px",
      }}
    >
      {word}
    </span>
  );
};

export default Scene;