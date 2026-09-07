"use client";

import type { Step } from "@/lib/types";
import { ERAS, eraOf } from "@/lib/eras";

interface StepNavProps {
  steps: Step[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}

export default function StepNav({
  steps,
  index,
  onPrev,
  onNext,
  onJump,
}: StepNavProps) {
  const total = steps.length;
  const currentEraId = eraOf(steps[index]?.id ?? "").id;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
      <button
        onClick={onPrev}
        disabled={index === 0}
        className="px-4 py-2 rounded-md border border-border text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-2 transition"
      >
        ← Back
      </button>

      {/* Dots are grouped by era so the row shows where you are in the arc,
          not just which of eleven identical dots you're on. Gets its own
          centered row on narrow screens so Next is never pushed off-edge. */}
      <div className="flex items-end justify-center gap-4 order-last w-full sm:order-none sm:w-auto">
        {ERAS.map((era) => {
          const isCurrentEra = era.id === currentEraId;
          return (
            <div key={era.id} className="flex flex-col items-center gap-1.5">
              <span
                className="hidden md:block text-[9px] font-mono uppercase tracking-[0.1em] transition-colors"
                style={{ color: isCurrentEra ? era.color : "var(--muted)" }}
              >
                {era.name}
              </span>
              <div className="flex items-center gap-1.5">
                {era.stepIds.map((stepId) => {
                  const stepIndex = steps.findIndex((s) => s.id === stepId);
                  if (stepIndex < 0) return null;
                  const isCurrent = stepIndex === index;
                  const isDone = stepIndex < index;
                  return (
                    <button
                      key={stepId}
                      onClick={() => onJump(stepIndex)}
                      aria-label={`Go to step ${stepIndex + 1}`}
                      aria-current={isCurrent ? "step" : undefined}
                      className="p-1 group"
                    >
                      <span
                        className="block rounded-full transition-all"
                        style={{
                          width: isCurrent ? 20 : 6,
                          height: 6,
                          background: isCurrent
                            ? era.color
                            : isDone
                            ? `color-mix(in srgb, ${era.color} 45%, transparent)`
                            : "var(--surface-2)",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="px-4 py-2 rounded-md bg-accent text-on-accent text-sm font-medium hover:brightness-110 transition"
      >
        {index === total - 1 ? "Finish ✦" : "Next →"}
      </button>
    </div>
  );
}
