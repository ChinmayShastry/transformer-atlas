"use client";

import { useState } from "react";
import { useApiKey } from "./ApiKeyContext";

interface HeaderProps {
  view: "course" | "playground" | "api";
  setView: (v: "course" | "playground" | "api") => void;
}

export default function Header({ view, setView }: HeaderProps) {
  const { hasKey, setApiKey } = useApiKey();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-[#0b0e17] font-bold text-xs shrink-0">
              T
            </div>
            <span className="font-semibold text-sm">Transformer Atlas</span>
          </div>
          <nav className="flex gap-1 bg-surface-2 rounded-full p-0.5">
            {(["course", "playground", "api"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  view === v
                    ? "bg-accent text-[#0b0e17]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {v === "course"
                  ? "Course"
                  : v === "playground"
                  ? "Tokenizer"
                  : "API Deep Dive"}
              </button>
            ))}
          </nav>
        </div>

        <div className="relative">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && input.trim()) {
                    setApiKey(input.trim());
                    setEditing(false);
                    setInput("");
                  }
                  if (e.key === "Escape") setEditing(false);
                }}
                placeholder="sk-..."
                className="text-xs font-mono rounded-md border border-border bg-surface-2 px-2 py-1.5 w-36 focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => {
                  if (input.trim()) setApiKey(input.trim());
                  setEditing(false);
                  setInput("");
                }}
                className="text-xs text-[#0b0e17] bg-accent rounded-md px-2 py-1.5 font-medium"
              >
                Save
              </button>
            </div>
          ) : hasKey ? (
            <button
              onClick={() => setApiKey(null)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground border border-border rounded-full px-2.5 py-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-2" />
              Key connected · clear
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-muted hover:text-foreground border border-border rounded-full px-2.5 py-1"
            >
              + Add API key
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
