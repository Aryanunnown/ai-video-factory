import { AIProvider, ScriptOutput, SceneOutput } from "./ai.provider";

export class MockProvider implements AIProvider {
  async generateScript(topic: string): Promise<ScriptOutput> {
    const title = `${topic} Explained`;

    const scenes: SceneOutput[] = [
      {
        orderNo: 1,
        text: `Introduce the concept of ${topic} and why it matters in everyday life.`,
        visual: `Close-up animated title card showing \"${topic}\" with subtle motion graphics.`,
        duration: 8,
      },
      {
        orderNo: 2,
        text: `Explain the key ideas behind ${topic} in a clear and friendly way.`,
        visual: `An illustrated whiteboard animation breaking down ${topic} into simple parts.`,
        duration: 8,
      },
      {
        orderNo: 3,
        text: `Show a practical example of ${topic} being used or observed.`,
        visual: `A dynamic scene of a person interacting with a device or environment related to ${topic}.`,
        duration: 8,
      },
      {
        orderNo: 4,
        text: `Highlight the benefits and common misconceptions to help viewers understand better.`,
        visual: `A split-screen comparison illustrating the right and wrong approaches to ${topic}.`,
        duration: 8,
      },
      {
        orderNo: 5,
        text: `Wrap up with a strong takeaway and encourage viewers to explore ${topic} further.`,
        visual: `A closing montage with uplifting visuals and a call-to-action overlay.`,
        duration: 8,
      },
    ];

    return {
      title,
      scenes,
    };
  }
}
