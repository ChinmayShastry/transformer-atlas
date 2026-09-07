"use client";

import { useScrollProgress } from "@/lib/useScrollProgress";
import RecurrenceDissolve from "./transitions/RecurrenceDissolve";
import ScaleBloom from "./transitions/ScaleBloom";

const TRANSITIONS = {
  "recurrence-dissolve": RecurrenceDissolve,
  "scale-bloom": ScaleBloom,
} as const;

interface EraTransitionProps {
  kind: keyof typeof TRANSITIONS;
  eyebrow: string;
  headline: string;
}

export default function EraTransition({
  kind,
  eyebrow,
  headline,
}: EraTransitionProps) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const Visual = TRANSITIONS[kind];

  return (
    // Tall enough that there is real scroll distance to scrub through, with
    // the panel pinned in the middle of it. svh rather than vh so mobile
    // browser chrome appearing does not resize the pin mid-scroll.
    <div ref={ref} className="relative h-[200vh]">
      <div className="sticky top-0 h-[100svh] flex items-center">
        <div className="w-full max-w-3xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-3">
            {eyebrow}
          </p>
          <h2 className="font-serif text-[28px] sm:text-[36px] leading-[1.15] font-semibold mb-6 text-balance">
            {headline}
          </h2>
          <Visual progress={progress} />
          <div
            className="mt-5 h-[2px] rounded-full bg-surface-2 overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full bg-accent"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
