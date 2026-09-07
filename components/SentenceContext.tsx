"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const DEFAULT_SENTENCE =
  "The transformer replaced recurrent networks because attention scales better";

interface SentenceContextValue {
  // What the input box shows. Follows the reader exactly, empty included,
  // so clearing the field to retype does not fight them.
  sentence: string;
  // Never empty. The step visuals handle an empty box themselves, by asking
  // for two words; the era transition cannot, because it is a full-screen
  // pinned panel and a prompt there would interrupt the morph. It reads this
  // instead and keeps drawing the default sentence.
  displaySentence: string;
  setSentence: (s: string) => void;
}

const SentenceContext = createContext<SentenceContextValue>({
  sentence: DEFAULT_SENTENCE,
  displaySentence: DEFAULT_SENTENCE,
  setSentence: () => {},
});

export function SentenceProvider({ children }: { children: ReactNode }) {
  const [sentence, setSentence] = useState(DEFAULT_SENTENCE);
  const displaySentence = sentence.trim() ? sentence : DEFAULT_SENTENCE;
  return (
    <SentenceContext.Provider
      value={{ sentence, displaySentence, setSentence }}
    >
      {children}
    </SentenceContext.Provider>
  );
}

export function useSentence() {
  return useContext(SentenceContext);
}
