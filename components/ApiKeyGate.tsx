"use client";

import { useState } from "react";
import { useApiKey } from "./ApiKeyContext";
import ThemeToggle from "./ThemeToggle";

export default function ApiKeyGate({ onDismiss }: { onDismiss: () => void }) {
  const { setApiKey } = useApiKey();
  const [showKeyField, setShowKeyField] = useState(false);
  const [input, setInput] = useState("");
  const [reveal, setReveal] = useState(false);
  const [touched, setTouched] = useState(false);

  const looksValid = input.trim().startsWith("sk-") && input.trim().length > 20;

  function start() {
    if (looksValid) setApiKey(input.trim());
    onDismiss();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-on-accent font-bold text-sm">
              T
            </div>
            <span className="font-serif text-lg font-semibold">
              Transformer Atlas
            </span>
          </div>
          {/* The toggle lives here too — otherwise this screen is the one
              place a visitor can't change the theme. */}
          <ThemeToggle />
        </div>

        <h1 className="font-serif text-[34px] leading-[1.15] font-semibold mb-4 text-balance">
          How Transformers went from an idea to everything
        </h1>
        <p className="text-base text-muted leading-relaxed mb-7 max-w-md">
          An interactive walkthrough of the architecture behind every modern
          language model. Drag the controls on each step and watch the concept
          move.
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-mono text-muted mb-7">
          <span>11 steps</span>
          <span>·</span>
          <span>about 20 minutes</span>
          <span>·</span>
          <span>no maths required</span>
        </div>

        <button
          onClick={start}
          className="w-full rounded-md bg-accent text-on-accent font-medium text-base py-3 hover:brightness-110 transition mb-4"
        >
          Start the course
        </button>

        {!showKeyField ? (
          <button
            onClick={() => setShowKeyField(true)}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Have an OpenAI key? Add it for live examples →
          </button>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-4 animate-fade-in-up">
            <label className="text-xs font-medium text-muted mb-1.5 block">
              OpenAI API key <span className="opacity-60">(optional)</span>
            </label>
            <div className="relative mb-1.5">
              <input
                autoFocus
                type={reveal ? "text" : "password"}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setTouched(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && looksValid) start();
                }}
                placeholder="sk-..."
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm font-mono pr-16 focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setReveal((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground px-1.5 py-1"
              >
                {reveal ? "hide" : "show"}
              </button>
            </div>
            {touched && !looksValid && input.length > 0 && (
              <p className="text-[11px] text-danger mb-1.5">
                That doesn&apos;t look like an OpenAI key — they start with
                &quot;sk-&quot;.
              </p>
            )}
            <p className="text-[11px] text-muted leading-relaxed">
              Unlocks a handful of buttons that call gpt-4o-mini for real. Kept
              in this browser tab only, sent nowhere but OpenAI, never stored on
              a server. Every one of the 11 steps works without it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
