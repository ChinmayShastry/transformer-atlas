"use client";

import { useState } from "react";
import Slider from "../Slider";
import TokenAttentionBars from "./TokenAttentionBars";
import { softmax } from "@/lib/math";

const TOKENS = [
  "The",
  "trophy",
  "didn't",
  "fit",
  "in",
  "the",
  "suitcase",
  "because",
  "it",
  "was",
  "too",
  "big",
];

// Hand-tuned toy relevance scores of every word against the query word "it" —
// illustrating the classic Winograd-schema style coreference: "it" should
// resolve to "trophy", not "suitcase", because of "too big".
const RAW_SCORES = [
  0.5, 2.2, 0.3, 0.8, 0.4, 0.5, 1.0, 0.3, 1.6, 0.3, 0.6, 0.9,
];

const QUERY_INDEX = 8; // "it"

export default function AttentionIntroVisual() {
  const [sharpness, setSharpness] = useState(1.5);
  const weights = softmax(RAW_SCORES.map((s) => s * sharpness));

  return (
    <div className="space-y-6">
      <Slider
        label="Focus sharpness"
        value={sharpness}
        min={0.3}
        max={4}
        step={0.1}
        onChange={setSharpness}
        valueLabel={sharpness.toFixed(1)}
        hint={
          'The query word is "it". Drag right to sharpen attention onto the most relevant word; drag left to spread it out evenly.'
        }
      />
      <TokenAttentionBars
        tokens={TOKENS}
        weights={weights}
        highlightIndex={QUERY_INDEX}
      />
      <p className="text-xs text-muted">
        This is a hand-tuned illustration of what attention scores could look
        like for this sentence — real weights come from learned Query/Key
        vectors, not this formula. The point is the mechanism: relevance
        scores → softmax → a weighted look-back over every earlier word.
      </p>
    </div>
  );
}
