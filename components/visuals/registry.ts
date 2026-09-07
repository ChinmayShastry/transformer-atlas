import type { Step } from "@/lib/types";
import RNNVisual from "./RNNVisual";
import AttentionIntroVisual from "./AttentionIntroVisual";
import SelfAttentionVisual from "./SelfAttentionVisual";
import MultiHeadVisual from "./MultiHeadVisual";
import PositionalEncodingVisual from "./PositionalEncodingVisual";
import BertGptVisual from "./BertGptVisual";
import ScalingVisual from "./ScalingVisual";
import TimelineVisual from "./TimelineVisual";
import RopeVisual from "./RopeVisual";
import KvCacheVisual from "./KvCacheVisual";
import MoeVisual from "./MoeVisual";

export const VISUALS: Record<Step["visual"], React.ComponentType> = {
  timeline: TimelineVisual,
  rnn: RNNVisual,
  "attention-intro": AttentionIntroVisual,
  selfattention: SelfAttentionVisual,
  multihead: MultiHeadVisual,
  posenc: PositionalEncodingVisual,
  rope: RopeVisual,
  bertgpt: BertGptVisual,
  kvcache: KvCacheVisual,
  scaling: ScalingVisual,
  moe: MoeVisual,
};

// Steps that read the shared sentence, so the same input travels the story.
export const USES_SENTENCE = new Set<Step["visual"]>([
  "rnn",
  "selfattention",
  "bertgpt",
]);

// The year each idea landed. Deliberately not a monotonic ticker: BERT (2018)
// comes after RoPE (2021) in the narrative, because the story follows ideas
// rather than the calendar. Shown as a label per section, never as a clock.
export const STEP_YEARS: Record<string, string> = {
  intro: "1986",
  "rnn-lstm": "1997",
  "attention-mechanism": "2015",
  "attention-is-all-you-need": "2017",
  "multi-head-attention": "2017",
  "positional-encoding": "2017",
  rope: "2021",
  "bert-vs-gpt": "2018",
  "kv-cache": "2019",
  "scaling-laws": "2020",
  moe: "2024",
};
