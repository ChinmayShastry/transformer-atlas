export type VisualKey =
  | "timeline"
  | "rnn"
  | "attention-intro"
  | "selfattention"
  | "multihead"
  | "posenc"
  | "bertgpt"
  | "scaling";

export interface Step {
  id: string;
  title: string;
  oneliner: string;
  visual: VisualKey;
  body: string;
  source: string;
}
