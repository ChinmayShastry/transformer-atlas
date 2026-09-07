"use client";

import { useEffect, useState } from "react";

type Choice = "light" | "dark" | "system";

const STORAGE_KEY = "transformer-atlas-theme";

function apply(choice: Choice) {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>("system");

  // The inline script in layout.tsx has already applied the stored choice
  // before paint; this only syncs the button state to it.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Choice | null;
      if (stored === "light" || stored === "dark") setChoice(stored);
    } catch {
      // storage unavailable — stay on system
    }
  }, []);

  function pick(next: Choice) {
    setChoice(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore unavailable storage
    }
  }

  const options: { value: Choice; label: string; title: string }[] = [
    { value: "light", label: "☀", title: "Light" },
    { value: "system", label: "◐", title: "Match system" },
    { value: "dark", label: "☾", title: "Dark" },
  ];

  return (
    <div
      className="flex gap-0.5 bg-surface-2 rounded-full p-0.5"
      role="group"
      aria-label="Colour theme"
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => pick(o.value)}
          title={o.title}
          aria-label={o.title}
          aria-pressed={choice === o.value}
          className={`w-6 h-6 rounded-full text-[11px] leading-none transition-colors ${
            choice === o.value
              ? "bg-accent text-on-accent"
              : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
