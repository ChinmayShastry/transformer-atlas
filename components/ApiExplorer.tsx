"use client";

import { useEffect, useRef, useState } from "react";
import Slider from "./Slider";
import { useApiKey } from "./ApiKeyContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

const INPUT_PRICE_PER_M = 0.15;
const OUTPUT_PRICE_PER_M = 0.6;

function estimateCost(usage: Usage | null): number | null {
  if (!usage) return null;
  return (
    (usage.prompt_tokens / 1_000_000) * INPUT_PRICE_PER_M +
    (usage.completion_tokens / 1_000_000) * OUTPUT_PRICE_PER_M
  );
}

export default function ApiExplorer() {
  const { apiKey, hasKey } = useApiKey();

  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful, concise assistant."
  );
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("Explain what a token is, in one sentence.");
  const [streaming, setStreaming] = useState(true);
  const [liveText, setLiveText] = useState("");

  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [maxTokens, setMaxTokens] = useState(200);
  const [freqPenalty, setFreqPenalty] = useState(0);
  const [presPenalty, setPresPenalty] = useState(0);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [rawResponse, setRawResponse] = useState<Record<string, unknown> | null>(
    null
  );
  const [lastRequest, setLastRequest] = useState<Record<string, unknown> | null>(
    null
  );
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, liveText]);

  async function send() {
    if (!apiKey || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    setLiveText("");
    setRawResponse(null);

    const userMsg: ChatMessage = { role: "user", content: draft.trim() };
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      userMsg,
    ];
    const payload = {
      messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      frequency_penalty: freqPenalty,
      presence_penalty: presPenalty,
      stream: streaming,
    };
    setLastRequest({ model: "gpt-4o-mini", ...payload });
    setHistory((h) => [...h, userMsg]);
    setDraft("");

    try {
      if (streaming) {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, apiKey }),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Request failed.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";
        let finalUsage: Usage | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const dataStr = line.slice(5).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const json = JSON.parse(dataStr);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                assistantText += delta;
                setLiveText(assistantText);
              }
              if (json.usage) finalUsage = json.usage;
            } catch {
              // ignore partial/malformed chunks
            }
          }
        }

        setHistory((h) => [...h, { role: "assistant", content: assistantText }]);
        setUsage(finalUsage);
        setLiveText("");
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, apiKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed.");
        setHistory((h) => [
          ...h,
          { role: "assistant", content: data.message?.content ?? "" },
        ]);
        setUsage(data.usage);
        setRawResponse(data.raw);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  const cost = estimateCost(usage);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">LLM API Deep Dive</h2>
        <p className="text-sm text-accent-2/90 leading-relaxed">
          Every chat app, including this one, is a thin UI around one HTTP
          call. Send a real message below and watch exactly what goes in and
          what comes back.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface-2/30 p-4 text-sm text-muted leading-relaxed space-y-1.5">
        <p className="text-foreground font-medium mb-1">
          Anatomy of a request
        </p>
        <p>
          <span className="font-mono text-accent-2">model</span> — which LLM
          to run (here, always{" "}
          <span className="font-mono text-accent-2">gpt-4o-mini</span>).
        </p>
        <p>
          <span className="font-mono text-accent-2">messages[]</span> — the
          whole conversation so far, each one tagged{" "}
          <span className="font-mono">system</span>,{" "}
          <span className="font-mono">user</span>, or{" "}
          <span className="font-mono">assistant</span>. The model only ever
          sees this list — it has no memory outside of it.
        </p>
        <p>
          Everything else below (<span className="font-mono">temperature</span>,{" "}
          <span className="font-mono">top_p</span>, etc.) is a sampling
          parameter that shapes how the next token is picked.
        </p>
      </div>

      {!hasKey && (
        <div className="rounded-lg border border-accent-warm/40 bg-accent-warm/10 px-4 py-3 text-sm text-accent-warm">
          Add your OpenAI API key (top of page) to send real requests here.
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted block mb-1.5">
            System prompt
          </label>
          <input
            type="text"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value.slice(0, 300))}
            disabled={!hasKey}
            className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="rounded-lg border border-border bg-surface-2/30 max-h-72 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {history.length === 0 && !liveText && (
            <p className="text-xs text-muted">
              No messages yet — send one below.
            </p>
          )}
          {history.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-accent text-[#0b0e17]"
                    : "bg-surface border border-border text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {liveText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-surface border border-accent/50 text-foreground">
                {liveText}
                <span className="inline-block w-1.5 h-3.5 bg-accent-2 ml-0.5 animate-pulse align-text-bottom" />
              </div>
            </div>
          )}
          {sending && !liveText && (
            <p className="text-xs text-muted">Waiting for response…</p>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 500))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !sending) send();
            }}
            disabled={!hasKey}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-accent"
          />
          <button
            onClick={send}
            disabled={!hasKey || sending || !draft.trim()}
            className="px-4 py-2 rounded-md bg-accent text-[#0b0e17] font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={streaming}
              onChange={(e) => setStreaming(e.target.checked)}
              className="accent-[color:var(--accent)]"
            />
            Stream tokens live — watch the autoregressive loop from the
            Scaling step happen in real time
          </label>
          <button
            onClick={() => {
              setHistory([]);
              setUsage(null);
              setRawResponse(null);
              setError(null);
            }}
            className="text-xs text-muted hover:text-foreground"
          >
            Reset conversation
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5 pt-2 border-t border-border">
          <Slider
            label="Temperature"
            value={temperature}
            min={0}
            max={2}
            step={0.1}
            onChange={setTemperature}
            valueLabel={temperature.toFixed(1)}
            hint="Controls randomness — near 0 is deterministic and repetitive, near 2 is wild and often incoherent."
          />
          <Slider
            label="Top P (nucleus sampling)"
            value={topP}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setTopP}
            valueLabel={topP.toFixed(2)}
            hint="Only samples from the smallest set of tokens whose combined probability exceeds this — an alternative knob for randomness."
          />
          <Slider
            label="Max tokens"
            value={maxTokens}
            min={16}
            max={800}
            step={8}
            onChange={setMaxTokens}
            valueLabel={`${maxTokens}`}
            hint="Hard cap on response length, in tokens (not words) — generation stops here even mid-thought."
          />
          <Slider
            label="Frequency penalty"
            value={freqPenalty}
            min={-2}
            max={2}
            step={0.1}
            onChange={setFreqPenalty}
            valueLabel={freqPenalty.toFixed(1)}
            hint="Penalizes tokens proportionally to how often they've already appeared — pushes the model away from repeating itself."
          />
          <Slider
            label="Presence penalty"
            value={presPenalty}
            min={-2}
            max={2}
            step={0.1}
            onChange={setPresPenalty}
            valueLabel={presPenalty.toFixed(1)}
            hint="Penalizes any token that has appeared at all, even once — pushes the model toward new topics."
          />
        </div>

        {error && (
          <p className="text-xs text-danger border border-danger/30 bg-danger/10 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setShowRequest((s) => !s)}
            disabled={!lastRequest}
            className="text-xs text-accent hover:brightness-110 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showRequest ? "Hide raw request ▲" : "Show raw request ▼"}
          </button>
          <button
            onClick={() => setShowResponse((s) => !s)}
            disabled={!rawResponse}
            className="text-xs text-accent hover:brightness-110 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showResponse ? "Hide raw response ▲" : "Show raw response ▼"}
          </button>
          {usage && (
            <span className="text-xs text-muted font-mono ml-auto">
              {usage.prompt_tokens} in + {usage.completion_tokens} out ={" "}
              {usage.total_tokens} tokens
              {cost !== null && <> · ~${cost.toFixed(6)}</>}
            </span>
          )}
        </div>

        {showRequest && lastRequest && (
          <pre className="text-[11px] font-mono bg-surface-2/50 border border-border rounded-md p-3 overflow-x-auto scrollbar-thin">
            {JSON.stringify(lastRequest, null, 2)}
          </pre>
        )}
        {showResponse && rawResponse !== null && (
          <pre className="text-[11px] font-mono bg-surface-2/50 border border-border rounded-md p-3 overflow-x-auto scrollbar-thin">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        )}
        {showResponse && rawResponse === null && streaming && (
          <p className="text-[11px] text-muted">
            Streaming responses arrive as many small chunks rather than one
            JSON blob — switch off streaming to inspect a full raw response.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface-2/30 p-4 text-sm text-muted leading-relaxed space-y-1.5">
        <p className="text-foreground font-medium mb-1">
          Anatomy of a response
        </p>
        <p>
          <span className="font-mono text-accent-2">choices[0].message</span>{" "}
          — the assistant's reply (the API can return several candidate
          choices at once; almost every app just uses the first).
        </p>
        <p>
          <span className="font-mono text-accent-2">finish_reason</span> —
          why it stopped: <span className="font-mono">stop</span> (natural
          end), <span className="font-mono">length</span> (hit{" "}
          <span className="font-mono">max_tokens</span>), or a few others.
        </p>
        <p>
          <span className="font-mono text-accent-2">usage</span> — exactly
          how many tokens the prompt and the completion cost, which is what
          you're billed on, not characters or words.
        </p>
        <p className="pt-1">
          A few things worth knowing that don't show up in a single call:
          every model has a fixed <em>context window</em> (a max number of
          tokens across the whole conversation, prompt included), API keys
          are rate-limited (requests and tokens per minute), and prices above
          are approximate gpt-4o-mini rates — check{" "}
          <span className="font-mono">platform.openai.com/pricing</span> for
          current numbers.
        </p>
      </div>
    </div>
  );
}
