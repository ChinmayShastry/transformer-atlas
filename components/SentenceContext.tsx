"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const DEFAULT_SENTENCE =
  "The transformer replaced recurrent networks because attention scales better";

interface SentenceContextValue {
  sentence: string;
  setSentence: (s: string) => void;
}

const SentenceContext = createContext<SentenceContextValue>({
  sentence: DEFAULT_SENTENCE,
  setSentence: () => {},
});

export function SentenceProvider({ children }: { children: ReactNode }) {
  const [sentence, setSentence] = useState(DEFAULT_SENTENCE);
  return (
    <SentenceContext.Provider value={{ sentence, setSentence }}>
      {children}
    </SentenceContext.Provider>
  );
}

export function useSentence() {
  return useContext(SentenceContext);
}
