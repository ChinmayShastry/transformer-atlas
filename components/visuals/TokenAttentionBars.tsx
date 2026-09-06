"use client";

interface TokenAttentionBarsProps {
  tokens: string[];
  weights: number[];
  highlightIndex: number;
}

export default function TokenAttentionBars({
  tokens,
  weights,
  highlightIndex,
}: TokenAttentionBarsProps) {
  const maxWeight = Math.max(...weights);

  return (
    // The scroll container must be the parent: putting overflow-x-auto on the
    // same element as min-w-max makes it grow instead of scroll.
    <div className="overflow-x-auto scrollbar-thin">
      <div className="relative min-w-max">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {tokens.map((_, i) => {
            if (i === highlightIndex) return null;
            const w = weights[i];
            const x1 = `${(highlightIndex / (tokens.length - 1)) * 100}%`;
            const x2 = `${(i / (tokens.length - 1)) * 100}%`;
            return (
              <line
                key={i}
                x1={x1}
                y1="8"
                x2={x2}
                y2="8"
                stroke="var(--accent)"
                strokeWidth={Math.max(0.5, (w / maxWeight) * 3)}
                opacity={Math.max(0.08, w / maxWeight) * 0.7}
              />
            );
          })}
        </svg>
        <div className="flex items-end gap-1 pb-2 relative">
          {tokens.map((tok, i) => {
            const w = weights[i];
            const intensity = w / maxWeight;
            const isQuery = i === highlightIndex;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 flex-1 min-w-[54px]"
              >
                <span className="text-[11px] font-mono text-muted tabular-nums">
                  {(w * 100).toFixed(0)}%
                </span>
                <div className="w-full h-20 rounded-md bg-surface-2 flex items-end overflow-hidden border border-border">
                  <div
                    className="w-full transition-all duration-300 ease-out"
                    style={{
                      height: `${Math.max(4, intensity * 100)}%`,
                      background: isQuery
                        ? "var(--accent-warm)"
                        : `color-mix(in srgb, var(--accent) ${Math.round(
                            30 + intensity * 70
                          )}%, transparent)`,
                    }}
                  />
                </div>
                <span
                  className={`text-xs text-center px-1 py-0.5 rounded ${
                    isQuery
                      ? "text-accent-warm font-semibold border border-accent-warm/50"
                      : "text-foreground"
                  }`}
                >
                  {tok}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
