export interface SceneOutput {
  orderNo: number;
  text: string;
  visual: string;
  duration: number;
}

export interface ScriptOutput {
  title: string;
  scenes: SceneOutput[];
}

export interface AIProvider {
  generateScript(topic: string): Promise<ScriptOutput>;
}
