import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, hasAnthropicKey } from "@/utils/claudeClient";
import { checkRateLimit, maybeSweepRateLimitBuckets } from "@/utils/rateLimit";

const TAG_PROMPT = `Analyze this clothing/accessory image. Return ONLY valid JSON (no markdown):
{
  "category": "one of: Tops, Bottoms, Jeans, Trousers, Shirts, T-Shirts, Kurtas, Dresses, Sarees, Blazers, Jackets, Footwear, Handbags, Jewelry, Watches, Belts, Ethnic Wear, Activewear, Loungewear, Outerwear, Accessories",
  "color": "primary color name",
  "pattern": "Solid, Striped, Plaid, Floral, Abstract, Animal Print, Geometric, Polka Dot, Tie-Dye, or other",
  "season": "Spring, Summer, Autumn, Winter, or All-Season",
  "occasion": "Casual, Work, Party, Wedding, Beach, Gym, Lounge, Festive, Date Night, or Everyday",
  "style": "aesthetic like Quiet Luxury, Streetwear, Boho, Minimalist, Y2K, Classic, Ethnic, Athleisure, etc.",
  "fabric": "best guess: Cotton, Linen, Silk, Denim, Polyester, Wool, Chiffon, Satin, Leather, Knit, etc.",
  "brand": "brand name if visible on item, else empty string",
  "fit": "Slim, Regular, Oversized, Relaxed, Tailored, Cropped, or Flowy",
  "tags": ["3-5 descriptive tags"]
}`;

function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const bare = raw.match(/\{[\s\S]*\}/);
  return bare ? bare[0] : null;
}

type AllowedMime = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const ALLOWED_MIMES: readonly AllowedMime[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  maybeSweepRateLimitBuckets();
  const limited = checkRateLimit(req, { windowMs: 60_000, max: 10, key: "wardrobe-tag" });
  if (limited) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!hasAnthropicKey()) return NextResponse.json({ error: "API key not configured." }, { status: 503 });

  let body: { image?: string; mime?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const { image, mime } = body;
  if (!image || !mime) return NextResponse.json({ error: "Missing image or mime." }, { status: 400 });
  if (!(ALLOWED_MIMES as readonly string[]).includes(mime)) return NextResponse.json({ error: "Unsupported image type." }, { status: 415 });

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mime as AllowedMime, data: image } },
          { type: "text", text: TAG_PROMPT },
        ],
      }],
    });

    const rawText = response.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("");
    const jsonStr = extractJson(rawText);
    if (!jsonStr) return NextResponse.json({ error: "Could not parse AI response." }, { status: 502 });

    return NextResponse.json(JSON.parse(jsonStr));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[wardrobe-tag] error:", msg);
    return NextResponse.json({ error: `Tagging failed: ${msg.slice(0, 150)}` }, { status: 500 });
  }
}
