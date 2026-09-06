"use client";

import { Fragment, useEffect, useState } from "react";
import Slider from "../Slider";
import { useSentence } from "../SentenceContext";
import { tokenizeSentence } from "@/lib/similarity";

export default function BertGptVisual() {
  const { sentence } = useSentence();
  const WORDS = tokenizeSentence(sentence, 14);
  const N = WORDS.length;
  const [mode, setMode] = useState<"bert" | "gpt">("gpt");
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (pos > N - 1) setPos(Math.max(0, N - 1));
  }, [N, pos]);

  if (N < 2) {
    return (
      <p className="text-sm text-muted">
        Type at least two words in the sentence box above to see the
        BERT/GPT masking difference.
      </p>
    );
  }

  const visible = (row: number, col: number) =>
    mode === "bert" ? true : col <= row;

  const visibleWords = WORDS.filter((_, j) => visible(pos, j));

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["gpt", "bert"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              mode === m
                ? "bg-accent text-on-accent border-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {m === "gpt" ? "GPT — autoregressive" : "BERT — bidirectional"}
          </button>
        ))}
      </div>

      <Slider
        label="Current token"
        value={pos}
        min={0}
        max={N - 1}
        onChange={setPos}
        valueLabel={`"${WORDS[pos]}"`}
        hint="Slide through your sentence and see what each mode allows that token to look at."
      />

      <div className="overflow-x-auto scrollbar-thin">
        <div
          className="grid gap-1 min-w-max"
          style={{ gridTemplateColumns: `80px repeat(${N}, 40px)` }}
        >
          <div />
          {WORDS.map((w, j) => (
            <div
              key={j}
              className="text-[10px] text-muted text-center truncate px-0.5"
            >
              {w}
            </div>
          ))}
          {WORDS.map((rowWord, i) => (
            <Fragment key={i}>
              <div
                key={`label-${i}`}
                className={`text-xs pr-2 flex items-center justify-end truncate ${
                  i === pos ? "text-accent-warm font-semibold" : "text-muted"
                }`}
              >
                {rowWord}
              </div>
              {WORDS.map((_, j) => (
                <div
                  key={`${i}-${j}`}
                  className="aspect-square rounded-[3px] transition-colors duration-200"
                  style={{
                    background: visible(i, j)
                      ? "color-mix(in srgb, var(--accent-2) 55%, transparent)"
                      : "var(--surface-2)",
                    outline:
                      i === pos ? "1.5px solid var(--accent-warm)" : "none",
                    outlineOffset: "-1.5px",
                  }}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm">
        <span className="text-muted">The token </span>
        <span className="text-accent-warm font-mono">
          &quot;{WORDS[pos]}&quot;
        </span>
        <span className="text-muted"> can see: </span>
        <span className="font-mono text-accent-2">
          {visibleWords.join(", ")}
        </span>
      </div>
    </div>
  );
}
