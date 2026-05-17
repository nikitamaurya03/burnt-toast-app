import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, SYSTEM_PROMPT } from "@/utils/claudeClient";

/* ── Types ─────────────────────────────────────────────────────── */
export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ExtractedFilters {
  gender:    "female" | "male" | null;
  occasion:  string | null;
  colors:    string[];
  budgetMin: number;
  budgetMax: number | null;
  bodyType:  string | null;
}

export interface ChatAPIResponse {
  message:      string;
  filters:      ExtractedFilters;
  isComplete:   boolean;
  quickReplies: string[];
}

/* ── Default / fallback ─────────────────────────────────────────── */
const DEFAULT_FILTERS: ExtractedFilters = {
  gender:    null,
  occasion:  null,
  colors:    [],
  budgetMin: 0,
  budgetMax: null,
  bodyType:  null,
};

function fallbackResponse(reason?: string): ChatAPIResponse {
  console.error("[/api/chat] Returning fallback. Reason:", reason ?? "unknown");
  return {
    message:
      "I'm having a moment — let me try again! What occasion are you shopping for?",
    filters:      DEFAULT_FILTERS,
    isComplete:   false,
    quickReplies: ["☕ Coffee Run", "🎓 College Day", "🌙 Night Out", "🏖️ Beach Vibes", "💪 Active Day", "💼 Work Mode"],
  };
}

/* ── Parse Claude response safely ───────────────────────────────── */
function parseResponse(raw: string): ChatAPIResponse {
  try {
    // Strip markdown code fences if Claude wraps the JSON
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    // Try direct parse first; if that fails, try regex JSON extraction
    let jsonStr = cleaned;
    try {
      JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("no JSON object found in response");
      jsonStr = match[0];
    }

    const parsed = JSON.parse(jsonStr);

    const f = parsed.filters ?? {};
    const filters: ExtractedFilters = {
      gender:    f.gender    ?? null,
      occasion:  f.occasion  ?? null,
      colors:    Array.isArray(f.colors) ? f.colors : [],
      budgetMin: typeof f.budgetMin === "number" ? f.budgetMin : 0,
      budgetMax: typeof f.budgetMax === "number" ? f.budgetMax : null,
      bodyType:  f.bodyType  ?? null,
    };

    return {
      message:      String(parsed.message ?? ""),
      filters,
      isComplete:   Boolean(parsed.isComplete),
      quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies : [],
    };
  } catch (err) {
    // NEVER expose raw JSON as the message — always return a friendly fallback
    console.error("[/api/chat] parseResponse failed:", (err as Error).message, "| raw[:150]:", raw.slice(0, 150));
    return fallbackResponse("JSON parse failed");
  }
}

/* ── POST /api/chat ─────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* ── Guard: API key must exist ───────────────────────────────── */
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[/api/chat] ANTHROPIC_API_KEY is not set!");
    return NextResponse.json(
      fallbackResponse("ANTHROPIC_API_KEY env var missing"),
      { status: 200 }
    );
  }

  try {
    const body = await req.json();
    const {
      message,
      history = [],
    }: { message: string; history: AnthropicMessage[] } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const client = getAnthropicClient();

    const messages: AnthropicMessage[] = [
      ...history,
      { role: "user", content: message.trim() },
    ];

    /* ── Call Claude — use claude-haiku-4-5 (fast, reliable, all tiers) ── */
    const response = await client.messages.create({
      model:      "claude-haiku-4-5",
      system:     SYSTEM_PROMPT,
      messages,
      max_tokens: 2048,   // multi-look JSON with full CDN URLs needs ~1500+ tokens
    });

    // Extract the text content from Claude's response
    const rawText =
      response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("") ?? "";

    if (!rawText) {
      return NextResponse.json(
        fallbackResponse("empty response from Claude"),
        { status: 200 }
      );
    }

    const parsed = parseResponse(rawText);

    return NextResponse.json({ ...parsed, _raw: rawText });

  } catch (error: unknown) {
    /* ── Log the REAL error so it shows in Vercel Function Logs ─── */
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/chat] Claude API error:", msg);

    /* ── Surface the error type in response for easier debugging ── */
    const fb = fallbackResponse(msg);
    return NextResponse.json(
      { ...fb, _debugError: msg },
      { status: 200 }
    );
  }
}
