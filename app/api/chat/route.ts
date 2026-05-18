import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, SYSTEM_PROMPT } from "@/utils/claudeClient";
import {
  buildOutfit,
  buildMultipleOutfits,
  browseCategory,
  completeLook,
  findAnchorByColorAndCategory,
  CATALOGUE_BY_ID,
} from "@/lib/outfitEngine";
import { explainOutfit } from "@/lib/styleExplainer";
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
    color?: string;
    anchor_category?: string;
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
      sku:    slot.product.id,
      name:   slot.product.name,
      price:  slot.product.price,
      note:   slot.reason,
      emoji:  emojiFor(slot.role),
      url:    slot.product.url,
      img:    slot.product.image,
      colors: slot.product.color ?? [],
      color_family: slot.product.color_family,
    };
  }
  return {
    occasion:    o.occasion,
    vibe:        o.vibe_label,
    outfit,
    total:       o.total_price,
    budget_note: o.budget_note,
    style_notes: explainOutfit(o),
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
  const colorPref = params.color ? [params.color.toLowerCase()] : undefined;

  // If user said e.g. "white dress" — find the actual white dress and use it as anchor
  let resolvedAnchorSku = params.anchor_sku;
  if (!resolvedAnchorSku && params.color && params.anchor_category) {
    const anchor = findAnchorByColorAndCategory(
      params.anchor_category,
      params.color,
      params.gender,
    );
    if (anchor) resolvedAnchorSku = anchor.id;
  }

  const ctx: OutfitContext = {
    occasion:         params.occasion?.toLowerCase(),
    vibe:             params.vibe?.toLowerCase(),
    gender:           (params.gender as "female" | "male" | undefined) ?? "female",
    budget:           params.budget,
    anchor_sku:       resolvedAnchorSku,
    preferred_colors: colorPref,
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
      if (!out) {
        return {
          type: "chat",
          message: ctx.gender === "male"
            ? "Bestie, our men's drop is still cooking 👨‍🍳 — only got jeans + footwear right now. Want me to show you what we DO have, or build something unisex?"
            : "Couldn't build that exact look fr. Try a different occasion or vibe? Or just say 'show me dresses' / 'show me tops' to browse.",
          quick_replies: ["👟 Show Footwear", "👗 Show Dresses", "☀️ Casual Look", "💃 Party Look"],
        };
      }
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
      if (outs.length === 0) {
        return {
          type: "chat",
          message: "Couldn't find enough options for that fr. Try a different occasion?",
          quick_replies: ["☀️ Casual Look", "💃 Party Night", "💼 Work Day", "👗 Show Dresses"],
        };
      }
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
      const requestedColor = params.color?.toLowerCase();
      // Strict color filter first
      let prods = browseCategory(cat, {
        gender,
        colors: requestedColor ? [requestedColor] : undefined,
        limit: 12,
      });

      // HONESTY: if user asked for a color and we have zero, tell them the truth
      // and show the closest alternatives (same category, any color)
      if (requestedColor && prods.length === 0) {
        const fallback = browseCategory(cat, { gender, limit: 8 });
        return {
          type: "products",
          message: `No cap — we don't have any ${requestedColor} ${cat.toLowerCase()} in the Spring 26 drop rn 😅 But here's what IS bussin in ${cat.toLowerCase()}:`,
          category: cat,
          gender,
          products: fallback.map(p => ({
            sku: p.id, name: p.name, price: p.price,
            img: p.image, url: p.url,
            category: p.category, sizes: p.sizes,
            rating: p.rating, isNew: p.isNew,
            colors: p.color ?? [],
            color_family: p.color_family,
          })),
          next_question: "Want me to switch to a different color?",
        };
      }

      // Adjust message if Claude wrote color-specific copy but we found matches
      const messageOk = !requestedColor || prods.every(p => p.color?.some(c => c.toLowerCase().includes(requestedColor)));
      const finalMessage = messageOk
        ? intent.message
        : `Here's what we have in ${requestedColor} ${cat.toLowerCase()} — straight heat 🔥`;

      return {
        type: "products",
        message: finalMessage,
        category: cat,
        gender,
        products: prods.map(p => ({
          sku: p.id, name: p.name, price: p.price,
          img: p.image, url: p.url,
          category: p.category, sizes: p.sizes,
          rating: p.rating, isNew: p.isNew,
          colors: p.color ?? [],
          color_family: p.color_family,
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
