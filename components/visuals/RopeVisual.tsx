"use client";

import { useState } from "react";
import Slider from "../Slider";

const SIZE = 150;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 18;
const THETA = 0.45; // radians of rotation per position step

function rotated(baseAngle: number, position: number) {
  const angle = baseAngle + position * THETA;
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER - Math.sin(angle) * RADIUS,
    angle,
  };
}

function Dial({
  label,
  position,
  color,
  baseAngle,
}: {
  label: string;
  position: number;
  color: string;
  baseAngle: number;
}) {
  const tip = rotated(baseAngle, position);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-[130px] h-[130px]">
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
        <line
          x1={CENTER}
          y1={CENTER}
          x2={CENTER + RADIUS}
          y2={CENTER}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={CENTER}
          y1={CENTER}
          x2={tip.x}
          y2={tip.y}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ transition: "all 0.25s ease" }}
        />
        <circle cx={tip.x} cy={tip.y} r={4} fill={color} style={{ transition: "all 0.25s ease" }} />
        <circle cx={CENTER} cy={CENTER} r={2.5} fill="var(--muted)" />
      </svg>
      <span className="text-xs font-medium" style={{ color }}>
        {label}
      </span>
      <span className="text-[11px] font-mono text-muted">
        position {position}
      </span>
    </div>
  );
}

export default function RopeVisual() {
  const [posA, setPosA] = useState(2);
  const [posB, setPosB] = useState(5);

  const baseAngle = 0.6;
  const distance = Math.abs(posB - posA);
  // Dot product of two unit vectors rotated by their positions collapses to
  // cos of the angle between them — which depends only on (posB - posA).
  const dot = Math.cos((posB - posA) * THETA);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-6">
        <Dial
          label="Token A"
          position={posA}
          color="var(--accent)"
          baseAngle={baseAngle}
        />
        <Dial
          label="Token B"
          position={posB}
          color="var(--accent-2)"
          baseAngle={baseAngle}
        />
      </div>

      <Slider
        label="Position of token A"
        value={posA}
        min={0}
        max={16}
        onChange={setPosA}
        valueLabel={`${posA}`}
        hint="Each position rotates the token's vector a little further around the circle — its length never changes."
      />
      <Slider
        label="Position of token B"
        value={posB}
        min={0}
        max={16}
        onChange={setPosB}
        valueLabel={`${posB}`}
        hint="Now slide both tokens together, keeping the gap the same, and watch the attention score below refuse to budge."
      />

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm space-y-1.5">
        <div>
          <span className="text-muted">Distance between them: </span>
          <span className="font-mono text-accent-warm font-semibold">
            {distance}
          </span>
        </div>
        <div>
          <span className="text-muted">
            Their attention score (dot product):{" "}
          </span>
          <span className="font-mono text-accent-2 font-semibold">
            {dot.toFixed(3)}
          </span>
        </div>
        <p className="text-xs text-muted pt-1">
          Move both sliders by the same amount and the score stays identical —
          it only ever depends on the gap between the two positions, never on
          where they sit in absolute terms. That relative-position behaviour is
          the whole reason RoPE replaced the original additive encoding.
        </p>
      </div>
    </div>
  );
}
