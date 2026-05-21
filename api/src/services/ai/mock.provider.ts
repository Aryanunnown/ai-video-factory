import { AIProvider, ScriptOutput, SceneOutput } from "./ai.provider";

const sceneDefinitions = [
  {
    label: "Intro",
    prompt: (topic: string) => `Open with the core idea behind ${topic} and why viewers should care right away.`,
    visual: (topic: string) => `A cinematic opening shot with bold text overlay of \"${topic}\" and dynamic motion graphics.`,
  },
  {
    label: "Current usage",
    prompt: (topic: string) => `Describe how ${topic} is being used today across real-world workflows and teams.`,
    visual: (topic: string) => `Footage of professionals using modern tools and systems that highlight ${topic} in action.`,
  },
  {
    label: "Benefits",
    prompt: (topic: string) => `Break down the main benefits of ${topic}, focusing on speed, accuracy, and reduced work.`,
    visual: (topic: string) => `Animated icons and scenes showing productivity gains and happier teams thanks to ${topic}.`,
  },
  {
    label: "Challenges",
    prompt: (topic: string) => `Cover common challenges or misconceptions around ${topic} and how to overcome them.`,
    visual: (topic: string) => `A scene with contrasting visuals that show obstacles and the path forward for ${topic}.`,
  },
  {
    label: "Future",
    prompt: (topic: string) => `Project the future of ${topic} and what the next wave of adoption looks like.`,
    visual: (topic: string) => `A futuristic montage of intelligent systems, collaboration, and seamless automation for ${topic}.`,
  },
];

const getDuration = (index: number) => 6 + ((index * 2) % 5);

export class MockProvider implements AIProvider {
  async generateScript(topic: string): Promise<ScriptOutput> {
    const normalizedTopic = topic.trim();
    const title = normalizedTopic ? `${normalizedTopic} Explained` : "AI Video Script";

    const scenes: SceneOutput[] = sceneDefinitions.map((scene, index) => ({
      orderNo: index + 1,
      text: scene.prompt(normalizedTopic),
      visual: scene.visual(normalizedTopic),
      duration: getDuration(index),
    }));

    return {
      title,
      scenes,
    };
  }
}
