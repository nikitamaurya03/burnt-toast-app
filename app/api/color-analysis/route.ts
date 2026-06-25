import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, hasAnthropicKey } from "@/utils/claudeClient";
import { checkRateLimit, maybeSweepRateLimitBuckets } from "@/utils/rateLimit";
import type {
  ColorAnalysisResult,
  ValidationResult,
} from "@/types/colorAnalysis";
import { SEASON_PALETTES, SEASON_DESCRIPTIONS, SEASON_METALS } from "@/lib/colorAnalysis/palettes";

/* ────────────────────────────────────────────────────────────────
   Constants — passed to Claude so it knows what seasons/metals exist.
   We serialize them once at module load, not per-request.
   ──────────────────────────────────────────────────────────────── */
const SEASON_NAMES = Object.keys(SEASON_PALETTES).join(", ");

// Provide a brief lookup of metals per season so the AI can reference them.
const METALS_HINT = Object.entries(SEASON_METALS)
  .map(([s, m]) => `${s}: ${m.join(", ")}`)
  .join("; ");

// Provide season descriptions so Claude can echo the right narrative language.
const SEASON_DESC_HINT = Object.entries(SEASON_DESCRIPTIONS)
  .map(([s, d]) => `${s} — ${d}`)
  .join("\n");

/* ────────────────────────────────────────────────────────────────
   Main analysis prompt
   ──────────────────────────────────────────────────────────────── */
const ANALYSIS_PROMPT = `You are an expert personal color analyst with 15+ years of experience in the 12/16-season color system. You have a warm, encouraging personality — like a knowledgeable friend who genuinely wants to help someone look their best.

A customer has uploaded a photo of their face. Your task is to analyze their natural coloring and classify them into the 16-season color system.

═══════════════════════════════════════════════════════════
AVAILABLE SEASONS (use EXACTLY one of these names)
═══════════════════════════════════════════════════════════
${SEASON_NAMES}

═══════════════════════════════════════════════════════════
SEASON DESCRIPTIONS (reference when writing reasoning)
═══════════════════════════════════════════════════════════
${SEASON_DESC_HINT}

═══════════════════════════════════════════════════════════
METALS BY SEASON (use when recommending jewelry)
═══════════════════════════════════════════════════════════
${METALS_HINT}

═══════════════════════════════════════════════════════════
ANALYSIS INSTRUCTIONS
═══════════════════════════════════════════════════════════

Step 1 — Face Attributes
Observe the person's natural coloring:
- skin_tone: descriptive name (e.g. "warm ivory", "golden beige", "rich mahogany", "cool porcelain")
- skin_depth: "fair" | "light" | "medium" | "tan" | "deep"
- skin_brightness: 0–100 (how luminous/reflective vs matte)
- skin_saturation: 0–100 (how much colour is in the skin vs neutral)
- eye_color: specific description (e.g. "warm hazel with golden flecks", "deep cool brown", "clear blue-green")
- hair_color: current natural or dyed colour (e.g. "warm chestnut brown", "cool ash blonde")
- hair_depth: "very light" | "light" | "medium" | "dark" | "very dark"
- lip_color: natural lip colour (e.g. "warm peachy pink", "cool mauve-rose", "deep berry")
- contrast_level: "low" | "medium" | "high" (overall face contrast between features)

Step 2 — Undertone Analysis
Determine whether this person's undertone is warm, cool, neutral, or olive.
Score each on 0–100 (all four should sum to roughly 100). Confidence is 0–100.

Step 3 — Contrast Analysis
- hair_vs_skin: 0–100 (how different hair is from skin tone)
- eyes_vs_skin: 0–100 (how different eye colour is from skin tone)
- score: 0–100 (overall facial contrast)
- contrast: "low" | "medium" | "high"

Step 4 — Season Classification (16-season system)
- primary: the person's main season (MUST be one of the 16 names above, exact spelling)
- secondary: their second-closest season (or same if they're a textbook match)
- confidence: 0–100
- reasoning: 2-3 sentences explaining why this season fits

Step 5 — Best Colors (12–16 colors)
Each color MUST follow this exact shape:
{
  "name": "Color Name",
  "hex": "#RRGGBB",
  "rgb": "R,G,B",          ← a STRING like "255,107,70" — NOT an object
  "category": "primary" | "secondary" | "accent" | "business" | "casual" | "statement" | "formal",
  "why_it_works": "One short sentence explaining why this color flatters this person."
}

Step 6 — Neutrals
best_whites: 2–3 white/near-white tones that work (warm white vs cool white vs soft white, etc.)
best_blacks: 2–3 near-black tones (true black, charcoal, soft black, navy, etc. — not all of these if they don't suit, but always give at least 1–2 options)
business_neutrals: 3–4 professional neutral tones
casual_neutrals: 3–4 everyday neutral tones
denim_recommendations: array of 2–3 strings (e.g. "Medium indigo wash — classic and universally flattering for warm seasons")

All color entries here must also use rgb as a STRING "R,G,B".

Step 7 — Avoid Colors (6–8 colors)
Colors that actively clash with this person's coloring. Same hex/rgb/name format, plus a "reason" field (1 sentence).
rgb must also be a STRING here.

Step 8 — Beauty Recommendations
lipstick: 3–4 flattering lipstick/lip colour shades (ColorEntry format, rgb as STRING)
blush: 2–3 flattering blush shades (ColorEntry format, rgb as STRING)
eyeshadow: 3–4 flattering eyeshadow shades (ColorEntry format, rgb as STRING)
jewelry: string — e.g. "Gold and rose gold metals are most flattering; avoid stark silver."
frames: 2–3 flattering eyeglass frame colours (ColorEntry format, rgb as STRING)
handbags: 2–3 flattering handbag colours (ColorEntry format, rgb as STRING)
footwear: 2–3 flattering footwear colours (ColorEntry format, rgb as STRING)

Step 9 — Styling Recommendations (all 6 categories)
For EACH of these categories: workwear, casual, vacation, evening, wedding_guest, activewear
{
  "category": "workwear",
  "description": "2–3 sentence styling narrative for this person in this context.",
  "color_suggestions": ["3–4 specific color names or hex codes"],
  "outfit_ideas": ["2–3 concrete outfit concept strings, e.g. 'Terracotta linen blazer over a cream silk blouse with camel trousers'"]
}

Step 10 — Clothing Comparison
Show three different scenarios side by side:
best_match: { color: (ColorEntry, rgb as STRING), explanation: "Why this is ideal" }
neutral:    { color: (ColorEntry, rgb as STRING), explanation: "A safe, wearable neutral" }
avoid:      { color: (ColorEntry, rgb as STRING), explanation: "Why to avoid this" }

Step 11 — Narrative (Toastie's voice)
Write 150–250 words as Toastie, Burnt Toast's AI stylist. Be warm, personal, encouraging.
Mention: their season name, a couple of standout colors from their palette, their undertone, one beauty tip (lipstick or blush shade), and end with an encouraging line about owning their coloring.
Do NOT be clinical or listy — this is a conversation, not a report.

═══════════════════════════════════════════════════════════
OUTPUT RULES — CRITICAL
═══════════════════════════════════════════════════════════
- Return ONLY a single valid JSON object. No markdown fences, no text outside the JSON.
- rgb values must ALWAYS be strings like "255,107,70" — never objects like {"r":255,"g":107,"b":70}
- All 6 styling categories (workwear, casual, vacation, evening, wedding_guest, activewear) must be present.
- All 5 beauty sub-fields (lipstick, blush, eyeshadow, jewelry, frames, handbags, footwear) must be present.
- The clothing_comparison must have all three slots (best_match, neutral, avoid).
- Season name must exactly match one of the 16 names listed above (case-sensitive).

JSON shape to return (no extra keys, no omissions):
{
  "face_attributes": {
    "skin_tone": string,
    "skin_depth": string,
    "skin_brightness": number,
    "skin_saturation": number,
    "eye_color": string,
    "hair_color": string,
    "hair_depth": string,
    "lip_color": string,
    "contrast_level": string
  },
  "undertone": {
    "undertone": "warm" | "cool" | "neutral" | "olive",
    "warm_score": number,
    "cool_score": number,
    "neutral_score": number,
    "olive_score": number,
    "confidence": number,
    "reasoning": string
  },
  "contrast": {
    "contrast": "low" | "medium" | "high",
    "hair_vs_skin": number,
    "eyes_vs_skin": number,
    "score": number
  },
  "season": {
    "primary": string,
    "secondary": string,
    "confidence": number,
    "reasoning": string
  },
  "best_colors": [ { "name": string, "hex": string, "rgb": string, "category": string, "why_it_works": string } ],
  "neutrals": {
    "best_whites": [ ColorEntry ],
    "best_blacks": [ ColorEntry ],
    "business_neutrals": [ ColorEntry ],
    "casual_neutrals": [ ColorEntry ],
    "denim_recommendations": [ string ]
  },
  "avoid_colors": [ { "name": string, "hex": string, "rgb": string, "reason": string } ],
  "beauty": {
    "lipstick": [ ColorEntry ],
    "blush": [ ColorEntry ],
    "eyeshadow": [ ColorEntry ],
    "jewelry": string,
    "frames": [ ColorEntry ],
    "handbags": [ ColorEntry ],
    "footwear": [ ColorEntry ]
  },
  "styling": [
    { "category": string, "description": string, "color_suggestions": [string], "outfit_ideas": [string] }
  ],
  "clothing_comparison": {
    "best_match": { "color": ColorEntry, "explanation": string },
    "neutral":    { "color": ColorEntry, "explanation": string },
    "avoid":      { "color": ColorEntry, "explanation": string }
  },
  "narrative": string
}`;

/* ────────────────────────────────────────────────────────────────
   Validation prompt (short, cheap call)
   ──────────────────────────────────────────────────────────────── */
const VALIDATION_PROMPT = `You are a photo quality checker for a personal color analysis tool.
Examine this image and determine if it is suitable for color analysis.

A suitable image must:
1. Clearly show a human face (front-facing or at a slight angle is fine)
2. Have reasonable lighting — not heavily shadowed, backlit, or in harsh direct flash
3. Show the person's natural hair color and skin tone (not obscured by heavy filters, extreme color grading, or full face paint)
4. Not be a cartoon, illustration, or heavily AI-generated image
5. Not be a group photo where no single face dominates

Return ONLY valid JSON, no markdown, no extra text:
{
  "valid": true | false,
  "issues": ["list any issues found; empty array if valid"],
  "confidence": 0–100
}`;

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */
function extractJson(raw: string): string | null {
  // Strip markdown fences if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  // Fall back to first {...} block
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

/* ────────────────────────────────────────────────────────────────
   POST /api/color-analysis
   Body: { action?: "analyze" | "validate", image: string, mime: string }
   ──────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  // ── Sweep stale rate-limit buckets (cheap, amortised over requests) ──
  maybeSweepRateLimitBuckets();

  // ── Rate limit: 5 requests / minute / IP ──
  const limited = checkRateLimit(req, { windowMs: 60_000, max: 5, key: "color-analysis" });
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  // ── API key guard ──
  if (!hasAnthropicKey()) {
    console.error("[/api/color-analysis] ANTHROPIC_API_KEY missing");
    return NextResponse.json(
      { error: "Service configuration error — API key not found." },
      { status: 503 },
    );
  }

  /* ── Parse request body ── */
  let body: { action?: string; image?: string; mime?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { action = "analyze", image, mime } = body;

  /* ── Input validation ── */
  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "Missing or invalid image field (expected base64 string)." }, { status: 400 });
  }
  if (!mime || typeof mime !== "string") {
    return NextResponse.json({ error: "Missing or invalid mime field." }, { status: 400 });
  }
  if (!(ALLOWED_MIMES as readonly string[]).includes(mime)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${mime}. Supported: ${ALLOWED_MIMES.join(", ")}` },
      { status: 415 },
    );
  }
  // 20 MB base64 limit (base64 is ~33% larger than binary, so 20MB base64 ≈ 15MB binary)
  const MAX_BASE64_LEN = 20 * 1024 * 1024;
  if (image.length > MAX_BASE64_LEN) {
    return NextResponse.json({ error: "Image too large — maximum 15MB." }, { status: 413 });
  }
  if (action !== "analyze" && action !== "validate") {
    return NextResponse.json({ error: "Unknown action. Use 'analyze' or 'validate'." }, { status: 400 });
  }

  const mimeType = sanitizeMime(mime);

  try {
    const client = getAnthropicClient();

    /* ══════════════════════════════════════════════════════════
       ACTION: validate
       ════════════════════════════════════════════════════════ */
    if (action === "validate") {
      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 256,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: image },
            },
            { type: "text", text: VALIDATION_PROMPT },
          ],
        }],
      });

      const rawText = response.content
        .filter(b => b.type === "text")
        .map(b => (b as { type: "text"; text: string }).text)
        .join("");

      const jsonStr = extractJson(rawText);
      if (!jsonStr) {
        console.error("[/api/color-analysis] validate: failed to extract JSON:", rawText.slice(0, 200));
        return NextResponse.json({ error: "Could not parse validation response from AI." }, { status: 502 });
      }

      const validation: ValidationResult = JSON.parse(jsonStr);
      return NextResponse.json(validation);
    }

    /* ══════════════════════════════════════════════════════════
       ACTION: analyze (default)
       ════════════════════════════════════════════════════════ */
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType, data: image },
          },
          { type: "text", text: ANALYSIS_PROMPT },
        ],
      }],
    });

    const rawText = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    const jsonStr = extractJson(rawText);
    if (!jsonStr) {
      console.error("[/api/color-analysis] analyze: failed to extract JSON:", rawText.slice(0, 300));
      return NextResponse.json(
        { error: "Could not extract analysis from AI response. Please try again." },
        { status: 502 },
      );
    }

    /* Parse the raw AI result (everything except id and created_at) */
    const partial = JSON.parse(jsonStr) as Omit<ColorAnalysisResult, "id" | "created_at">;

    /* Add server-side fields */
    const result: ColorAnalysisResult = {
      ...partial,
      id: crypto.randomUUID(),
      created_at: Date.now(),
    };

    return NextResponse.json(result);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[/api/color-analysis] error:", msg);

    // Surface Anthropic errors with a helpful message, hide internal details from clients.
    if (msg.includes("Could not process image") || msg.includes("Invalid image")) {
      return NextResponse.json(
        { error: "The image could not be processed. Please upload a clear, well-lit photo of your face." },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again in a moment." },
      { status: 500 },
    );
  }
}
