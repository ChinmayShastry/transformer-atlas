"use client";

import { useState } from "react";
import Slider from "../Slider";
import { useSentence } from "../SentenceContext";
import { tokenizeSentence } from "@/lib/similarity";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

export default function RNNVisual() {
  const { sentence } = useSentence();
  const words = tokenizeSentence(sentence, 14);
  const [gateStrength, setGateStrength] = useState(0.62);

  const retentionTarget =
    words.length < 2 ? 0 : Math.pow(gateStrength, words.length - 1) * 100;
  const finalRetention = Math.round(useAnimatedNumber(retentionTarget));

  if (words.length < 2) {
    return (
      <p className="text-sm text-muted">
        Type at least two words in the sentence box above to see the RNN
        chain in action.
      </p>
    );
  }
  const gateDescription =
    gateStrength < 0.5
      ? "vanilla RNN"
      : gateStrength > 0.8
      ? "LSTM-like"
      : "in between";

  return (
    <div className="space-y-6">
      <Slider
        label="Memory gate strength"
        value={gateStrength}
        min={0.3}
        max={0.95}
        step={0.01}
        onChange={setGateStrength}
        valueLabel={`${gateStrength.toFixed(2)} (${gateDescription})`}
        hint="Vanilla RNNs forget quickly (drag left). LSTMs add gates that remember better (drag right) — but push the sentence long enough and even a strong gate decays toward zero."
      />

      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="flex items-end gap-0.5 min-w-max px-1">
          {words.map((w, i) => {
            const retention = Math.pow(gateStrength, i);
            return (
              <div key={i} className="flex items-end">
                <div className="flex flex-col items-center gap-2 w-16">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-[11px] font-mono border-2 transition-all duration-300"
                    style={{
                      borderColor: `color-mix(in srgb, var(--accent) ${Math.round(
                        25 + retention * 75
                      )}%, transparent)`,
                      background: `color-mix(in srgb, var(--accent) ${Math.round(
                        retention * 25
                      )}%, transparent)`,
                    }}
                  >
                    h{i}
                  </div>
                  <span className="text-[11px] text-muted truncate w-full text-center">
                    {w}
                  </span>
                  <div className="w-10 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full bg-accent-2 transition-all duration-300"
                      style={{ width: `${retention * 100}%` }}
                    />
                  </div>
                </div>
                {i < words.length - 1 && (
                  <span className="text-muted text-base mb-9 px-0.5">→</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/50 px-4 py-3 text-sm space-y-1.5">
        <div>
          <span className="text-muted">Information from word 1 (</span>
          <span className="text-accent font-mono">&quot;{words[0]}&quot;</span>
          <span className="text-muted">
            ) still present at the last step:{" "}
          </span>
          <span className="font-mono text-accent-2 font-semibold">
            {finalRetention}%
          </span>
        </div>
        <div>
          <span className="text-muted">With self-attention (next steps): </span>
          <span className="font-mono text-accent-warm font-semibold">
            100%
          </span>
          <span className="text-muted">
            {" "}
            — always, no matter how long the sentence gets.
          </span>
        </div>
      </div>
    </div>
  );
}
