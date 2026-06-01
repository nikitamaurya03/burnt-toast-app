import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey } from "@/utils/geminiKey";

/* ─────────────────────────────────────────────────────────────────
   Virtual Try-On — Gemini Image Generation
   ─────────────────────────────────────────────────────────────────
   Takes the user's photo + the current outfit (from session state)
   and generates a realistic image of the user wearing the look.

   - Does NOT touch any existing API (chat / tryon / image-style)
   - Uses Gemini's image-capable model via REST (no SDK conflict)
   - Returns base64 image data the client can render + download
   ───────────────────────────────────────────────────────────────── */

/* Gemini 3 Pro Image — best-in-class for preserving product detail
   when reference images are supplied alongside the user photo.    */
const GEMINI_MODEL = "gemini-3-pro-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/* ── Allowed image mime types from upload ─────────────────────── */
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface OutfitItemPayload {
  sku?: string;
  name?: string;
  price?: number;
  note?: string;
  url?: string;
  img?: string | null;
  colors?: string[];
  color_family?: string;
}

interface TryOnRequest {
  userPhoto:    string;      // base64 (no data: prefix)
  userMime?:    string;      // image/jpeg | image/png | image/webp
  bodyType?:    string;      // slim | athletic | regular | curvy | plus-size | prefer-not-to-say
  outfit?:      Record<string, OutfitItemPayload>;
}

/* ── Slot-friendly labels ─────────────────────────────────────── */
const SLOT_LABELS: Record<string, string> = {
  top:        "TOP",
  bottom:     "BOTTOM",
  dress:      "DRESS",
  footwear:   "FOOTWEAR",
  bag:        "BAG",
  sunglasses: "SUNGLASSES",
  necklace:   "NECKLACE",
  hat:        "HAT",
  watch:      "WATCH",
};

/* ── Build the rich text prompt from outfit data ───────────────── */
function buildPrompt(outfit: Record<string, OutfitItemPayload>, bodyType?: string): string {
  const slots: string[] = [];
  for (const [role, item] of Object.entries(outfit)) {
    if (!item?.name) continue;
    const label = SLOT_LABELS[role] ?? role.toUpperCase();
    const color = item.colors?.[0] ? `in ${item.colors[0]}` : "";
    const family = item.color_family ? `(${item.color_family} family)` : "";
    const note = item.note ? ` — ${item.note}` : "";
    slots.push(`- ${label}: ${item.name} ${color} ${family}${note}`.replace(/ +/g, " "));
  }

  const bodyTypeLine =
    bodyType && bodyType !== "prefer-not-to-say"
      ? `The person has a ${bodyType.replace(/-/g, " ")} body type — keep proportions natural and accurate to that build.`
      : `Keep the person's existing body proportions exactly as in the input photo.`;

  return `
Generate ONE hyperrealistic full-body fashion editorial photograph of the SAME PERSON from the input photo, now wearing the outfit shown in the reference product images.

═══ ABSOLUTE RULES (NON-NEGOTIABLE) ═══

1. IDENTITY — Keep the person's face, skin tone, hair color, hair style,
   eye color, and overall facial structure 100% identical to the input
   photo. Do not beautify, age, slim, or alter their face. Same person.

2. PRODUCT FIDELITY — Each reference product image is the GROUND TRUTH
   for that garment. Reproduce every product EXACTLY as shown:
   - Same exact color (do not shift hue, do not lighten/darken)
   - Same exact print, pattern, embroidery, or graphic
   - Same exact silhouette, cut, length, and proportion
   - Same exact fabric type and texture
   - Same exact neckline, sleeves, hemline, and details
   Do NOT invent, paraphrase, or stylize the garment. If the reference
   shows a pink knitted top with scalloped neckline, render a pink
   knitted top with scalloped neckline — not "something similar".

3. BODY — ${bodyTypeLine}

4. POSE & FRAMING — Person standing straight, facing the camera,
   natural relaxed pose, arms slightly away from the body, full body
   visible head to toe, 3:4 portrait aspect ratio.

═══ OUTFIT BREAKDOWN (each item has a reference image below) ═══
${slots.join("\n")}

═══ VISUAL STYLE ═══
- Clean editorial fashion photography
- Neutral light-cream studio background (#F1EBDD), seamless
- Soft, even, natural lighting; no harsh shadows
- High resolution, photo-real, magazine-quality
- The outfit must be the visual hero — proportionally accurate

═══ STRICTLY FORBIDDEN ═══
- NO text, watermarks, logos (other than what's on the reference products), captions, or labels
- NO additional people, hands, props, or background objects
- NO altering the person's identity
- NO generic/stock clothing — only what the reference images show
- NO multiple poses or collage; output ONE single image only
`.trim();
}

/* ── Fetch a remote product image and convert to inline base64 ── */
async function fetchInline(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return null;
    // Cap upload size per image at ~3 MB to stay well under Gemini limits
    if (buf.length > 3 * 1024 * 1024) return null;
    return { mimeType: mimeType.split(";")[0], data: buf.toString("base64") };
  } catch {
    return null;
  }
}

/* ── POST /api/virtual-tryon ──────────────────────────────────── */
export async function POST(req: NextRequest) {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    console.error(
      "[/api/virtual-tryon] GEMINI_API_KEY missing.",
      `cwd=${process.cwd()}`,
      "Has process.env value?", !!process.env.GEMINI_API_KEY,
    );
    return NextResponse.json(
      {
        error:
          "Gemini API key not loaded. Restart your dev server (Ctrl+C, then npm run dev) so it re-reads .env.local.",
      },
      { status: 500 },
    );
  }

  let body: TryOnRequest;
  try {
    body = (await req.json()) as TryOnRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { userPhoto, userMime, bodyType, outfit } = body;

  // ── Validation ─────────────────────────────────────────────────
  if (!userPhoto || typeof userPhoto !== "string") {
    return NextResponse.json({ error: "Missing user photo." }, { status: 400 });
  }
  const mime = (userMime || "image/jpeg").toLowerCase();
  if (!ALLOWED_MIMES.has(mime)) {
    return NextResponse.json(
      { error: "Unsupported image format. Use JPG, PNG or WEBP." },
      { status: 400 },
    );
  }
  if (!outfit || Object.keys(outfit).length === 0) {
    return NextResponse.json(
      { error: "No outfit provided — finalize a look first." },
      { status: 400 },
    );
  }
  // Cap user photo at ~6 MB base64 (≈4.5 MB raw)
  if (userPhoto.length > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo too large. Max 5 MB." }, { status: 400 });
  }

  // ── Build prompt + parts ──────────────────────────────────────
  const prompt = buildPrompt(outfit, bodyType);

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [];

  parts.push({ text: prompt });

  // 1. User photo first — primary identity reference
  parts.push({ inlineData: { mimeType: mime, data: userPhoto } });

  // 2. Each product image as additional reference (best-effort)
  for (const [role, item] of Object.entries(outfit)) {
    if (!item?.img) continue;
    const inline = await fetchInline(item.img);
    if (inline) {
      parts.push({
        text: `Reference for ${SLOT_LABELS[role] ?? role.toUpperCase()}: ${item.name ?? ""}`,
      });
      parts.push({ inlineData: inline });
    }
  }

  // ── Call Gemini ───────────────────────────────────────────────
  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
          // Lower temperature → stay closer to reference products,
          // less creative drift on fabric, color, and silhouette.
          temperature: 0.35,
        },
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[/api/virtual-tryon] network error:", msg);
    return NextResponse.json(
      { error: "Network error reaching Gemini. Please try again." },
      { status: 502 },
    );
  }

  if (!geminiResponse.ok) {
    const text = await geminiResponse.text().catch(() => "");
    console.error("[/api/virtual-tryon] Gemini error", geminiResponse.status, text.slice(0, 300));
    // Map common upstream errors to friendly UI copy
    let userMessage = "We couldn't generate your try-on image right now. Please try again.";
    if (geminiResponse.status === 429) {
      userMessage = "Gemini hit a rate limit. Wait ~60 seconds and try again, or check your plan at ai.google.dev/gemini-api/docs/rate-limits.";
    } else if (geminiResponse.status === 403) {
      userMessage = "Gemini rejected the request (403). Check that your API key has access to gemini-2.5-flash-image and billing is enabled.";
    } else if (geminiResponse.status === 400) {
      userMessage = "Photo or outfit data was rejected by Gemini. Try a different photo.";
    }
    return NextResponse.json({ error: userMessage }, { status: 502 });
  }

  // ── Parse the image out of the response ──────────────────────
  type GeminiPart =
    | { text?: string }
    | { inlineData?: { mimeType?: string; data?: string } }
    | { inline_data?: { mime_type?: string; data?: string } };

  interface GeminiPayload {
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  }

  let data: GeminiPayload;
  try {
    data = (await geminiResponse.json()) as GeminiPayload;
  } catch {
    return NextResponse.json(
      { error: "Unexpected response from Gemini. Please try again." },
      { status: 502 },
    );
  }

  const partsOut = data?.candidates?.[0]?.content?.parts ?? [];
  let imageBase64: string | undefined;
  let imageMime = "image/png";
  for (const p of partsOut) {
    const inline = ("inlineData" in p ? p.inlineData : undefined)
                ?? ("inline_data" in p ? p.inline_data : undefined);
    if (inline?.data) {
      imageBase64 = inline.data;
      const mt = ("mimeType" in inline ? inline.mimeType : undefined)
              ?? ("mime_type" in inline ? inline.mime_type : undefined);
      imageMime = mt || imageMime;
      break;
    }
  }

  if (!imageBase64) {
    return NextResponse.json(
      { error: "Gemini didn't return an image this time. Try a different photo." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    image:    `data:${imageMime};base64,${imageBase64}`,
    mimeType: imageMime,
  });
}
