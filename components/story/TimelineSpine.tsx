"use client";

import { ERAS } from "@/lib/eras";
import type { Step } from "@/lib/types";

interface TimelineSpineProps {
  steps: Step[];
  activeId: string | null;
}

export default function TimelineSpine({ steps, activeId }: TimelineSpineProps) {
  const activeIndex = activeId
    ? steps.findIndex((s) => s.id === activeId)
    : -1;

  return (
    <nav
      aria-label="Story progress"
      className="hidden xl:flex flex-col gap-5 fixed left-6 top-1/2 -translate-y-1/2 z-20"
    >
      {ERAS.map((era) => {
        const isActiveEra = era.stepIds.includes(activeId ?? "");
        return (
          <div key={era.id} className="flex flex-col gap-1.5">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.12em] transition-colors"
              style={{ color: isActiveEra ? era.color : "var(--muted)" }}
            >
              {era.name}
            </span>
            <div className="flex flex-col gap-1.5">
              {era.stepIds.map((id) => {
                const idx = steps.findIndex((s) => s.id === id);
                if (idx < 0) return null;
                const isCurrent = idx === activeIndex;
                const isPast = activeIndex >= 0 && idx < activeIndex;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    aria-label={steps[idx].title}
                    aria-current={isCurrent ? "true" : undefined}
                    className="group flex items-center gap-2"
                  >
                    <span
                      className="block rounded-full transition-all"
                      style={{
                        width: isCurrent ? 22 : 10,
                        height: 3,
                        background: isCurrent
                          ? era.color
                          : isPast
                          ? `color-mix(in srgb, ${era.color} 45%, transparent)`
                          : "var(--border)",
                      }}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
