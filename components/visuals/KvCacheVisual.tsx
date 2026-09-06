"use client";

import { useState } from "react";
import Slider from "../Slider";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

export default function KvCacheVisual() {
  const [steps, setSteps] = useState(8);
  const [cacheOn, setCacheOn] = useState(true);

  // Without a cache, generating token n recomputes K/V for all n tokens.
  // With one, each step computes exactly one new token's K/V.
  const withoutCache = Math.round(useAnimatedNumber((steps * (steps + 1)) / 2));
  const withCache = Math.round(useAnimatedNumber(steps));
  const saved = withoutCache - withCache;
  const speedup = withCache === 0 ? 0 : withoutCache / withCache;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([true, false] as const).map((on) => (
          <button
            key={String(on)}
            onClick={() => setCacheOn(on)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              cacheOn === on
                ? "bg-accent text-on-accent border-accent"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {on ? "KV cache ON" : "KV cache OFF"}
          </button>
        ))}
      </div>

      <Slider
        label="Tokens generated"
        value={steps}
        min={2}
        max={16}
        onChange={setSteps}
        valueLabel={`${steps} tokens`}
        hint="Each row is one generation step. Filled squares are Key/Value vectors the model actually computes at that step."
      />

      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-max space-y-1">
          {Array.from({ length: steps }).map((_, row) => (
            <div key={row} className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-muted w-12 shrink-0 text-right pr-1">
                step {row + 1}
              </span>
              {Array.from({ length: steps }).map((_, col) => {
                const inSequence = col <= row;
                const isNew = col === row;
                const computed = cacheOn ? isNew : inSequence;
                const cached = cacheOn && inSequence && !isNew;
                return (
                  <div
                    key={col}
                    className="w-5 h-5 rounded-[3px] transition-colors duration-200"
                    style={{
                      background: computed
                        ? "var(--accent-warm)"
                        : cached
                        ? "color-mix(in srgb, var(--accent-2) 32%, transparent)"
                        : "var(--surface-2)",
                      opacity: inSequence ? 1 : 0.25,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ background: "var(--accent-warm)" }}
          />
          computed now
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ background: "color-mix(in srgb, var(--accent-2) 32%, transparent)" }}
          />
          reused from cache
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-[3px]"
            style={{ background: "var(--surface-2)" }}
          />
          not yet generated
        </span>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm space-y-1.5">
        <div>
          <span className="text-muted">K/V vectors computed without cache: </span>
          <span className="font-mono text-danger font-semibold">
            {withoutCache}
          </span>
        </div>
        <div>
          <span className="text-muted">With cache: </span>
          <span className="font-mono text-accent-2 font-semibold">
            {withCache}
          </span>
          <span className="text-muted">
            {" "}
            — {saved} fewer ({speedup.toFixed(1)}× less work)
          </span>
        </div>
        <p className="text-xs text-muted pt-1">
          Push the slider right: the gap widens quadratically. At 500 tokens
          it&apos;s 125,250 versus 500 — which is the difference between a
          chatbot that streams smoothly and one that grinds to a halt
          mid-sentence.
        </p>
      </div>
    </div>
  );
}
