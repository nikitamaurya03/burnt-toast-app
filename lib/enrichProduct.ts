/**
 * Takes a raw FashionProduct from data/catalogue.ts and infers
 * product_type, aesthetics[], color_family, formality, boldness
 * from its existing tags / category / name / colors.
 *
 * This is the bridge between hand-written catalogue data and the
 * style engine — no manual re-tagging of 50+ products needed.
 */

import { FashionProduct } from "@/types";
import { Aesthetic, ColorFamily, EnrichedProduct, ProductType } from "@/types/fashion";
import { productUrl } from "./productUrl";

/* ──────────────────────────────────────────────────────────────
   1. product_type from category + name + tags
   ────────────────────────────────────────────────────────────── */
function inferProductType(p: FashionProduct): ProductType {
  const cat = p.category.toLowerCase();
  const name = p.name.toLowerCase();
  const tags = (p.tags ?? []).map(t => t.toLowerCase()).join(" ");
  const all = `${cat} ${name} ${tags}`;

  if (cat === "dresses" || all.includes("dress")) return "DRESS";
  if (cat === "footwear" || /sneaker|sandal|loafer|trainer|shoe|heel|boot/.test(all)) return "FOOTWEAR";
  if (cat === "accessories") {
    if (/sunglass|eyewear|shades/.test(all)) return "EYEWEAR";
    if (/necklace|pendant|chain|earring|ring|bracelet|jewel/.test(all)) return "JEWELRY";
    if (/watch/.test(all)) return "WATCH";
    if (/hat|cap|beanie/.test(all)) return "HAT";
    return "BAG";
  }
  if (cat === "bottoms" || cat === "denims" || cat === "skirts" ||
      /pant|jean|skirt|short|trouser/.test(name)) return "BOTTOM";
  if (cat === "t-shirts" || cat === "tops" ||
      /tee|shirt|top|blouse|cardigan|sweater|sweatshirt|crop|jacket|coat/.test(name)) return "TOP";
  return "TOP"; // safe default
}

/* ──────────────────────────────────────────────────────────────
   2. aesthetics[] from tags (multi-label, max 3)
   ────────────────────────────────────────────────────────────── */
const TAG_TO_AESTHETIC: Array<[RegExp, Aesthetic, number]> = [
  // [matcher, aesthetic, confidence weight]
  [/y2k|retro|sequin|metallic/i,                          "y2k-revival",       1.0],
  [/bold|statement|playful/i,                             "y2k-revival",       0.7],
  [/streetwear|oversized|baggy|graphic\s*tee|graphictee/i, "urban-streetwear",  1.0],
  [/relaxed|loose|wide-leg|widelegjean|woven|cherry/i,    "urban-streetwear",  0.6],
  [/smartcasual|smart\s*casual|chic|elegant|classic|tailored/i, "smart-casual", 1.0],
  [/minimal|clean|solid\b|fitted|v-neck|round-neck/i,     "minimal-clean",     0.8],
  [/boho|crochet|tassel|fringe|woven|earthy/i,            "boho-coastal",      1.0],
  [/coast|beach|breezy|summer/i,                          "boho-coastal",      0.5],
  [/preppy|polo|pleated|check|plaid|collar|cardigan/i,    "preppy-collegiate", 1.0],
  [/sport|athleisure|athletic|trainer|mesh|technical/i,   "athleisure",        1.0],
  [/perforated|lace-up|sneaker/i,                         "athleisure",        0.5],
  [/feminine|ruffl|lace|schiffli|embroidered|tie-up|sweetheart|bow|charm/i, "feminine-romantic", 1.0],
  [/pink|pastel|blush|peach|romantic/i,                   "feminine-romantic", 0.5],
];

function inferAesthetics(p: FashionProduct): Aesthetic[] {
  const text = [
    p.name, p.category, p.fabric ?? "", p.fit ?? "",
    ...(p.tags ?? []),
    ...(p.color ?? []),
    p.description,
  ].join(" ").toLowerCase();

  const scores: Partial<Record<Aesthetic, number>> = {};
  for (const [matcher, aesthetic, weight] of TAG_TO_AESTHETIC) {
    if (matcher.test(text)) {
      scores[aesthetic] = (scores[aesthetic] ?? 0) + weight;
    }
  }

  // sort by score desc, take top 3
  const ranked = Object.entries(scores).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
  const top = ranked.slice(0, 3).map(([k]) => k as Aesthetic);

  // safe default if nothing matched
  if (top.length === 0) return ["urban-streetwear", "minimal-clean"];
  return top;
}

/* ──────────────────────────────────────────────────────────────
   3. color_family from colors[] + tags
   ────────────────────────────────────────────────────────────── */
const COLOR_FAMILY_MAP: Array<[RegExp, ColorFamily]> = [
  [/white|black|grey|gray|cream|stone|ivory|silver/i, "neutral"],
  [/brown|khaki|sage|olive|chocolate|tan|camel|beige/i, "earth"],
  [/pink|blush|peach|coral|salmon|wine\s*pink|winepink/i, "warm-pastel"],
  [/mint|sky|lilac|lavender|periwinkle/i, "cool-pastel"],
  [/red|yellow|orange|electric|neon|fuschia|magenta/i, "bold"],
  [/navy|indigo|emerald|sapphire|burgundy|maroon|jewel/i, "jewel-tone"],
  [/multi|print|graphic|floral|striped|check|pattern/i, "multi"],
];

function inferColorFamily(p: FashionProduct): ColorFamily {
  const text = [
    ...(p.color ?? []),
    ...(p.tags ?? []),
    p.name,
  ].join(" ").toLowerCase();

  // mono check first
  if (/black/.test(text) && /white/.test(text)) return "monochrome";
  for (const [matcher, family] of COLOR_FAMILY_MAP) {
    if (matcher.test(text)) return family;
  }
  return "neutral";
}

/* ──────────────────────────────────────────────────────────────
   4. formality 1-5 from tags / category
   ────────────────────────────────────────────────────────────── */
function inferFormality(p: FashionProduct, type: ProductType, aesthetics: Aesthetic[]): 1 | 2 | 3 | 4 | 5 {
  const text = [p.name, p.fit ?? "", ...(p.tags ?? []), ...(p.occasion ? [p.occasion] : [])].join(" ").toLowerCase();
  if (/active|gym|sport|train/.test(text)) return 1;
  if (aesthetics.includes("athleisure")) return 2;
  if (/baggy|oversized|graphic|baby\s*tee|babytee|sweatshirt|tee\b/.test(text)) return 2;
  if (aesthetics.includes("smart-casual") || /chic|elegant|tailored|blouse/.test(text)) return 4;
  if (aesthetics.includes("y2k-revival") && /party|sequin/.test(text)) return 4;
  if (type === "DRESS") return 3;
  if (type === "JEWELRY" || type === "EYEWEAR") return 3;
  return 3;
}

/* ──────────────────────────────────────────────────────────────
   5. boldness 1-5
   ────────────────────────────────────────────────────────────── */
function inferBoldness(p: FashionProduct, colorFamily: ColorFamily, aesthetics: Aesthetic[]): 1 | 2 | 3 | 4 | 5 {
  const text = [p.name, ...(p.tags ?? [])].join(" ").toLowerCase();
  if (/sequin|metallic|statement/.test(text)) return 5;
  if (/embroidered|embellished|graphic|cherry|print|sweetheart/.test(text)) return 4;
  if (colorFamily === "bold" || colorFamily === "multi") return 4;
  if (aesthetics.includes("y2k-revival")) return 4;
  if (colorFamily === "neutral" || colorFamily === "monochrome") return 2;
  if (colorFamily === "earth") return 2;
  return 3;
}

/* ──────────────────────────────────────────────────────────────
   Main enrich function — pure, deterministic
   ────────────────────────────────────────────────────────────── */
export function enrichProduct(p: FashionProduct): EnrichedProduct {
  const product_type = inferProductType(p);
  const aesthetics   = inferAesthetics(p);
  const color_family = inferColorFamily(p);
  const formality    = inferFormality(p, product_type, aesthetics);
  const boldness     = inferBoldness(p, color_family, aesthetics);
  return {
    ...p,
    product_type,
    aesthetics,
    color_family,
    formality,
    boldness,
    url: productUrl(p),
  };
}
