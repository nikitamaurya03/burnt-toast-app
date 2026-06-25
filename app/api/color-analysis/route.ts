import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, hasAnthropicKey } from "@/utils/claudeClient";
import { checkRateLimit, maybeSweepRateLimitBuckets } from "@/utils/rateLimit";
import type {
  ColorAnalysisResult,
  ValidationResult,
} from "@/types/colorAnalysis";
import { SEASON_PALETTES, SEASON_METALS } from "@/lib/colorAnalysis/palettes";

const SEASON_NAMES = Object.keys(SEASON_PALETTES).join(", ");

/* ── Compact analysis prompt — optimized for speed ──────────────── */
const ANALYSIS_PROMPT = `You are an expert personal color analyst. Analyze this face photo and classify into the 16-season color system.

SEASONS: ${SEASON_NAMES}

Return ONLY valid JSON (no markdown fences). All "rgb" fields must be STRINGS like "255,107,70" — never objects.

{
  "face_attributes": { "skin_tone": str, "skin_depth": "fair"|"light"|"medium"|"tan"|"deep", "skin_brightness": 0-100, "skin_saturation": 0-100, "eye_color": str, "hair_color": str, "hair_depth": "very light"|"light"|"medium"|"dark"|"very dark", "lip_color": str, "contrast_level": "low"|"medium"|"high" },
  "undertone": { "undertone": "warm"|"cool"|"neutral"|"olive", "warm_score": 0-100, "cool_score": 0-100, "neutral_score": 0-100, "olive_score": 0-100, "confidence": 0-100, "reasoning": str },
  "contrast": { "contrast": "low"|"medium"|"high", "hair_vs_skin": 0-100, "eyes_vs_skin": 0-100, "score": 0-100 },
  "season": { "primary": str (exact season name), "secondary": str, "confidence": 0-100, "reasoning": str },
  "best_colors": [ 10 items: { "name": str, "hex": "#RRGGBB", "rgb": "R,G,B", "category": "primary"|"secondary"|"accent"|"business"|"casual"|"statement"|"formal", "why_it_works": str } ],
  "neutrals": { "best_whites": [2 ColorEntry], "best_blacks": [2 ColorEntry], "business_neutrals": [3 ColorEntry], "casual_neutrals": [3 ColorEntry], "denim_recommendations": [2 strings] },
  "avoid_colors": [ 4 items: { "name": str, "hex": str, "rgb": "R,G,B", "reason": str } ],
  "beauty": { "lipstick": [2 ColorEntry], "blush": [2 ColorEntry], "eyeshadow": [2 ColorEntry], "jewelry": str, "frames": [2 ColorEntry], "handbags": [2 ColorEntry], "footwear": [2 ColorEntry] },
  "styling": [ for EACH of workwear,casual,evening: { "category": str, "description": str, "color_suggestions": [3 strs], "outfit_ideas": [2 strs] } ],
  "clothing_comparison": { "best_match": { "color": ColorEntry, "explanation": str }, "neutral": { "color": ColorEntry, "explanation": str }, "avoid": { "color": ColorEntry, "explanation": str } },
  "narrative": "80-120 word warm personal note as Toastie, the AI stylist. Mention their season, standout colors, undertone, one beauty tip."
}

ColorEntry = { "name": str, "hex": "#RRGGBB", "rgb": "R,G,B", "category": str, "why_it_works": str }
Keep responses concise. Output ONLY the JSON object.`;

const VALIDATION_PROMPT = `Check if this image is suitable for personal color analysis. Needs: visible human face, reasonable lighting, natural coloring visible (no heavy filters).
Return ONLY JSON: { "valid": true|false, "issues": [strings], "confidence": 0-100 }`;

/* ── Helpers ─────────────────────────────────────────────────────── */
function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const bare = raw.match(/\{[\s\S]*\}/);
  return bare ? bare[0] : null;
}

type AllowedMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const ALLOWED_MIMES: readonly AllowedMime[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function sanitizeMime(mime: string): AllowedMime {
  return (ALLOWED_MIMES as readonly string[]).includes(mime)
    ? (mime as AllowedMime)
    : "image/jpeg";
}

/* ── POST /api/color-analysis ────────────────────────────────────── */
export async function POST(req: NextRequest) {
  maybeSweepRateLimitBuckets();

  const limited = checkRateLimit(req, { windowMs: 60_000, max: 5, key: "color-analysis" });
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  if (!hasAnthropicKey()) {
    return NextResponse.json({ error: "Service configuration error — API key not found." }, { status: 503 });
  }

  let body: { action?: string; image?: string; mime?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action = "analyze", image, mime } = body;

  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "Missing or invalid image field." }, { status: 400 });
  }
  if (!mime || typeof mime !== "string") {
    return NextResponse.json({ error: "Missing or invalid mime field." }, { status: 400 });
  }
  if (!(ALLOWED_MIMES as readonly string[]).includes(mime)) {
    return NextResponse.json({ error: `Unsupported image type: ${mime}` }, { status: 415 });
  }
  if (image.length > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large — maximum 15MB." }, { status: 413 });
  }
  if (action !== "analyze" && action !== "validate") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const mimeType = sanitizeMime(mime);

  try {
    const client = getAnthropicClient();
    const imageContent = {
      type: "image" as const,
      source: { type: "base64" as const, media_type: mimeType, data: image },
    };

    /* ── Validate ─────────────────────────────────────────────── */
    if (action === "validate") {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{ role: "user", content: [imageContent, { type: "text", text: VALIDATION_PROMPT }] }],
      });

      const rawText = response.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("");
      const jsonStr = extractJson(rawText);
      if (!jsonStr) {
        return NextResponse.json({ error: "Could not parse validation response." }, { status: 502 });
      }
      return NextResponse.json(JSON.parse(jsonStr) as ValidationResult);
    }

    /* ── Analyze ──────────────────────────────────────────────── */
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 5000,
      messages: [{ role: "user", content: [imageContent, { type: "text", text: ANALYSIS_PROMPT }] }],
    });

    if (response.stop_reason === "max_tokens") {
      console.error("[color-analysis] response truncated at max_tokens");
    }

    const rawText = response.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("");
    const jsonStr = extractJson(rawText);

    if (!jsonStr) {
      console.error("[color-analysis] no JSON found in response:", rawText.slice(0, 300));
      return NextResponse.json({ error: "Could not extract analysis. Please try again." }, { status: 502 });
    }

    let partial: Omit<ColorAnalysisResult, "id" | "created_at">;
    try {
      partial = JSON.parse(jsonStr);
    } catch (e) {
      console.error("[color-analysis] JSON parse failed:", (e as Error).message);
      return NextResponse.json({ error: "AI response was incomplete. Please try again." }, { status: 502 });
    }

    // Fill in missing styling categories with defaults
    type StylingCategory = "workwear" | "casual" | "vacation" | "evening" | "wedding_guest" | "activewear";
    const requiredCategories: StylingCategory[] = ["workwear", "casual", "evening"];
    const existingCategories = new Set((partial.styling || []).map(s => s.category));
    for (const cat of requiredCategories) {
      if (!existingCategories.has(cat)) {
        (partial.styling = partial.styling || []).push({
          category: cat,
          description: `Explore ${cat} looks in your ${partial.season?.primary || "seasonal"} palette.`,
          color_suggestions: [],
          outfit_ideas: [],
        });
      }
    }

    const result: ColorAnalysisResult = {
      ...partial,
      id: crypto.randomUUID(),
      created_at: Date.now(),
    };

    return NextResponse.json(result);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[color-analysis] error:", msg);

    if (msg.includes("Could not process image") || msg.includes("Invalid image")) {
      return NextResponse.json(
        { error: "The image could not be processed. Please upload a clear, well-lit photo." },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: `Analysis failed: ${msg.slice(0, 150)}` },
      { status: 500 },
    );
  }
}
