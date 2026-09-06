"use client";

import { useState } from "react";
import Slider from "../Slider";

const N = 6;
const HEAD_NAMES = [
  "local syntax",
  "sentence start",
  "next-token",
  "periodic",
];

function cellValue(headIndex: number, i: number, j: number): number {
  const type = headIndex % 4;
  if (type === 0) return Math.exp(-Math.abs(i - j) / 1.3);
  if (type === 1) return j === 0 ? 0.95 : 0.12 + 0.05 * Math.cos(i);
  if (type === 2) return j === i + 1 ? 0.92 : 0.08 + 0.04 * Math.sin(j);
  return Math.abs(Math.sin((i + j + headIndex) * 0.9));
}

export default function MultiHeadVisual() {
  const [heads, setHeads] = useState(3);

  return (
    <div className="space-y-6">
      <Slider
        label="Number of attention heads"
        value={heads}
        min={1}
        max={8}
        onChange={setHeads}
        valueLabel={`${heads} head${heads > 1 ? "s" : ""}`}
        hint="Each head runs self-attention independently and can specialize in a different kind of relationship."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: heads }).map((_, h) => (
          <div
            key={h}
            className="rounded-lg border border-border bg-surface-2/40 p-2.5 animate-fade-in-up"
          >
            <div
              className="grid gap-[2px] mb-2"
              style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}
            >
              {Array.from({ length: N * N }).map((_, idx) => {
                const i = Math.floor(idx / N);
                const j = idx % N;
                const v = cellValue(h, i, j);
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-[2px]"
                    style={{
                      background: `rgba(94, 234, 212, ${Math.min(1, v)})`,
                    }}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-muted leading-tight">
              Head {h + 1}
              <br />
              <span className="text-foreground/70">
                {HEAD_NAMES[h % 4]}-like pattern
              </span>
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        These patterns are illustrative, not extracted from a real trained
        model — but the specialization they depict (some heads track nearby
        words, some track sentence position, some track the next token) is
        exactly what researchers observe when they visualize real trained
        Transformer heads.
      </p>
    </div>
  );
}
