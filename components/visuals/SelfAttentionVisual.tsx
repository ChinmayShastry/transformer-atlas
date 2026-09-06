"use client";

import { useEffect, useState } from "react";
import Slider from "../Slider";
import TokenAttentionBars from "./TokenAttentionBars";
import { softmax, cosineSimilarity, zScore } from "@/lib/math";
import { useSentence } from "../SentenceContext";
import { tokenizeSentence, relatednessScores } from "@/lib/similarity";
import { useApiKey } from "../ApiKeyContext";

export default function SelfAttentionVisual() {
  const { sentence } = useSentence();
  const { apiKey, hasKey } = useApiKey();
  const tokens = tokenizeSentence(sentence, 12);

  const [queryIndex, setQueryIndex] = useState(0);
  const [sharpness, setSharpness] = useState(1.5);
  const [useReal, setUseReal] = useState(false);
  const [embeddings, setEmbeddings] = useState<number[][] | null>(null);
  const [embeddedFor, setEmbeddedFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryIndex > tokens.length - 1) {
      setQueryIndex(Math.max(0, tokens.length - 1));
    }
  }, [tokens.length, queryIndex]);

  const sentenceKey = tokens.join(" ");
  const embeddingsStale = embeddedFor !== sentenceKey;

  // One embeddings call per sentence — the query slider then recomputes
  // cosine similarities locally, so dragging it costs nothing.
  useEffect(() => {
    if (!useReal || !apiKey || tokens.length < 2 || !embeddingsStale || loading) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: tokens, apiKey }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Embedding request failed.");
        if (cancelled) return;
        setEmbeddings(data.embeddings);
        setEmbeddedFor(sentenceKey);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
          setUseReal(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [useReal, apiKey, sentenceKey, embeddingsStale, tokens, loading]);

  if (tokens.length < 2) {
    return (
      <p className="text-sm text-muted">
        Type at least two words in the sentence box above to see
        self-attention in action.
      </p>
    );
  }

  const usingReal =
    useReal && embeddings !== null && !embeddingsStale && embeddings.length === tokens.length;

  let rawScores: number[];
  if (usingReal) {
    const sims = tokens.map((_, i) =>
      cosineSimilarity(embeddings[queryIndex], embeddings[i])
    );
    rawScores = zScore(sims).map((z) => z * sharpness);
  } else {
    rawScores = relatednessScores(tokens, queryIndex).map((s) => s * (sharpness / 1.5));
  }
  const weights = softmax(rawScores);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setUseReal(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !useReal
              ? "bg-accent text-on-accent border-accent"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          Lexical heuristic
        </button>
        <button
          onClick={() => setUseReal(true)}
          disabled={!hasKey}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            useReal
              ? "bg-accent-2 text-on-accent border-accent-2"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          Real embeddings
        </button>
        {loading && (
          <span className="text-xs text-muted">embedding your sentence…</span>
        )}
        {!hasKey && (
          <span className="text-[11px] text-muted">
            add an API key to unlock real embeddings
          </span>
        )}
      </div>

      <Slider
        label="Query token"
        value={queryIndex}
        min={0}
        max={tokens.length - 1}
        onChange={setQueryIndex}
        valueLabel={`"${tokens[queryIndex]}"`}
        hint="Every token attends to every other token at once — slide to change which token is doing the attending, and watch its full attention pattern redraw."
      />

      <Slider
        label="Focus sharpness"
        value={sharpness}
        min={0.3}
        max={4}
        step={0.1}
        onChange={setSharpness}
        valueLabel={sharpness.toFixed(1)}
        hint="How peaked the softmax is: low spreads attention evenly across every token, high concentrates it on the single best match."
      />

      <TokenAttentionBars
        tokens={tokens}
        weights={weights}
        highlightIndex={queryIndex}
      />

      {error && (
        <p className="text-xs text-danger border border-danger/30 bg-danger/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-xs text-muted">
        {usingReal ? (
          <>
            These weights are real: each word was embedded with OpenAI&apos;s{" "}
            <span className="font-mono text-accent-2">
              text-embedding-3-small
            </span>
            , and the bars are the cosine similarity between your query
            word&apos;s vector and every other word&apos;s. One caveat worth
            knowing — these are context-free word embeddings, so they capture
            meaning but not the Query/Key projections a real attention layer
            learns.
          </>
        ) : (
          <>
            These scores come from a simple word-adjacency + repeated-word
            heuristic — no model involved. Switch to{" "}
            <span className="text-accent-2">Real embeddings</span> to score your
            sentence with actual semantic vectors instead.
          </>
        )}
      </p>
    </div>
  );
}
