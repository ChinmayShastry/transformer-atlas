"use client";

import { useState } from "react";
import { useApiKey } from "./ApiKeyContext";
import { useUsage } from "./UsageContext";

const WEATHER_TOOL = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get the current weather in a given city",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name, e.g. Tokyo",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
        },
      },
      required: ["location"],
    },
  },
};

interface ToolCall {
  id: string;
  function: { name: string; arguments: string };
}

export default function ToolCallingDemo() {
  const { apiKey, hasKey } = useApiKey();
  const { recordChat } = useUsage();
  const [prompt, setPrompt] = useState("What's the weather in Tokyo right now?");
  const [toolCall, setToolCall] = useState<ToolCall | null>(null);
  const [toolResult, setToolResult] = useState(
    '{"temperature": 22, "unit": "celsius", "condition": "sunny"}'
  );
  const [finalAnswer, setFinalAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<"none" | "call" | "answer">("none");
  const [error, setError] = useState<string | null>(null);

  async function requestToolCall() {
    if (!apiKey) return;
    setLoading("call");
    setError(null);
    setToolCall(null);
    setFinalAnswer(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          messages: [{ role: "user", content: prompt }],
          tools: [WEATHER_TOOL],
          stream: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      recordChat(data.usage);
      const call = data.message?.tool_calls?.[0];
      if (!call) {
        setError(
          "The model answered directly without calling the tool — try a question that clearly needs live weather data."
        );
      } else {
        setToolCall(call);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading("none");
    }
  }

  async function sendResultBack() {
    if (!apiKey || !toolCall) return;
    setLoading("answer");
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          messages: [
            { role: "user", content: prompt },
            {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: toolCall.id,
                  type: "function",
                  function: {
                    name: toolCall.function.name,
                    arguments: toolCall.function.arguments,
                  },
                },
              ],
            },
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: toolResult,
            },
          ],
          stream: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      recordChat(data.usage);
      setFinalAnswer(data.message?.content ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading("none");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-accent mb-1">
          Tool calling — how an LLM &quot;does things&quot;
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          A model can&apos;t actually check the weather. What it can do is
          reply with a structured request asking <em>you</em> to run a
          function, then use whatever you send back. That round trip is the
          entire basis of AI agents — run it below, one step at a time.
        </p>
      </div>

      <div>
        <p className="text-[11px] text-muted mb-1.5">
          Step 0 — the tool you advertise to the model:
        </p>
        <pre className="text-[10px] font-mono bg-surface-2/50 border border-border rounded-md p-2.5 overflow-x-auto scrollbar-thin">
          {JSON.stringify(WEATHER_TOOL, null, 2)}
        </pre>
      </div>

      <div>
        <p className="text-[11px] text-muted mb-1.5">Step 1 — ask something:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 200))}
            disabled={!hasKey}
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm font-mono disabled:opacity-50 focus:outline-none focus:border-accent"
          />
          <button
            onClick={requestToolCall}
            disabled={!hasKey || loading !== "none" || !prompt.trim()}
            className="px-3 py-2 rounded-md bg-accent text-on-accent font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition whitespace-nowrap"
          >
            {loading === "call" ? "Asking…" : "Ask"}
          </button>
        </div>
      </div>

      {toolCall && (
        <div className="animate-fade-in-up space-y-3">
          <div>
            <p className="text-[11px] text-muted mb-1.5">
              Step 2 — the model didn&apos;t answer. It asked you to run this:
            </p>
            <pre className="text-[11px] font-mono bg-accent/10 border border-accent/40 rounded-md p-2.5 overflow-x-auto scrollbar-thin">
              {toolCall.function.name}({toolCall.function.arguments})
            </pre>
          </div>

          <div>
            <p className="text-[11px] text-muted mb-1.5">
              Step 3 — your code runs it and returns a result (edit this):
            </p>
            <input
              type="text"
              value={toolResult}
              onChange={(e) => setToolResult(e.target.value.slice(0, 300))}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={sendResultBack}
            disabled={loading !== "none"}
            className="w-full rounded-md bg-accent-2 text-on-accent font-medium text-sm py-2 disabled:opacity-40 hover:brightness-110 transition"
          >
            {loading === "answer"
              ? "Sending result back…"
              : "Step 4 — send the result back to the model"}
          </button>
        </div>
      )}

      {finalAnswer && (
        <div className="animate-fade-in-up">
          <p className="text-[11px] text-muted mb-1.5">
            Step 5 — now it can answer in plain language:
          </p>
          <p className="text-sm bg-surface-2/50 rounded-md border border-border px-3 py-2.5">
            {finalAnswer}
          </p>
          <p className="text-[11px] text-muted mt-2">
            Change the numbers in step 3 and run it again — the answer follows
            whatever you returned, because the model has no independent access
            to the weather. Everything an agent &quot;knows&quot; comes from
            tool results you feed it.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-danger border border-danger/30 bg-danger/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
