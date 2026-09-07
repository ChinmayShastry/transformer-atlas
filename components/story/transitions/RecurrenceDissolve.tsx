"use client";

import { useSentence } from "@/components/SentenceContext";
import { tokenizeSentence } from "@/lib/similarity";
import { lerp, phase } from "@/lib/useScrollProgress";

const W = 620;
const H = 210;
const MARGIN = 46;
const BASE_Y = H - 46;

export default function RecurrenceDissolve({ progress }: { progress: number }) {
  const { displaySentence } = useSentence();
  const tokens = tokenizeSentence(displaySentence, 7);
  const n = Math.max(tokens.length, 2);

  const x = (i: number) =>
    n === 1 ? W / 2 : MARGIN + (i * (W - MARGIN * 2)) / (n - 1);

  // Deliberately overlapping ranges. Tighter, sequential fades left a dead
  // zone near the middle where the chain had gone and the arcs had not yet
  // arrived, so the picture briefly emptied. Crossing over between 0.3 and
  // 0.55 keeps something legible throughout, and the moment where both are
  // visible at once is the point of the whole transition.
  const chain = 1 - phase(progress, 0.15, 0.6);
  const fan = phase(progress, 0.25, 0.7);
  const last = n - 1;

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="The recurrent chain dissolving into direct attention connections"
        >
          {/* Direct connections from the final token back to every earlier one */}
          {tokens.map((_, i) => {
            if (i === last) return null;
            const x1 = x(last);
            const x2 = x(i);
            const span = Math.abs(x1 - x2);
            const lift = Math.min(120, 34 + span * 0.42);
            return (
              <path
                key={`arc-${i}`}
                d={`M ${x1} ${BASE_Y - 20} Q ${(x1 + x2) / 2} ${BASE_Y - lift} ${x2} ${BASE_Y - 20}`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={1.6}
                opacity={fan * 0.85}
              />
            );
          })}

          {/* The recurrent chain: each step handing off to the next */}
          {tokens.map((_, i) => {
            if (i === last) return null;
            return (
              <line
                key={`chain-${i}`}
                x1={x(i) + 15}
                y1={BASE_Y - 20}
                x2={x(i + 1) - 15}
                y2={BASE_Y - 20}
                stroke="var(--muted)"
                strokeWidth={1.6}
                opacity={chain * 0.9}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          <defs>
            <marker
              id="arrowhead"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="2.5"
              orient="auto"
            >
              <path d="M0,0 L6,2.5 L0,5 z" fill="var(--muted)" />
            </marker>
          </defs>

          {tokens.map((tok, i) => {
            // At the start, earlier words are faint: their signal has decayed
            // by the time the chain reaches the end. At the finish they are all
            // equally reachable.
            const decayed = 0.18 + 0.82 * (i / Math.max(1, last));
            const o = lerp(decayed, 1, progress);
            return (
              <g key={`tok-${i}`} opacity={o}>
                <circle
                  cx={x(i)}
                  cy={BASE_Y - 20}
                  r={13}
                  fill="color-mix(in srgb, var(--accent) 18%, transparent)"
                  stroke="var(--accent)"
                  strokeWidth={1.4}
                />
                <text
                  x={x(i)}
                  y={BASE_Y + 14}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--muted)"
                  style={{ fontFamily: "var(--font-mono), monospace" }}
                >
                  {tok.length > 9 ? tok.slice(0, 8) + "…" : tok}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Captions crossfade in the same box so the layout never jumps */}
        <div className="relative mt-4 h-12">
          <p
            className="absolute inset-0 text-sm text-muted"
            style={{ opacity: chain }}
          >
            <span className="text-foreground font-medium">Recurrence.</span>{" "}
            Every word reaches the next only by passing through the one before
            it — and fades a little at each hop.
          </p>
          <p
            className="absolute inset-0 text-sm text-muted"
            style={{ opacity: fan }}
          >
            <span className="text-accent font-medium">Attention.</span> Every
            word reaches every other directly, in one step, no matter how far
            back it sits.
          </p>
        </div>
      </div>
    </div>
  );
}
