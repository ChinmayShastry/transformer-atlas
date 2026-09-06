"use client";

import { useState } from "react";
import { MILESTONES } from "@/lib/milestones";

export default function TimelineVisual() {
  const [active, setActive] = useState(4);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="flex min-w-max gap-0 px-1">
          {MILESTONES.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex flex-col items-center gap-2 px-3 py-2 group focus:outline-none"
            >
              <span
                className={`text-[11px] font-mono transition-colors ${
                  active === i ? "text-accent-warm" : "text-muted"
                }`}
              >
                {m.year}
              </span>
              <span
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  active === i
                    ? "bg-accent-warm border-accent-warm scale-125"
                    : "bg-surface-2 border-border group-hover:border-accent"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="h-0.5 bg-border mx-4 -mt-[38px] relative -z-10" />
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3.5 animate-fade-in-up" key={active}>
        <p className="text-sm font-semibold text-accent-warm mb-1">
          {MILESTONES[active].year} — {MILESTONES[active].label}
        </p>
        <p className="text-sm text-muted leading-relaxed">
          {MILESTONES[active].detail}
        </p>
      </div>
      <p className="text-xs text-muted">
        Click any point on the timeline. This whole course walks through it
        left to right, one concept at a time.
      </p>
    </div>
  );
}
