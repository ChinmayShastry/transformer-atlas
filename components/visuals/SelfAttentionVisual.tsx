"use client";

import { useEffect, useState } from "react";
import Slider from "../Slider";
import TokenAttentionBars from "./TokenAttentionBars";
import { softmax } from "@/lib/math";
import { useSentence } from "../SentenceContext";
import { tokenizeSentence, relatednessScores } from "@/lib/similarity";

export default function SelfAttentionVisual() {
  const { sentence } = useSentence();
  const tokens = tokenizeSentence(sentence, 12);
  const [queryIndex, setQueryIndex] = useState(0);

  useEffect(() => {
    if (queryIndex > tokens.length - 1) {
      setQueryIndex(Math.max(0, tokens.length - 1));
    }
  }, [tokens.length, queryIndex]);

  if (tokens.length < 2) {
    return (
      <p className="text-sm text-muted">
        Type at least two words in the sentence box above to see
        self-attention in action.
      </p>
    );
  }

  const weights = softmax(relatednessScores(tokens, queryIndex));

  return (
    <div className="space-y-6">
      <Slider
        label="Query token"
        value={queryIndex}
        min={0}
        max={tokens.length - 1}
        onChange={setQueryIndex}
        valueLabel={`"${tokens[queryIndex]}"`}
        hint="Every token attends to every other token at once — slide to change which token is doing the attending, and watch its full attention pattern redraw, live, on your own sentence."
      />
      <TokenAttentionBars
        tokens={tokens}
        weights={weights}
        highlightIndex={queryIndex}
      />
      <p className="text-xs text-muted">
        These scores come from a simple word-adjacency + repeated-word
        heuristic running on the sentence you typed above — not a trained
        model. The point is the mechanism: every token scores every other
        token, all in one step, no matter how far apart they are.
      </p>
    </div>
  );
}
