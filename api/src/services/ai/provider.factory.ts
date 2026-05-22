import { AIProvider } from "./ai.provider";
import { MockProvider } from "./mock.provider";
import { GroqProvider } from "./groq.provider";

export function getAIProvider(): AIProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase() || "mock";

  switch (provider) {
    case "groq":
      return new GroqProvider();
    case "mock":
      return new MockProvider();
    default:
      throw new Error(
        `Unknown LLM_PROVIDER: ${provider}. Supported values: "mock", "groq"`
      );
  }
}
