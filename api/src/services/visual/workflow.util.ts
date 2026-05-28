import fs from "fs/promises";
import path from "path";

export async function loadWorkflow(): Promise<Record<string, unknown>> {
  const workflowPath = path.join(process.cwd(), "workflow.json");
  const workflowContent = await fs.readFile(workflowPath, "utf-8");
  return JSON.parse(workflowContent) as Record<string, unknown>;
}

interface WorkflowNode {
  class_type?: string;
  inputs?: { text?: string; [key: string]: unknown };
  _meta?: { title?: string };
  [key: string]: unknown;
}

export function injectPrompt(
  workflow: Record<string, unknown>,
  prompt: string
): Record<string, unknown> {
  const cloned: Record<string, WorkflowNode> = JSON.parse(JSON.stringify(workflow));

  for (const node of Object.values(cloned)) {
    if (node._meta?.title === "positive prompt" && node.inputs) {
      node.inputs.text = prompt;
    }
  }

  return cloned;
}