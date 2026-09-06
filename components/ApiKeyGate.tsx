"use client";

import { useState } from "react";
import { useApiKey } from "./ApiKeyContext";

export default function ApiKeyGate({ onDismiss }: { onDismiss: () => void }) {
  const { setApiKey } = useApiKey();
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);

  const looksValid = input.trim().startsWith("sk-") && input.trim().length > 20;

  function handleContinue() {
    if (looksValid) {
      setApiKey(input.trim());
    }
    onDismiss();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-2xl animate-fade-in-up">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-[#0b0e17] font-bold text-sm">
            T
          </div>
          <h1 className="text-lg font-semibold">Transformer Atlas</h1>
        </div>
        <p className="text-sm text-muted mb-6">
          An interactive, visual walkthrough of how Transformers evolved —
          drag sliders, watch the concepts change live.
        </p>

        <label className="text-xs font-medium text-muted mb-1.5 block">
          OpenAI API key <span className="opacity-60">(optional)</span>
        </label>
        <div className="relative mb-1.5">
          <input
            type={show ? "text" : "password"}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setTouched(true);
            }}
            placeholder="sk-..."
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2.5 text-sm font-mono pr-16 focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-foreground px-1.5 py-1"
          >
            {show ? "hide" : "show"}
          </button>
        </div>
        {touched && !looksValid && input.length > 0 && (
          <p className="text-[11px] text-danger mb-2">
            That doesn&apos;t look like a valid OpenAI key (should start with
            &quot;sk-&quot;).
          </p>
        )}
        <p className="text-[11px] text-muted mb-6 leading-relaxed">
          Only used to unlock a few &quot;generate a real example&quot;
          buttons with gpt-4o-mini. Kept in this browser tab only
          (sessionStorage) — never sent anywhere but OpenAI, never stored on
          any server. The entire course works without one.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleContinue}
            disabled={input.length > 0 && !looksValid}
            className="w-full rounded-md bg-accent text-[#0b0e17] font-medium text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            {input ? "Continue with this key" : "Continue"}
          </button>
          <button
            onClick={() => {
              setInput("");
              onDismiss();
            }}
            className="w-full rounded-md border border-border text-sm py-2.5 text-muted hover:text-foreground transition"
          >
            Skip — explore with static content only
          </button>
        </div>
      </div>
    </div>
  );
}
