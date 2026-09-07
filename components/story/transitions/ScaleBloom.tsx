"use client";

import { phase } from "@/lib/useScrollProgress";

const MAX_BLOCKS = 64;

export default function ScaleBloom({ progress }: { progress: number }) {
  const grow = phase(progress, 0.1, 0.9);
  const blocks = Math.max(1, Math.round(grow * MAX_BLOCKS));

  // Parameter counts move over orders of magnitude, so the counter walks the
  // exponent rather than the value — otherwise the first 99% of the scroll
  // would show almost no change.
  const params = Math.pow(10, 8 + grow * 4.1); // ~0.1B → ~1.3T
  const label =
    params >= 1e12
      ? `${(params / 1e12).toFixed(2)}T`
      : `${(params / 1e9).toFixed(1)}B`;

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="grid grid-cols-8 gap-1.5 mb-5">
          {Array.from({ length: MAX_BLOCKS }).map((_, i) => {
            const on = i < blocks;
            return (
              <div
                key={i}
                className="aspect-square rounded-[3px]"
                style={{
                  background: on
                    ? "color-mix(in srgb, var(--accent) 70%, transparent)"
                    : "var(--surface-2)",
                  opacity: on ? 1 : 0.35,
                  transition: "background 120ms linear",
                }}
              />
            );
          })}
        </div>

        <div className="flex items-baseline justify-between gap-4 mb-3">
          <span className="text-xs font-mono text-muted">
            {blocks} {blocks === 1 ? "block" : "blocks"}
          </span>
          <span className="font-mono text-2xl tabular-nums text-accent">
            {label}
          </span>
        </div>

        <div className="relative h-12">
          <p
            className="absolute inset-0 text-sm text-muted"
            style={{ opacity: 1 - phase(progress, 0.15, 0.5) }}
          >
            <span className="text-foreground font-medium">2017.</span> One
            block. Attention, a feed-forward layer, and not much else.
          </p>
          <p
            className="absolute inset-0 text-sm text-muted"
            style={{ opacity: phase(progress, 0.45, 0.85) }}
          >
            <span className="text-accent font-medium">Everything since.</span>{" "}
            The same block, stacked and widened. The design stopped changing —
            only the size did.
          </p>
        </div>
      </div>
    </div>
  );
}
