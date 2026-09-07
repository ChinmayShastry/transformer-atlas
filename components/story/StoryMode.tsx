"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Step } from "@/lib/types";
import { ERAS } from "@/lib/eras";
import { ApiKeyProvider } from "@/components/ApiKeyContext";
import { UsageProvider } from "@/components/UsageContext";
import { SentenceProvider } from "@/components/SentenceContext";
import ThemeToggle from "@/components/ThemeToggle";
import UsageMeter from "@/components/UsageMeter";
import TimelineSpine from "./TimelineSpine";
import EraOpening from "./EraOpening";
import StorySection from "./StorySection";

export default function StoryMode({ steps }: { steps: Step[] }) {
  return (
    <ApiKeyProvider>
      <UsageProvider>
        <SentenceProvider>
          <StoryShell steps={steps} />
        </SentenceProvider>
      </UsageProvider>
    </ApiKeyProvider>
  );
}

function StoryShell({ steps }: { steps: Step[] }) {
  // Starts on the first step rather than null, so the spine is never blank
  // before the reader has scrolled.
  const [activeId, setActiveId] = useState<string>(steps[0]?.id ?? "");

  // One scroll listener reading positions directly, rather than an observer
  // per section: it is cheaper, and it still works in environments where
  // IntersectionObserver callbacks are not delivered.
  useEffect(() => {
    let last = 0;
    function measure() {
      last = Date.now();
      const mid = window.innerHeight / 2;
      let best: { id: string; distance: number } | null = null;
      document.querySelectorAll<HTMLElement>("[data-story-step]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        // Distance from the viewport's middle to this section's nearest edge,
        // so a tall section spanning the middle always wins.
        const distance =
          r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        const id = el.dataset.storyStep!;
        if (!best || distance < best.distance) best = { id, distance };
      });
      if (best) setActiveId((prev) => (prev === best!.id ? prev : best!.id));
    }
    // Throttled by timestamp rather than a queued flag waiting on a frame:
    // requestAnimationFrame never fires on a hidden or backgrounded tab, and
    // a boolean latch would stay stuck on, killing the spine for good.
    // Measuring eleven rects is cheap enough to just do inline.
    function onScroll() {
      if (Date.now() - last < 80) return;
      measure();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const byId = new Map(steps.map((s) => [s.id, s]));

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-on-accent font-bold text-xs shrink-0">
              T
            </div>
            <span className="font-serif font-semibold text-[15px] truncate">
              Transformer Atlas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UsageMeter />
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs text-muted hover:text-foreground border border-border rounded-full px-2.5 py-1 whitespace-nowrap"
            >
              Step view
            </Link>
          </div>
        </div>
      </header>

      <TimelineSpine steps={steps} activeId={activeId} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6">
        {/* Opening. Sized to its content rather than the viewport, so the
            first screen already shows the story starting. */}
        <section className="pt-16 pb-10 sm:pt-24 sm:pb-14 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-5">
            1986 → today
          </p>
          <h1 className="font-serif text-[42px] sm:text-[62px] leading-[1.03] font-semibold mb-6 text-balance">
            How Transformers went from an idea to everything
          </h1>
          <p className="text-lg sm:text-xl text-muted leading-relaxed mb-8">
            Forty years of trying to make a machine remember what it read —
            told in order, with the mechanism on screen beside every step.
            Scroll to travel forward in time.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-mono text-muted">
            <span>{steps.length} ideas</span>
            <span>·</span>
            <span>3 eras</span>
            <span>·</span>
            <span>about 20 minutes</span>
            <span>·</span>
            <span>no maths required</span>
          </div>
        </section>

        {ERAS.map((era, i) => (
          <div key={era.id}>
            <EraOpening era={era} index={i + 1} total={ERAS.length} />
            {era.stepIds.map((id) => {
              const step = byId.get(id);
              if (!step) return null;
              return <StorySection key={id} step={step} era={era} />;
            })}
          </div>
        ))}

        <section className="py-24 border-t border-border max-w-3xl">
          <h2 className="font-serif text-[32px] sm:text-[40px] leading-[1.1] font-semibold mb-4 text-balance">
            That&apos;s the whole arc
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-8">
            Every model you use runs on the idea from 2017. Everything after it
            is that same design, scaled up and engineered to be fast enough to
            serve.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/#api"
              className="px-4 py-2 rounded-md bg-accent text-on-accent text-sm font-medium hover:brightness-110 transition"
            >
              Open the API Deep Dive
            </Link>
            <Link
              href="/#tokenizer"
              className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-surface-2 transition"
            >
              Tokenizer Playground
            </Link>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-surface-2 transition"
            >
              Back to 1986
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-muted py-8 border-t border-border">
        Content sourced from local files · live examples via gpt-4o-mini
      </footer>
    </div>
  );
}
