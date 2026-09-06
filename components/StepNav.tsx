"use client";

interface StepNavProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
}

export default function StepNav({
  index,
  total,
  onPrev,
  onNext,
  onJump,
}: StepNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
      <button
        onClick={onPrev}
        disabled={index === 0}
        className="px-4 py-2 rounded-md border border-border text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-2 transition"
      >
        ← Back
      </button>

      {/* Dots get their own centered row on narrow screens so the Next button
          never gets pushed off the edge as steps are added. */}
      <div className="flex items-center justify-center gap-1.5 order-last w-full sm:order-none sm:w-auto">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            aria-label={`Go to step ${i + 1}`}
            className="p-1"
          >
            <span
              className={`block rounded-full transition-all ${
                i === index
                  ? "w-5 h-1.5 bg-accent"
                  : "w-1.5 h-1.5 bg-surface-2 hover:bg-border"
              }`}
            />
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={index === total - 1}
        className="px-4 py-2 rounded-md bg-accent text-on-accent text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        Next →
      </button>
    </div>
  );
}
