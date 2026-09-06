"use client";

import { useEffect, useState } from "react";
import type { Step } from "@/lib/types";
import { ApiKeyProvider } from "./ApiKeyContext";
import { SentenceProvider } from "./SentenceContext";
import ApiKeyGate from "./ApiKeyGate";
import Header from "./Header";
import StepCard from "./StepCard";
import StepNav from "./StepNav";
import TokenizerPlayground from "./TokenizerPlayground";
import ApiExplorer from "./ApiExplorer";

export default function CourseApp({ steps }: { steps: Step[] }) {
  return (
    <ApiKeyProvider>
      <SentenceProvider>
        <CourseShell steps={steps} />
      </SentenceProvider>
    </ApiKeyProvider>
  );
}

function CourseShell({ steps }: { steps: Step[] }) {
  const [gateOpen, setGateOpen] = useState(true);
  const [view, setView] = useState<"course" | "playground" | "api">("course");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gateOpen || view !== "course") return;
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(steps.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gateOpen, view, steps.length]);

  if (gateOpen) {
    return <ApiKeyGate onDismiss={() => setGateOpen(false)} />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header view={view} setView={setView} />
      {view === "course" ? (
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
          <StepCard step={steps[index]} index={index} total={steps.length} />
          <StepNav
            index={index}
            total={steps.length}
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
            onJump={setIndex}
          />
        </main>
      ) : view === "playground" ? (
        <main className="flex-1">
          <TokenizerPlayground />
        </main>
      ) : (
        <main className="flex-1">
          <ApiExplorer />
        </main>
      )}
      <footer className="text-center text-xs text-muted py-6 border-t border-border">
        Content sourced from local files · optional live examples via
        gpt-4o-mini · built with Next.js
      </footer>
    </div>
  );
}
