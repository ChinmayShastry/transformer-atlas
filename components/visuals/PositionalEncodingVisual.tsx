"use client";

import { useState } from "react";
import Slider from "../Slider";

const SEQ_LEN = 32;
const DIMS = 4;
const D_MODEL = 16;
// Themed via CSS variables so both palettes get hues that actually contrast
// with their own background. On the light theme the four sit close together in
// lightness, so each curve also carries its own dash pattern — that keeps them
// separable when they overlap, and for colour-blind readers in either theme.
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];
const DASHES = ["none", "6 3", "2 3", "9 3 2 3"];

function encode(pos: number, dim: number): number {
  const freq = 1 / Math.pow(10000, (2 * Math.floor(dim / 2)) / D_MODEL);
  return dim % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq);
}

const WIDTH = 560;
const HEIGHT = 140;

export default function PositionalEncodingVisual() {
  const [pos, setPos] = useState(4);

  const paths = Array.from({ length: DIMS }).map((_, d) => {
    const points = Array.from({ length: SEQ_LEN }).map((_, p) => {
      const x = (p / (SEQ_LEN - 1)) * WIDTH;
      const y = HEIGHT / 2 - encode(p, d) * (HEIGHT / 2 - 8);
      // Rounded because Math.sin/cos are not bit-identical between Node and
      // the browser: unrounded values serialise differently on each side and
      // React reports a hydration mismatch for every curve.
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return points.join(" ");
  });

  const markerX = (pos / (SEQ_LEN - 1)) * WIDTH;

  return (
    <div className="space-y-6">
      <Slider
        label="Token position"
        value={pos}
        min={0}
        max={SEQ_LEN - 1}
        onChange={setPos}
        valueLabel={`position ${pos}`}
        hint="Each curve is one dimension of the positional encoding, at a different frequency. Together, every position gets a unique fingerprint."
      />
      <div className="rounded-lg border border-border bg-surface-2/40 p-3 overflow-x-auto scrollbar-thin">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full min-w-[480px]"
          height={HEIGHT}
        >
          <line
            x1="0"
            y1={HEIGHT / 2}
            x2={WIDTH}
            y2={HEIGHT / 2}
            stroke="var(--border)"
          />
          {paths.map((pts, d) => (
            <polyline
              key={d}
              points={pts}
              fill="none"
              stroke={COLORS[d]}
              strokeWidth={1.75}
              strokeDasharray={DASHES[d] === "none" ? undefined : DASHES[d]}
              opacity={0.9}
            />
          ))}
          <line
            x1={markerX}
            y1="0"
            x2={markerX}
            y2={HEIGHT}
            stroke="var(--accent-warm)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </svg>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: DIMS }).map((_, d) => (
          <div
            key={d}
            className="flex items-center gap-2 rounded-md border border-border bg-surface-2/40 px-3 py-1.5 text-xs font-mono"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: COLORS[d] }}
            />
            dim {d}: {encode(pos, d).toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
