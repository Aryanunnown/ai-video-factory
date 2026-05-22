import Groq from "groq-sdk";
import { AIProvider, ScriptOutput, SceneOutput } from "./ai.provider";

export class GroqProvider implements AIProvider {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateScript(topic: string): Promise<ScriptOutput> {
    const normalizedTopic = topic.trim();

    const prompt = `You are a professional video script writer. Generate a JSON response for a video about "${normalizedTopic}".

Generate exactly 5 scenes. Each scene should have:
- orderNo: sequential number from 1 to 5
- text: a concise script/narration for the scene (2-3 sentences)
- visual: a description of the visual content or shot for the scene
- duration: the duration in seconds (between 6-12 seconds)

IMPORTANT: Return ONLY valid JSON in the following format, with no additional text:
{
  "title": "A compelling title for the video about ${normalizedTopic}",
  "scenes": [
    {
      "orderNo": 1,
      "text": "Scene script here",
      "visual": "Visual description here",
      "duration": 8
    },
    {
      "orderNo": 2,
      "text": "Scene script here",
      "visual": "Visual description here",
      "duration": 8
    },
    {
      "orderNo": 3,
      "text": "Scene script here",
      "visual": "Visual description here",
      "duration": 8
    },
    {
      "orderNo": 4,
      "text": "Scene script here",
      "visual": "Visual description here",
      "duration": 8
    },
    {
      "orderNo": 5,
      "text": "Scene script here",
      "visual": "Visual description here",
      "duration": 8
    }
  ]
}`;

    try {
      const message = await this.groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText =
        message.choices[0]?.message?.content || "";

      if (!responseText) {
        throw new Error("Empty response from Groq API");
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsedScript = JSON.parse(jsonMatch[0]);

      this.validateScriptOutput(parsedScript);

      return parsedScript as ScriptOutput;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON response: ${error.message}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred while generating script");
    }
  }

  private validateScriptOutput(script: unknown): void {
    if (!script || typeof script !== "object") {
      throw new Error("Invalid script output: not an object");
    }

    const scriptObj = script as Record<string, unknown>;

    if (typeof scriptObj.title !== "string" || !scriptObj.title.trim()) {
      throw new Error("Invalid script output: missing or empty title");
    }

    if (!Array.isArray(scriptObj.scenes)) {
      throw new Error("Invalid script output: scenes is not an array");
    }

    if (scriptObj.scenes.length !== 5) {
      throw new Error(
        `Invalid script output: expected exactly 5 scenes, got ${scriptObj.scenes.length}`
      );
    }

    scriptObj.scenes.forEach((scene: unknown, index: number) => {
      this.validateSceneOutput(scene, index);
    });
  }

  private validateSceneOutput(scene: unknown, index: number): void {
    if (!scene || typeof scene !== "object") {
      throw new Error(`Invalid scene at index ${index}: not an object`);
    }

    const sceneObj = scene as Record<string, unknown>;

    if (typeof sceneObj.orderNo !== "number" || sceneObj.orderNo !== index + 1) {
      throw new Error(
        `Invalid scene at index ${index}: orderNo should be ${index + 1}`
      );
    }

    if (typeof sceneObj.text !== "string" || !sceneObj.text.trim()) {
      throw new Error(
        `Invalid scene at index ${index}: missing or empty text`
      );
    }

    if (typeof sceneObj.visual !== "string" || !sceneObj.visual.trim()) {
      throw new Error(
        `Invalid scene at index ${index}: missing or empty visual`
      );
    }

    if (
      typeof sceneObj.duration !== "number" ||
      sceneObj.duration < 1 ||
      sceneObj.duration > 60
    ) {
      throw new Error(
        `Invalid scene at index ${index}: duration should be a number between 1 and 60`
      );
    }
  }
}
