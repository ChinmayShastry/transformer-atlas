// The eleven steps group into three arcs. These are themes rather than strict
// date ranges — BERT (2018) predates RoPE (2021), so labelling them as
// consecutive periods would be quietly wrong.

export interface Era {
  id: string;
  name: string;
  kicker: string;
  blurb: string;
  color: string;
  stepIds: string[];
}

export const ERAS: Era[] = [
  {
    id: "before",
    name: "Before Transformers",
    kicker: "the memory problem",
    blurb:
      "Three decades of trying to make a machine hold on to what it just read — and the bottleneck none of it could shake.",
    color: "var(--accent-2)",
    stepIds: ["intro", "rnn-lstm", "attention-mechanism"],
  },
  {
    id: "transformer",
    name: "The Transformer",
    kicker: "the architecture",
    blurb:
      "One paper removes recurrence entirely. The core design has barely changed since.",
    color: "var(--accent)",
    stepIds: [
      "attention-is-all-you-need",
      "multi-head-attention",
      "positional-encoding",
      "rope",
    ],
  },
  {
    id: "llm",
    name: "The LLM Era",
    kicker: "scale, and serving it",
    blurb:
      "The same architecture, relentlessly scaled — plus the engineering that makes it fast enough to actually use.",
    color: "var(--accent-warm)",
    stepIds: ["bert-vs-gpt", "kv-cache", "scaling-laws", "moe"],
  },
];

export function eraOf(stepId: string): Era {
  return ERAS.find((e) => e.stepIds.includes(stepId)) ?? ERAS[0];
}

export function eraPosition(stepId: string): {
  era: Era;
  eraNumber: number;
  indexInEra: number;
  isEraOpening: boolean;
} {
  const era = eraOf(stepId);
  const indexInEra = era.stepIds.indexOf(stepId);
  return {
    era,
    eraNumber: ERAS.indexOf(era) + 1,
    indexInEra,
    isEraOpening: indexInEra === 0,
  };
}
