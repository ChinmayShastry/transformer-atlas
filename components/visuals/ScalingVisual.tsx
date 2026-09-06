"use client";

import { useState } from "react";
import Slider from "../Slider";

const SIZES = [
  {
    label: "GPT-2 Small",
    params: "124M",
    completion: "The weather today is weather today is the is.",
    capability: 0.12,
  },
  {
    label: "GPT-2 XL",
    params: "1.5B",
    completion: "The weather today is nice weather, is nice today outside.",
    capability: 0.32,
  },
  {
    label: "GPT-3",
    params: "175B",
    completion:
      "The weather today is sunny with a light breeze and mild temperatures.",
    capability: 0.62,
  },
  {
    label: "GPT-4 class",
    params: "~1.8T (est.)",
    completion:
      "The weather today is sunny and mild, with a gentle breeze — perfect for a walk outside.",
    capability: 0.85,
  },
  {
    label: "gpt-4o-mini class",
    params: "optimized, undisclosed",
    completion:
      "The weather today is beautifully sunny with a light breeze, mild temperatures around 22°C, and barely a cloud in sight — a great day to be outside.",
    capability: 1,
  },
];

const CHART_W = 480;
const CHART_H = 110;

export default function ScalingVisual() {
  const [i, setI] = useState(2);
  const size = SIZES[i];

  const points = SIZES.map((s, idx) => {
    const x = (idx / (SIZES.length - 1)) * CHART_W;
    const y = CHART_H - s.capability * (CHART_H - 12) - 6;
    return { x, y };
  });
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-6">
      <Slider
        label="Model scale"
        value={i}
        min={0}
        max={SIZES.length - 1}
        onChange={setI}
        valueLabel={`${size.label} (${size.params})`}
        hint="Same architecture, same prompt, wildly different fluency — this is what 'scaling laws' actually look like in practice."
      />

      <div className="rounded-lg border border-border bg-surface-2/40 p-3">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          height={CHART_H}
        >
          <polyline
            points={linePoints}
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth={2}
          />
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={idx === i ? 5 : 3}
              fill={idx === i ? "var(--accent-warm)" : "var(--accent-2)"}
            />
          ))}
        </svg>
        <div className="flex justify-between mt-1">
          {SIZES.map((s, idx) => (
            <span
              key={idx}
              className={`text-[10px] ${
                idx === i ? "text-accent-warm font-semibold" : "text-muted"
              }`}
            >
              {s.params}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3">
        <p className="text-xs text-muted mb-1">
          Prompt: <span className="font-mono">&quot;The weather today is&quot;</span>
        </p>
        <p className="text-sm font-mono text-foreground leading-relaxed">
          {size.completion}
        </p>
      </div>
      <p className="text-xs text-muted">
        These completions are illustrative, written to show the trend real
        research documents (incoherent → fluent → nuanced) — not live
        outputs from each actual model. Try the panel below for a real
        gpt-4o-mini completion.
      </p>
    </div>
  );
}
