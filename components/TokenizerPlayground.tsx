"use client";

import { useMemo, useState } from "react";
import Slider from "./Slider";
import { tokenize } from "@/lib/tokenizer";

const SAMPLE =
  "Transformers revolutionized natural language understanding by replacing recurrence with self-attention.";

const PALETTE = [
  "rgba(124,157,255,0.35)",
  "rgba(94,234,212,0.3)",
  "rgba(242,166,90,0.32)",
  "rgba(242,117,90,0.28)",
  "rgba(167,139,250,0.32)",
];

export default function TokenizerPlayground() {
  const [text, setText] = useState(SAMPLE);
  const [threshold, setThreshold] = useState(4);

  const tokens = useMemo(() => tokenize(text, threshold), [text, threshold]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-2">Tokenizer Playground</h2>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        Every LLM breaks text into tokens — chunks that are sometimes whole
        words, sometimes word-pieces — before it can process anything. Type
        below and watch it split live. This is a simplified simulation built
        for intuition, not the real GPT tokenizer.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 300))}
        rows={3}
        className="w-full rounded-lg border border-border bg-surface px-3.5 py-3 text-sm font-mono mb-5 focus:outline-none focus:border-accent resize-none"
      />

      <div className="mb-6">
        <Slider
          label="Split threshold (word length before splitting)"
          value={threshold}
          min={3}
          max={10}
          onChange={setThreshold}
          valueLabel={`${threshold} chars`}
          hint="Lower = more aggressive splitting into smaller sub-word pieces, closer to how real tokenizers handle rare/long words."
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 min-h-[90px] flex flex-wrap gap-1.5 content-start">
        {tokens.length === 0 && (
          <span className="text-sm text-muted">Start typing above…</span>
        )}
        {tokens.map((t, i) => (
          <span
            key={i}
            className="text-sm font-mono px-2 py-1 rounded-md border border-border/60"
            style={{
              background: PALETTE[i % PALETTE.length],
              marginLeft: t.isContinuation ? "-2px" : undefined,
            }}
          >
            {t.text}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted mt-3">
        {tokens.length} token{tokens.length === 1 ? "" : "s"} · pieces
        starting with{" "}
        <span className="font-mono text-accent-2">##</span> are continuations
        of the previous word, the same convention WordPiece tokenizers (used
        by BERT) use.
      </p>
    </div>
  );
}
