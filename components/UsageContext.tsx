"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Approximate published rates, USD per 1M tokens. Verify against
// platform.openai.com/pricing — these are hardcoded and will drift.
const CHAT_INPUT_PER_M = 0.15;
const CHAT_OUTPUT_PER_M = 0.6;
const EMBED_PER_M = 0.02;

const STORAGE_KEY = "transformer-atlas-usage";

export interface UsageTotals {
  promptTokens: number;
  completionTokens: number;
  embeddingTokens: number;
  calls: number;
}

const EMPTY: UsageTotals = {
  promptTokens: 0,
  completionTokens: 0,
  embeddingTokens: 0,
  calls: 0,
};

interface UsageContextValue extends UsageTotals {
  totalTokens: number;
  costUSD: number;
  recordChat: (u: { prompt_tokens?: number; completion_tokens?: number } | null) => void;
  recordEmbedding: (u: { prompt_tokens?: number; total_tokens?: number } | null) => void;
  reset: () => void;
}

const UsageContext = createContext<UsageContextValue>({
  ...EMPTY,
  totalTokens: 0,
  costUSD: 0,
  recordChat: () => {},
  recordEmbedding: () => {},
  reset: () => {},
});

export function UsageProvider({ children }: { children: ReactNode }) {
  const [totals, setTotals] = useState<UsageTotals>(EMPTY);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setTotals({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // unreadable or blocked storage — start from zero
    }
  }, []);

  const persist = useCallback((next: UsageTotals) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore unavailable storage
    }
  }, []);

  const recordChat = useCallback<UsageContextValue["recordChat"]>(
    (u) => {
      if (!u) return;
      setTotals((t) => {
        const next = {
          ...t,
          promptTokens: t.promptTokens + (u.prompt_tokens ?? 0),
          completionTokens: t.completionTokens + (u.completion_tokens ?? 0),
          calls: t.calls + 1,
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const recordEmbedding = useCallback<UsageContextValue["recordEmbedding"]>(
    (u) => {
      if (!u) return;
      const tokens = u.prompt_tokens ?? u.total_tokens ?? 0;
      setTotals((t) => {
        const next = {
          ...t,
          embeddingTokens: t.embeddingTokens + tokens,
          calls: t.calls + 1,
        };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const reset = useCallback(() => {
    setTotals(EMPTY);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const totalTokens =
    totals.promptTokens + totals.completionTokens + totals.embeddingTokens;

  const costUSD =
    (totals.promptTokens / 1_000_000) * CHAT_INPUT_PER_M +
    (totals.completionTokens / 1_000_000) * CHAT_OUTPUT_PER_M +
    (totals.embeddingTokens / 1_000_000) * EMBED_PER_M;

  return (
    <UsageContext.Provider
      value={{
        ...totals,
        totalTokens,
        costUSD,
        recordChat,
        recordEmbedding,
        reset,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}
