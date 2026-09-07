import { NextRequest, NextResponse } from "next/server";
import { resolveKey } from "@/lib/allowance";

interface EmbeddingsBody {
  texts: string[];
  apiKey: string;
}

export async function POST(req: NextRequest) {
  let body: EmbeddingsBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { texts } = body;

  const resolved = resolveKey(body.apiKey, req);
  if (!resolved.key) {
    return NextResponse.json(
      { error: resolved.error, needsKey: true },
      { status: resolved.status ?? 401 }
    );
  }
  const apiKey = resolved.key;

  if (!Array.isArray(texts) || texts.length === 0 || texts.length > 40) {
    return NextResponse.json(
      { error: "Between 1 and 40 texts are required." },
      { status: 400 }
    );
  }
  if (texts.some((t) => typeof t !== "string" || t.length === 0)) {
    return NextResponse.json(
      { error: "Every text must be a non-empty string." },
      { status: 400 }
    );
  }
  if (texts.reduce((sum, t) => sum + t.length, 0) > 4000) {
    return NextResponse.json(
      { error: "Input is too long for this demo (max 4000 characters)." },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstream = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: texts,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await upstream.json();

    if (!upstream.ok) {
      const message =
        data?.error?.message ?? "OpenAI request failed. Check your API key.";
      return NextResponse.json({ error: message }, { status: upstream.status });
    }

    const sorted = [...(data?.data ?? [])].sort(
      (a, b) => (a.index ?? 0) - (b.index ?? 0)
    );

    return NextResponse.json({
      embeddings: sorted.map((d: { embedding: number[] }) => d.embedding),
      usage: data?.usage ?? null,
      dimensions: sorted[0]?.embedding?.length ?? 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Request to OpenAI failed or timed out." },
      { status: 502 }
    );
  }
}
