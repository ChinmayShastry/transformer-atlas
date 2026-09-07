"use client";

import type { Step } from "@/lib/types";
import { VISUALS, USES_SENTENCE, STEP_YEARS } from "@/components/visuals/registry";
import SentenceInput from "@/components/SentenceInput";
import LiveGenerationPanel from "@/components/LiveGenerationPanel";
import type { Era } from "@/lib/eras";

interface StorySectionProps {
  step: Step;
  era: Era;
}

export default function StorySection({ step, era }: StorySectionProps) {
  const Visual = VISUALS[step.visual];
  const paragraphs = step.body.split("\n\n");

  return (
    <section
      data-story-step={step.id}
      id={step.id}
      className="scroll-mt-24 py-16 sm:py-24 border-t border-border/60 first:border-t-0"
    >
      {/* min-w-0 on both tracks: grid children default to min-width:auto and
          will not shrink below their content's intrinsic width, which lets the
          visuals' wide scroll containers blow out the page on phones. */}
      <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-14 items-start">
        {/* Prose scrolls */}
        <div className="min-w-0 max-w-[62ch]">
          <div className="flex items-baseline gap-2.5 mb-3">
            <span
              className="font-mono text-sm tabular-nums"
              style={{ color: era.color }}
            >
              {STEP_YEARS[step.id] ?? ""}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted">
              {era.name}
            </span>
          </div>

          <h2 className="font-serif text-[30px] sm:text-[34px] leading-[1.15] font-semibold mb-4 text-balance">
            {step.title}
          </h2>

          <p className="text-lg leading-relaxed mb-7" style={{ color: era.color }}>
            {step.oneliner}
          </p>

          <div className="space-y-4">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-[15px] leading-[1.75] text-muted"
              >
                {para}
              </p>
            ))}
          </div>

          {step.id === "scaling-laws" && (
            <div className="mt-8 lg:hidden">
              <LiveGenerationPanel />
            </div>
          )}
        </div>

        {/* Visual pins alongside on desktop; on mobile it simply stacks,
            because pinned side-by-side layouts collapse badly on phones. */}
        <div className="min-w-0 lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm">
            {USES_SENTENCE.has(step.visual) && <SentenceInput />}
            <Visual />
          </div>
          {step.id === "scaling-laws" && (
            <div className="mt-4 hidden lg:block">
              <LiveGenerationPanel />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
