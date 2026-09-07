"use client";

import { useState } from "react";
import type { Step } from "@/lib/types";
import RNNVisual from "./visuals/RNNVisual";
import AttentionIntroVisual from "./visuals/AttentionIntroVisual";
import SelfAttentionVisual from "./visuals/SelfAttentionVisual";
import MultiHeadVisual from "./visuals/MultiHeadVisual";
import PositionalEncodingVisual from "./visuals/PositionalEncodingVisual";
import BertGptVisual from "./visuals/BertGptVisual";
import ScalingVisual from "./visuals/ScalingVisual";
import TimelineVisual from "./visuals/TimelineVisual";
import RopeVisual from "./visuals/RopeVisual";
import KvCacheVisual from "./visuals/KvCacheVisual";
import MoeVisual from "./visuals/MoeVisual";
import LiveGenerationPanel from "./LiveGenerationPanel";
import SentenceInput from "./SentenceInput";
import { eraPosition, ERAS } from "@/lib/eras";

const USES_SENTENCE = new Set<Step["visual"]>(["rnn", "selfattention", "bertgpt"]);

const VISUALS: Record<Step["visual"], React.ComponentType> = {
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

export default function StepCard({
  step,
  index,
  total,
}: {
  step: Step;
  index: number;
  total: number;
}) {
  const [showBody, setShowBody] = useState(false);
  const Visual = VISUALS[step.visual];
  const { era, eraNumber, indexInEra, isEraOpening } = eraPosition(step.id);

  return (
    <div key={step.id} className="animate-fade-in-up">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
        <span
          className="text-[11px] font-mono uppercase tracking-[0.14em]"
          style={{ color: era.color }}
        >
          {era.name}
        </span>
        <span className="text-[11px] font-mono text-muted">
          · {indexInEra + 1} of {era.stepIds.length} · step {index + 1}/{total}
        </span>
      </div>

      {isEraOpening && (
        <div
          className="mb-5 pl-4 border-l-2 animate-fade-in-up"
          style={{ borderColor: era.color }}
        >
          <p
            className="text-xs font-mono uppercase tracking-[0.12em] mb-1"
            style={{ color: era.color }}
          >
            Era {eraNumber} of {ERAS.length} — {era.kicker}
          </p>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            {era.blurb}
          </p>
        </div>
      )}
      <h2 className="font-serif text-[27px] leading-[1.22] font-semibold mb-3 text-foreground text-balance">
        {step.title}
      </h2>
      <p className="text-base text-accent-2/90 leading-relaxed mb-6 max-w-2xl">
        {step.oneliner}
      </p>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6 mb-4">
        {USES_SENTENCE.has(step.visual) && <SentenceInput />}
        <Visual />
      </div>

      {step.id === "scaling-laws" && (
        <div className="mb-4">
          <LiveGenerationPanel />
        </div>
      )}

      <button
        onClick={() => setShowBody((s) => !s)}
        className="text-sm text-accent hover:brightness-110 font-medium"
      >
        {showBody ? "Hide the full explanation ▲" : "Read the full explanation ▼"}
      </button>

      {showBody && (
        <div className="mt-3 rounded-lg border border-border bg-surface-2/30 p-4 animate-fade-in-up">
          {step.body.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-sm text-muted leading-relaxed mb-3 last:mb-0"
            >
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
