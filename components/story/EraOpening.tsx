"use client";

import type { Era } from "@/lib/eras";

export default function EraOpening({
  era,
  index,
  total,
}: {
  era: Era;
  index: number;
  total: number;
}) {
  return (
    <section
      id={`era-${era.id}`}
      className="scroll-mt-24 py-20 sm:py-28"
      aria-label={`Era ${index} of ${total}: ${era.name}`}
    >
      <div
        className="border-l-[3px] pl-6 sm:pl-8"
        style={{ borderColor: era.color }}
      >
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4"
          style={{ color: era.color }}
        >
          Era {index} of {total}
        </p>
        <h2 className="font-serif text-[40px] sm:text-[56px] leading-[1.05] font-semibold mb-4 text-balance">
          {era.name}
        </h2>
        <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
          {era.blurb}
        </p>
      </div>
    </section>
  );
}
