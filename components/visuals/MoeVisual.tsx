"use client";

import { useState } from "react";
import Slider from "../Slider";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

const PARAMS_PER_EXPERT_B = 8; // billions of parameters per expert, illustrative
const SHARED_PARAMS_B = 6; // attention layers etc., always active

// Deterministic pseudo-routing so the picture looks like a real router's
// choices rather than a fixed pattern, without re-randomising every render.
function routedExperts(token: number, total: number, active: number): number[] {
  const picks: number[] = [];
  let seed = token * 7 + 3;
  while (picks.length < Math.min(active, total)) {
    seed = (seed * 31 + 17) % 1000;
    const candidate = seed % total;
    if (!picks.includes(candidate)) picks.push(candidate);
  }
  return picks;
}

const TOKENS = ["The", "router", "picks", "experts"];

export default function MoeVisual() {
  const [totalExperts, setTotalExperts] = useState(8);
  const [activeExperts, setActiveExperts] = useState(2);
  const [token, setToken] = useState(0);

  const active = Math.min(activeExperts, totalExperts);
  const totalParams = Math.round(
    useAnimatedNumber(SHARED_PARAMS_B + totalExperts * PARAMS_PER_EXPERT_B)
  );
  const activeParams = Math.round(
    useAnimatedNumber(SHARED_PARAMS_B + active * PARAMS_PER_EXPERT_B)
  );
  const ratio = activeParams === 0 ? 0 : totalParams / activeParams;
  const chosen = routedExperts(token, totalExperts, active);

  return (
    <div className="space-y-6">
      <Slider
        label="Total experts in the layer"
        value={totalExperts}
        min={2}
        max={16}
        onChange={setTotalExperts}
        valueLabel={`${totalExperts} experts`}
        hint="Every expert's weights live in GPU memory all the time — this is what makes the model 'big'."
      />
      <Slider
        label="Experts activated per token"
        value={activeExperts}
        min={1}
        max={8}
        onChange={setActiveExperts}
        valueLabel={`top-${active}`}
        hint="Only these run for any given token — this is what determines the actual compute cost."
      />
      <Slider
        label="Which token is being routed"
        value={token}
        min={0}
        max={TOKENS.length - 1}
        onChange={setToken}
        valueLabel={`"${TOKENS[token]}"`}
        hint="The router picks different experts for different tokens — slide to watch the routing change."
      />

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {Array.from({ length: totalExperts }).map((_, i) => {
          const isActive = chosen.includes(i);
          return (
            <div
              key={i}
              className="rounded-lg border p-2 text-center transition-all duration-200"
              style={{
                borderColor: isActive ? "var(--accent-2)" : "var(--border)",
                background: isActive
                  ? "color-mix(in srgb, var(--accent-2) 16%, transparent)"
                  : "var(--surface-2)",
                opacity: isActive ? 1 : 0.45,
              }}
            >
              <div
                className="text-[10px] font-mono"
                style={{ color: isActive ? "var(--accent-2)" : "var(--muted)" }}
              >
                E{i + 1}
              </div>
              <div className="text-[9px] text-muted mt-0.5">
                {isActive ? "active" : "idle"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm space-y-1.5">
        <div>
          <span className="text-muted">Total parameters: </span>
          <span className="font-mono text-accent font-semibold">
            {totalParams}B
          </span>
          <span className="text-muted"> — all held in memory</span>
        </div>
        <div>
          <span className="text-muted">Active per token: </span>
          <span className="font-mono text-accent-2 font-semibold">
            {activeParams}B
          </span>
          <span className="text-muted"> — all you actually pay compute for</span>
        </div>
        <div>
          <span className="text-muted">So it thinks like a </span>
          <span className="font-mono text-accent-warm font-semibold">
            {totalParams}B
          </span>
          <span className="text-muted"> model but costs like a </span>
          <span className="font-mono text-accent-warm font-semibold">
            {activeParams}B
          </span>
          <span className="text-muted"> one ({ratio.toFixed(1)}× ratio).</span>
        </div>
      </div>
      <p className="text-xs text-muted">
        Parameter counts here are illustrative round numbers, not a specific
        real model — but the shape is exactly right, and it&apos;s why frontier
        labs moved to MoE rather than continuing to scale dense models.
      </p>
    </div>
  );
}
