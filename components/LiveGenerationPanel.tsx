"use client";

import { useState } from "react";
import Slider from "./Slider";
import { useApiKey } from "./ApiKeyContext";

export default function LiveGenerationPanel() {
  const { apiKey, hasKey } = useApiKey();
  const [prompt, setPrompt] = useState("The weather today is");
  const [temperature, setTemperature] = useState(0.7);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, temperature, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data.text);
      }
    } catch {
      setError("Network error — request could not be sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-surface-2/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-accent">
          Try it live — real gpt-4o-mini
        </h4>
        {!hasKey && (
          <span className="text-[11px] text-muted">
            add your API key above to unlock
          </span>
        )}
      </div>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value.slice(0, 120))}
        disabled={!hasKey}
        placeholder="Type the start of a sentence..."
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-accent"
      />

      <Slider
        label="Temperature"
        value={temperature}
        min={0}
        max={1.5}
        step={0.1}
        onChange={setTemperature}
        valueLabel={temperature.toFixed(1)}
        hint="Higher temperature = more randomness in what the model picks next."
      />

      <button
        onClick={handleGenerate}
        disabled={!hasKey || loading || !prompt.trim()}
        className="w-full rounded-md bg-accent text-[#0b0e17] font-medium text-sm py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        {loading ? "Generating…" : "Generate completion"}
      </button>

      {error && (
        <p className="text-xs text-danger border border-danger/30 bg-danger/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      {result && (
        <p className="text-sm font-mono bg-surface rounded-md border border-border px-3 py-2.5 animate-fade-in-up">
          {prompt}
          <span className="text-accent-2">{result.replace(/^"|"$/g, "")}</span>
        </p>
      )}
    </div>
  );
}
