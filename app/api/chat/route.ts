import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, SYSTEM_PROMPT } from "@/utils/claudeClient";
import {
  buildOutfit,
  buildMultipleOutfits,
  browseCategory,
  completeLook,
  CATALOGUE_BY_ID,
} from "@/lib/outfitEngine";
import { GeneratedOutfit, OutfitContext } from "@/types/fashion";

/* ────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────── */
export interface AnthropicMessage { role: "user" | "assistant"; content: string; }

interface ClaudeIntent {
  intent: "chat" | "outfit" | "multi" | "browse" | "complete_look";
  message: string;
  quick_replies?: string[];
  next_question?: string;
  params?: {
    occasion?: string;
    vibe?: string;
    gender?: string;
    budget?: number;
    count?: number;
    category?: string;
    anchor_sku?: string;
  };
}

/* ────────────────────────────────────────────────────────────────
   Convert an engine outfit → chat-renderable shape
   (matches the existing LookbookChat renderer)
   ──────────────────────────────────────────────────────────────── */
function outfitToChat(o: GeneratedOutfit) {
  const outfit: Record<string, unknown> = {};
  for (const slot of o.slots) {
    outfit[slot.role] = {
      sku:   slot.product.id,
      name:  slot.product.name,
      price: slot.product.price,
      note:  slot.reason,
      emoji: emojiFor(slot.role),
      url:   slot.product.url,
      img:   slot.product.image,
    };
  }
  return {
    occasion:    o.occasion,
    vibe:        o.vibe_label,
    outfit,
    total:       o.total_price,
    budget_note: o.budget_note,
  };
}

function emojiFor(role: string): string {
  switch (role) {
    case "top":        return "👚";
    case "bottom":     return "👖";
    case "dress":      return "👗";
    case "footwear":   return "👟";
    case "bag":        return "👜";
    case "sunglasses": return "🕶️";
    case "necklace":   return "📿";
    case "hat":        return "🧢";
    case "watch":      return "⌚";
    default:           return "✨";
  }
}

/* ────────────────────────────────────────────────────────────────
   Parse Claude's intent response safely
   ──────────────────────────────────────────────────────────────── */
function parseIntent(raw: string): ClaudeIntent | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]);
    if (!obj.intent) return null;
    return obj as ClaudeIntent;
  } catch {
    return null;
  }
}

/* ────────────────────────────────────────────────────────────────
   Fallback if Claude or engine fails
   ──────────────────────────────────────────────────────────────── */
function fallback(reason?: string) {
  console.error("[/api/chat] fallback:", reason);
  return {
    type: "chat",
    message: "Toastie had a moment fr — try asking again! What occasion are we styling?",
    quick_replies: ["☀️ Casual Hangout", "💃 Party Night", "💼 Work Day", "👗 Show Me Dresses", "👟 Show Me Footwear"],
  };
}

/* ────────────────────────────────────────────────────────────────
   Resolve Claude intent → final structured response via the engine
   ──────────────────────────────────────────────────────────────── */
function resolveIntent(intent: ClaudeIntent) {
  const params = intent.params ?? {};
  const ctx: OutfitContext = {
    occasion:   params.occasion?.toLowerCase(),
    vibe:       params.vibe?.toLowerCase(),
    gender:     (params.gender as "female" | "male" | undefined) ?? "female",
    budget:     params.budget,
    anchor_sku: params.anchor_sku,
  };

  switch (intent.intent) {
    case "chat":
      return {
        type: "chat",
        message: intent.message,
        quick_replies: intent.quick_replies ?? [],
      };

    case "outfit": {
      const out = buildOutfit(ctx);
      if (!out) return fallback("buildOutfit returned null");
      return {
        type: "outfit",
        message: intent.message,
        ...outfitToChat(out),
        next_question: intent.next_question,
      };
    }

    case "multi": {
      const count = params.count ?? 3;
      const outs = buildMultipleOutfits(ctx, count);
      if (outs.length === 0) return fallback("buildMultipleOutfits empty");
      return {
        type: "multi",
        message: intent.message,
        looks: outs.map((o, i) => ({
          look_number: i + 1,
          label: o.label,
          ...outfitToChat(o),
        })),
        next_question: intent.next_question,
      };
    }

    case "browse": {
      const cat = params.category ?? "all";
      const gender = params.gender ?? "female";
      const prods = browseCategory(cat, { gender, limit: 12 });
      return {
        type: "products",
        message: intent.message,
        category: cat,
        gender,
        products: prods.map(p => ({
          sku: p.id, name: p.name, price: p.price,
          img: p.image, url: p.url,
          category: p.category, sizes: p.sizes,
          rating: p.rating, isNew: p.isNew,
        })),
        next_question: intent.next_question,
      };
    }

    case "complete_look": {
      if (!params.anchor_sku || !CATALOGUE_BY_ID[params.anchor_sku]) {
        return fallback("complete_look without valid anchor_sku");
      }
      const out = completeLook(params.anchor_sku, ctx);
      if (!out) return fallback("completeLook returned null");
      return {
        type: "outfit",
        message: intent.message,
        ...outfitToChat(out),
        next_question: intent.next_question,
      };
    }

    default:
      return fallback(`unknown intent: ${(intent as { intent: string }).intent}`);
  }
}

/* ────────────────────────────────────────────────────────────────
   POST /api/chat
   ──────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[/api/chat] ANTHROPIC_API_KEY missing");
    return NextResponse.json(fallback("no api key"), { status: 200 });
  }

  try {
    const body = await req.json();
    const { message, history = [] }: { message: string; history: AnthropicMessage[] } = body;
    if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

    const client = getAnthropicClient();
    const messages: AnthropicMessage[] = [
      ...history,
      { role: "user", content: message.trim() },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      system: SYSTEM_PROMPT,
      messages,
      max_tokens: 600, // small now — Claude only returns intent + copy
    });

    const rawText = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("") ?? "";

    if (!rawText) return NextResponse.json(fallback("empty Claude response"), { status: 200 });

    const intent = parseIntent(rawText);
    if (!intent) return NextResponse.json(fallback("intent parse failed"), { status: 200 });

    const resolved = resolveIntent(intent);
    return NextResponse.json({ ...resolved, _raw: rawText });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/chat] error:", msg);
    return NextResponse.json({ ...fallback(msg), _debugError: msg }, { status: 200 });
  }
}
