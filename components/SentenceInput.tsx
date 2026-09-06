"use client";

import { useSentence } from "./SentenceContext";

export default function SentenceInput() {
  const { sentence, setSentence } = useSentence();

  return (
    <div className="mb-4 rounded-lg border border-accent/30 bg-surface-2/30 p-3">
      <label className="text-xs font-medium text-accent block mb-1.5">
        Your sentence — carried through the RNN, Self-Attention, and BERT/GPT
        steps so you can compare them directly
      </label>
      <input
        type="text"
        value={sentence}
        onChange={(e) => setSentence(e.target.value.slice(0, 140))}
        placeholder="Type any sentence..."
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
      />
    </div>
  );
}
