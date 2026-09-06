export type VisualKey =
  | "timeline"
  | "rnn"
  | "attention-intro"
  | "selfattention"
  | "multihead"
  | "posenc"
  | "rope"
  | "bertgpt"
  | "kvcache"
  | "scaling"
  | "moe";

export interface Step {
  id: string;
  title: string;
  oneliner: string;
  visual: VisualKey;
  body: string;
  source: string;
}
