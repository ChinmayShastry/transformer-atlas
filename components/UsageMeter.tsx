"use client";

import { useState } from "react";
import { useUsage } from "./UsageContext";

export default function UsageMeter() {
  const {
    totalTokens,
    costUSD,
    promptTokens,
    completionTokens,
    embeddingTokens,
    calls,
    reset,
  } = useUsage();
  const [open, setOpen] = useState(false);

  // Nothing spent yet — no reason to take up space.
  if (totalTokens === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[11px] font-mono border border-border rounded-full px-2.5 py-1 text-muted hover:text-foreground transition-colors"
        title="Tokens and estimated cost this session"
      >
        <span className="tabular-nums">{totalTokens.toLocaleString()}</span>
        <span className="opacity-50">tok</span>
        <span className="text-accent tabular-nums">
          ${costUSD < 0.01 ? costUSD.toFixed(5) : costUSD.toFixed(3)}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-lg border border-border bg-surface shadow-xl p-3 z-30 animate-fade-in-up">
          <p className="text-xs font-medium mb-2">This session</p>
          <dl className="space-y-1 text-[11px] font-mono">
            {[
              ["Prompt", promptTokens],
              ["Completion", completionTokens],
              ["Embedding", embeddingTokens],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <dt className="text-muted">{label}</dt>
                <dd className="tabular-nums">
                  {(value as number).toLocaleString()}
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-1 mt-1">
              <dt className="text-muted">API calls</dt>
              <dd className="tabular-nums">{calls}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Estimated cost</dt>
              <dd className="tabular-nums text-accent">
                ${costUSD.toFixed(6)}
              </dd>
            </div>
          </dl>
          <p className="text-[10px] text-muted leading-relaxed mt-2.5">
            Counted from the <span className="font-mono">usage</span> field
            OpenAI returns, so it reflects real billed tokens. The dollar figure
            uses hardcoded gpt-4o-mini and embedding rates and is an estimate —
            your invoice is the source of truth.
          </p>
          <button
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="text-[11px] text-muted hover:text-foreground mt-2.5"
          >
            Reset counter
          </button>
        </div>
      )}
    </div>
  );
}
