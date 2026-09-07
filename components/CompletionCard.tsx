"use client";

import type { Step } from "@/lib/types";
import { ERAS } from "@/lib/eras";

interface CompletionCardProps {
  steps: Step[];
  onJump: (i: number) => void;
  onRestart: () => void;
  onGoTo: (view: "playground" | "api") => void;
  onBack: () => void;
}

export default function CompletionCard({
  steps,
  onJump,
  onRestart,
  onGoTo,
  onBack,
}: CompletionCardProps) {
  return (
    <div className="animate-fade-in-up">
      <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-accent mb-2">
        End of the course
      </p>
      <h2 className="font-serif text-[30px] leading-[1.2] font-semibold mb-3 text-balance">
        That&apos;s the whole arc — 1986 to today
      </h2>
      <p className="text-base text-accent-2/90 leading-relaxed mb-8 max-w-2xl">
        Every model you use runs on the idea in step 4. Everything after it is
        that same design, scaled up and engineered to be fast enough to serve.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {ERAS.map((era, i) => (
          <div
            key={era.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <p
              className="text-[10px] font-mono uppercase tracking-[0.12em] mb-1"
              style={{ color: era.color }}
            >
              Era {i + 1} — {era.kicker}
            </p>
            <p className="text-sm font-serif font-semibold mb-3">{era.name}</p>
            <ul className="space-y-1.5">
              {era.stepIds.map((stepId) => {
                const stepIndex = steps.findIndex((s) => s.id === stepId);
                if (stepIndex < 0) return null;
                return (
                  <li key={stepId}>
                    <button
                      onClick={() => onJump(stepIndex)}
                      className="text-left text-xs text-muted hover:text-foreground transition-colors leading-snug"
                    >
                      {steps[stepIndex].title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-accent/30 bg-surface-2/30 p-5 mb-6">
        <p className="text-sm font-semibold text-accent mb-1">
          Two things left to play with
        </p>
        <p className="text-xs text-muted mb-4 leading-relaxed">
          The course explains the mechanisms. These two let you drive them
          against the real thing.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onGoTo("api")}
            className="px-4 py-2 rounded-md bg-accent text-on-accent text-sm font-medium hover:brightness-110 transition"
          >
            Open the API Deep Dive
          </button>
          <button
            onClick={() => onGoTo("playground")}
            className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-surface-2 transition"
          >
            Tokenizer Playground
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-border">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-surface-2 transition"
        >
          ← Back to the last step
        </button>
        <button
          onClick={onRestart}
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          Start over from the beginning
        </button>
      </div>
    </div>
  );
}
