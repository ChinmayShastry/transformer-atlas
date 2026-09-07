import type { NextRequest } from "next/server";

// A visitor's own key is unlimited — it's their bill. The server key backs a
// small free allowance so casual visitors get live demos without pasting
// anything, and the site can't become an open proxy to one OpenAI account.
//
// IMPORTANT: this counter lives in module memory. Serverless resets it on cold
// start and every instance keeps its own copy, so it bounds casual usage but
// is NOT a hard guarantee against a determined caller. A shared store (Vercel
// KV / Upstash) is required for that, plus a hard spend limit set on the
// OpenAI account itself, which is the only real backstop.
const WINDOW_MS = 60 * 60 * 1000;
const FREE_CALLS_PER_WINDOW = 8;

const hits = new Map<string, number[]>();

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function underAllowance(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= FREE_CALLS_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return true;
}

export interface ResolvedKey {
  key?: string;
  usingServerKey: boolean;
  error?: string;
  status?: number;
}

export function resolveKey(
  userKey: unknown,
  req: NextRequest
): ResolvedKey {
  if (typeof userKey === "string" && userKey.startsWith("sk-")) {
    return { key: userKey, usingServerKey: false };
  }

  const serverKey = process.env.OPENAI_API_KEY;
  if (!serverKey) {
    return {
      usingServerKey: false,
      error: "Add your OpenAI API key to run this.",
      status: 401,
    };
  }

  if (!underAllowance(clientIp(req))) {
    return {
      usingServerKey: true,
      error:
        "You've used the free demo allowance for this hour. Add your own OpenAI key to keep going — it stays in your browser.",
      status: 429,
    };
  }

  return { key: serverKey, usingServerKey: true };
}

export const FREE_ALLOWANCE = FREE_CALLS_PER_WINDOW;
