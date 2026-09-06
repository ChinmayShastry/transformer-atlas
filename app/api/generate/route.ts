import { NextRequest, NextResponse } from "next/server";

interface GenerateBody {
  prompt: string;
  temperature: number;
  apiKey: string;
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { prompt, temperature, apiKey } = body;

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return NextResponse.json(
      { error: "A valid OpenAI API key is required." },
      { status: 401 }
    );
  }
  if (!prompt || typeof prompt !== "string" || prompt.length > 500) {
    return NextResponse.json(
      { error: "Prompt is required and must be under 500 characters." },
      { status: 400 }
    );
  }

  const clampedTemp = Math.min(2, Math.max(0, Number(temperature) || 0.7));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a concise text-completion demo inside a Transformers educational site. Continue the user's sentence naturally in one short sentence. No preamble, no quotes.",
          },
          { role: "user", content: prompt },
        ],
        temperature: clampedTemp,
        max_tokens: 60,
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

    const text: string = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ text: text.trim() });
  } catch {
    return NextResponse.json(
      { error: "Request to OpenAI failed or timed out." },
      { status: 502 }
    );
  }
}
