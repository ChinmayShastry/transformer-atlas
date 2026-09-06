"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "transformer-atlas-openai-key";

interface ApiKeyContextValue {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  hasKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextValue>({
  apiKey: null,
  setApiKey: () => {},
  hasKey: false,
});

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setApiKeyState(stored);
  }, []);

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    if (key) {
      sessionStorage.setItem(STORAGE_KEY, key);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <ApiKeyContext.Provider
      value={{ apiKey, setApiKey, hasKey: !!apiKey }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}
