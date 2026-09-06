"use client";

import { useState } from "react";
import { useApiKey } from "./ApiKeyContext";
import { cosineSimilarity } from "@/lib/math";

const PRESETS: [string, string][] = [
  ["a dog chasing a ball", "a puppy playing fetch"],
  ["a dog chasing a ball", "quarterly revenue projections"],
  ["I love this movie", "I hate this movie"],
];

export default function EmbeddingsDemo() {
  const { apiKey, hasKey } = useApiKey();
  const [a, setA] = useState("a dog chasing a ball");
  const [b, setB] = useState("a puppy playing fetch");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function compare() {
    if (!apiKey || !a.trim() || !b.trim()) return;
    setLoading(true);
    setError(null);
    setSimilarity(null);
    try {
      const res = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [a, b], apiKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      setSimilarity(cosineSimilarity(data.embeddings[0], data.embeddings[1]));
      setDimensions(data.dimensions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const pct = similarity === null ? 0 : Math.max(0, Math.min(1, similarity));

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-accent mb-1">
          Embeddings — turning meaning into numbers
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          A different endpoint entirely: instead of generating text, it returns
          a vector per input. Similar meanings land near each other, which is
          what powers search, recommendations, and the retrieval half of RAG.
        </p>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={a}
          onChange={(e) => setA(e.target.value.slice(0, 200))}
          disabled={!hasKey}
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          value={b}
          onChange={(e) => setB(e.target.value.slice(0, 200))}
          disabled={!hasKey}
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(([pa, pb], i) => (
          <button
            key={i}
            onClick={() => {
              setA(pa);
              setB(pb);
              setSimilarity(null);
            }}
            disabled={!hasKey}
            className="text-[11px] px-2 py-1 rounded-full border border-border text-muted hover:text-foreground disabled:opacity-40 transition-colors"
          >
            {pa.slice(0, 18)}… vs {pb.slice(0, 18)}…
          </button>
        ))}
      </div>

      <button
        onClick={compare}
        disabled={!hasKey || loading || !a.trim() || !b.trim()}
        className="w-full rounded-md bg-accent text-on-accent font-medium text-sm py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
      >
        {loading ? "Embedding…" : "Compare meaning"}
      </button>

      {similarity !== null && (
        <div className="animate-fade-in-up space-y-2">
          <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-accent-2 transition-all duration-500"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <p className="text-sm">
            <span className="text-muted">Cosine similarity: </span>
            <span className="font-mono text-accent-2 font-semibold">
              {similarity.toFixed(4)}
            </span>
            {dimensions && (
              <span className="text-muted text-xs">
                {" "}
                · {dimensions} dimensions per vector
              </span>
            )}
          </p>
          <p className="text-[11px] text-muted">
            Try the third preset: &quot;I love this movie&quot; and &quot;I
            hate this movie&quot; score surprisingly high, because embeddings
            capture topic far more strongly than sentiment. That single quirk
            explains a lot of confusing search results in RAG systems.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger border border-danger/30 bg-danger/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
