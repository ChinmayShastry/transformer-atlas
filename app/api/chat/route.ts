import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  // null for an assistant turn that only carries tool_calls
  content: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
}

interface ChatBody {
  messages: ChatMessage[];
  apiKey: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  tools?: unknown[];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export async function POST(req: NextRequest) {
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages, apiKey } = body;

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { error: "A valid OpenAI API key is required." },
      { status: 401 }
    );
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return NextResponse.json(
      { error: "Between 1 and 30 messages are required." },
      { status: 400 }
    );
  }
  for (const m of messages) {
    if (
      !m ||
      !["system", "user", "assistant", "tool"].includes(m.role) ||
      (typeof m.content !== "string" && m.content !== null)
    ) {
      return NextResponse.json(
        { error: "Each message needs a valid role and content." },
        { status: 400 }
      );
    }
  }
  const totalLen = messages.reduce(
    (sum, m) => sum + (m.content?.length ?? 0),
    0
  );
  if (totalLen > 8000) {
    return NextResponse.json(
      { error: "Conversation is too long for this demo (max 8000 characters)." },
      { status: 400 }
    );
  }

  const stream = !!body.stream;
  const payload = {
    model: "gpt-4o-mini",
    messages,
    temperature: clamp(Number(body.temperature ?? 0.7), 0, 2),
    top_p: clamp(Number(body.top_p ?? 1), 0, 1),
    max_tokens: clamp(Math.round(Number(body.max_tokens ?? 200)), 16, 800),
    frequency_penalty: clamp(Number(body.frequency_penalty ?? 0), -2, 2),
    presence_penalty: clamp(Number(body.presence_penalty ?? 0), -2, 2),
    stream,
    ...(stream ? { stream_options: { include_usage: true } } : {}),
    ...(Array.isArray(body.tools) && body.tools.length > 0
      ? { tools: body.tools.slice(0, 8) }
      : {}),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      clearTimeout(timeout);
      const data = await upstream.json().catch(() => ({}));
      const message =
        data?.error?.message ?? "OpenAI request failed. Check your API key.";
      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    if (stream) {
      clearTimeout(timeout);
      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await upstream.json();
    clearTimeout(timeout);
    return NextResponse.json({
      message: data?.choices?.[0]?.message ?? null,
      finish_reason: data?.choices?.[0]?.finish_reason ?? null,
      usage: data?.usage ?? null,
      raw: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Request to OpenAI failed or timed out." },
      { status: 502 }
    );
  }
}
