/**
 * Burnt Toast — Outfit Recommendation Engine
 *
 * Public API:
 *   buildOutfit(ctx)               — builds 1 outfit from context
 *   buildMultipleOutfits(ctx, n)   — builds n outfits with variation
 *   completeLook(anchorSku, ctx)   — given a clicked product, complete the rest
 *   browseCategory(cat, opts)      — for in-chat browsing
 *   findSimilar(sku, n)            — visually/style similar products
 *
 * Scoring formula (per candidate per slot):
 *   score = 0.30 * aestheticMatch
 *         + 0.20 * occasionMatch
 *         + 0.15 * coOccurrenceBoost   (from curated outfits + anchor)
 *         + 0.15 * colorHarmony        (with already-picked items)
 *         + 0.10 * formalityFit
 *         + 0.05 * genderFit
 *         + 0.03 * popularityBoost
 *         + 0.02 * jitter              (for diversity across calls)
 *         − budgetPenalty (heavy)
 */

import { catalogueProducts } from "@/data/catalogue";
import { products as coreProducts } from "@/data/products";
import { CURATED_OUTFITS, pairCoOccurrence } from "@/data/outfits";
import { enrichProduct } from "./enrichProduct";
import {
  AESTHETIC_LABEL,
  OCCASION_PROFILE,
  OUTFIT_TEMPLATES,
  RoleSlot,
  aestheticAffinity,
  colorAffinity,
  listAestheticAffinity,
} from "./styleTaxonomy";
import {
  Aesthetic,
  EnrichedProduct,
  GeneratedOutfit,
  OutfitContext,
  OutfitSlot,
} from "@/types/fashion";

/* ──────────────────────────────────────────────────────────────
   Enrich entire catalogue once on module load
   ────────────────────────────────────────────────────────────── */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const i of items) if (!map.has(i.id)) map.set(i.id, i);
  return Array.from(map.values());
}

const ALL_RAW = dedupeById([...catalogueProducts, ...coreProducts]);
export const CATALOGUE: EnrichedProduct[] = ALL_RAW.map(enrichProduct);
export const CATALOGUE_BY_ID: Record<string, EnrichedProduct> = Object.fromEntries(
  CATALOGUE.map(p => [p.id, p])
);

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────────── */
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function pickAestheticFromOccasion(occasion?: string): Aesthetic {
  if (!occasion) return "urban-streetwear";
  const profile = OCCASION_PROFILE[occasion.toLowerCase().trim()];
  return profile?.aesthetics[0] ?? "urban-streetwear";
}

function targetFormality(occasion?: string): number {
  if (!occasion) return 3;
  return OCCASION_PROFILE[occasion.toLowerCase().trim()]?.formality ?? 3;
}

function genderMatch(productGender: string | undefined, target?: string): number {
  if (!target || target === "all") return 1.0;
  if (!productGender || productGender === "unisex") return 1.0;
  return productGender === target ? 1.0 : 0.2;
}

/* ──────────────────────────────────────────────────────────────
   Per-candidate scoring
   ────────────────────────────────────────────────────────────── */
function scoreCandidate(
  candidate: EnrichedProduct,
  ctx: OutfitContext,
  vibe: Aesthetic,
  alreadyPicked: EnrichedProduct[],
  anchor: EnrichedProduct | null,
): number {
  // Hard reject if over budget (-Infinity so it's truly excluded by the picker)
  const tentativeTotal = alreadyPicked.reduce((s, p) => s + p.price, 0) + candidate.price;
  if (ctx.budget && tentativeTotal > ctx.budget * 1.05) return -Infinity;

  // 1. Aesthetic match — biggest signal
  const aestheticMatch = listAestheticAffinity(candidate.aesthetics, [vibe]);

  // 2. Occasion match
  let occasionMatch = 0.5;
  if (ctx.occasion && OCCASION_PROFILE[ctx.occasion]) {
    occasionMatch = listAestheticAffinity(candidate.aesthetics, OCCASION_PROFILE[ctx.occasion].aesthetics);
  }

  // 3. Co-occurrence with anchor + already picked items
  let coOccurrence = 0;
  if (anchor) coOccurrence += pairCoOccurrence(anchor.id, candidate.id) * 0.5;
  for (const p of alreadyPicked) coOccurrence += pairCoOccurrence(p.id, candidate.id) * 0.3;
  coOccurrence = clamp01(coOccurrence);

  // 4. Color harmony with already picked + small diversity bonus
  // We want compatible colors but also some variation — pure monochrome outfits
  // (e.g. 6 earth-tone items) feel boring. Reward at least 2 distinct color families.
  let colorHarmony = 0.7;
  if (alreadyPicked.length > 0) {
    const avg =
      alreadyPicked.reduce((s, p) => s + colorAffinity(candidate.color_family, p.color_family), 0) /
      alreadyPicked.length;
    colorHarmony = avg;
    // Penalty: if every already-picked item has the same color_family AND this one too,
    // shave 0.15 off the harmony score (so we lean toward at least one accent piece)
    const pickedFamilies = new Set(alreadyPicked.map(p => p.color_family));
    if (pickedFamilies.size === 1 && pickedFamilies.has(candidate.color_family)) {
      colorHarmony = Math.max(0, colorHarmony - 0.15);
    }
  }

  // 5. Formality fit
  const target = targetFormality(ctx.occasion);
  const formalityFit = 1 - Math.min(1, Math.abs(candidate.formality - target) / 4);

  // 6. Gender fit
  const genderFit = genderMatch(candidate.gender, ctx.gender);

  // 7. Popularity (rating proxy)
  const popularityBoost = clamp01((candidate.rating ?? 4) / 5);

  // 8. Jitter for diversity across re-calls
  const jitter = Math.random();

  return (
    0.30 * aestheticMatch +
    0.20 * occasionMatch +
    0.15 * coOccurrence +
    0.15 * colorHarmony +
    0.10 * formalityFit +
    0.05 * genderFit +
    0.03 * popularityBoost +
    0.02 * jitter
  );
}

/* ──────────────────────────────────────────────────────────────
   Why-this-was-picked reason text
   ────────────────────────────────────────────────────────────── */
function reasonFor(candidate: EnrichedProduct, vibe: Aesthetic): string {
  const matchesVibe = candidate.aesthetics.includes(vibe);
  if (matchesVibe) return `Pure ${AESTHETIC_LABEL[vibe].toLowerCase()} energy — hits the vibe perfectly`;
  if (candidate.aesthetics.includes("minimal-clean")) return `Clean base that lets the rest of the fit pop`;
  if (candidate.aesthetics.includes("urban-streetwear")) return `Streetwear anchor — keeps it cool, never tries too hard`;
  if (candidate.aesthetics.includes("feminine-romantic")) return `Soft romantic touch that elevates the whole look`;
  return `Pairs effortlessly with everything else in this fit`;
}

/* ──────────────────────────────────────────────────────────────
   Pick best candidate for one slot
   ────────────────────────────────────────────────────────────── */
// Products whose name suggests they're inappropriate for outfit slots
// (sucker outfits — socks, keychains, packs etc. should never appear)
const OUTFIT_BLOCKLIST = /\b(sock|keychain|charm pack|pack of \d)\b/i;

function pickForSlot(
  slot: RoleSlot,
  ctx: OutfitContext,
  vibe: Aesthetic,
  alreadyPicked: EnrichedProduct[],
  anchor: EnrichedProduct | null,
  usedIds: Set<string>,
): EnrichedProduct | null {
  // First pass: strict gender match (prefer products that match the target gender)
  const strict = CATALOGUE.filter(p => {
    if (!slot.types.includes(p.product_type)) return false;
    if (usedIds.has(p.id)) return false;
    if (OUTFIT_BLOCKLIST.test(p.name)) return false;
    if (ctx.gender && ctx.gender !== "unisex" && p.gender && p.gender !== "unisex" && p.gender !== ctx.gender) return false;
    return true;
  });

  // Fallback: relax gender constraint so under-stocked genders still return an outfit
  // (gender mismatch still gets penalised by the score, just not hard-excluded)
  const relaxed = strict.length > 0 ? strict : CATALOGUE.filter(p => {
    if (!slot.types.includes(p.product_type)) return false;
    if (usedIds.has(p.id)) return false;
    if (OUTFIT_BLOCKLIST.test(p.name)) return false;
    return true;
  });

  if (relaxed.length === 0) return null;

  let bestScore = -Infinity;
  let best: EnrichedProduct | null = null;
  for (const c of relaxed) {
    const s = scoreCandidate(c, ctx, vibe, alreadyPicked, anchor);
    // skip budget violations and any other -Infinity hard rejects
    if (s === -Infinity) continue;
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return best;
}

/* ──────────────────────────────────────────────────────────────
   Decide whether to use the "dress" template or "two-piece"
   ────────────────────────────────────────────────────────────── */
function pickTemplate(ctx: OutfitContext, anchor: EnrichedProduct | null): RoleSlot[] {
  if (anchor?.product_type === "DRESS") return OUTFIT_TEMPLATES["dress"];
  // NEVER use dress template for male users — catalogue has no male dresses
  // and relaxed-gender would pull a female dress into a male outfit.
  if (ctx.gender === "male") return OUTFIT_TEMPLATES["two-piece"];
  // For women only: 45% chance to use dress template for dress-friendly occasions
  const dressOccasions = ["date-night", "wedding", "party"];
  if (
    anchor === null &&
    ctx.occasion && dressOccasions.includes(ctx.occasion) &&
    Math.random() < 0.45
  ) {
    return OUTFIT_TEMPLATES["dress"];
  }
  return OUTFIT_TEMPLATES["two-piece"];
}

/* ──────────────────────────────────────────────────────────────
   PUBLIC: build a single outfit
   ────────────────────────────────────────────────────────────── */
export function buildOutfit(ctx: OutfitContext): GeneratedOutfit | null {
  const anchor = ctx.anchor_sku ? (CATALOGUE_BY_ID[ctx.anchor_sku] ?? null) : null;

  // Vibe — from explicit ctx, then anchor's aesthetic, then occasion
  let vibe: Aesthetic;
  if (ctx.vibe && typeof ctx.vibe === "string" && (ctx.vibe as Aesthetic) in AESTHETIC_LABEL) {
    vibe = ctx.vibe as Aesthetic;
  } else if (anchor) {
    vibe = anchor.aesthetics[0];
  } else {
    vibe = pickAestheticFromOccasion(ctx.occasion);
  }

  // Auto-detect gender from anchor if not given
  const resolvedGender = ctx.gender ?? anchor?.gender ?? "female";
  const ctxResolved: OutfitContext = { ...ctx, gender: resolvedGender, vibe };

  const template = pickTemplate(ctxResolved, anchor);
  const picked: EnrichedProduct[] = [];
  const slots: OutfitSlot[] = [];
  const usedIds = new Set<string>();

  for (const slot of template) {
    let pick: EnrichedProduct | null;

    // Anchor occupies its matching role
    if (anchor && slot.types.includes(anchor.product_type) && !usedIds.has(anchor.id)) {
      pick = anchor;
    } else {
      pick = pickForSlot(slot, ctxResolved, vibe, picked, anchor, usedIds);
    }

    if (!pick) {
      if (slot.required) return null;
      continue;
    }

    usedIds.add(pick.id);
    picked.push(pick);
    slots.push({
      role: slot.role,
      product: pick,
      reason: reasonFor(pick, vibe),
    });
  }

  const total = picked.reduce((s, p) => s + p.price, 0);
  const label = labelFor(vibe, ctxResolved.occasion);

  return {
    id: `OUT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    label,
    aesthetic: vibe,
    occasion: ctxResolved.occasion ?? "everyday",
    vibe_label: AESTHETIC_LABEL[vibe],
    slots,
    total_price: total,
    budget_note: budgetNote(total, ctxResolved.budget),
  };
}

function labelFor(vibe: Aesthetic, occasion?: string): string {
  const occ = occasion ? occasion.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Everyday";
  return `${occ} · ${AESTHETIC_LABEL[vibe]}`;
}

function budgetNote(total: number, budget?: number): string {
  const totalStr = `₹${total.toLocaleString("en-IN")}`;
  if (!budget) return `Full head-to-toe look for ${totalStr} — slaps fr fr`;
  if (total <= budget) return `${totalStr} total, under your ₹${budget} budget — bussin on a budget`;
  return `${totalStr} — slight stretch on the budget but worth every rupee`;
}

/* ──────────────────────────────────────────────────────────────
   PUBLIC: build multiple varied outfits
   ────────────────────────────────────────────────────────────── */
export function buildMultipleOutfits(ctx: OutfitContext, count = 3): GeneratedOutfit[] {
  // Diversify the vibe across the N outfits
  const baseVibe: Aesthetic =
    (ctx.vibe && (ctx.vibe as Aesthetic) in AESTHETIC_LABEL)
      ? (ctx.vibe as Aesthetic)
      : pickAestheticFromOccasion(ctx.occasion);

  const occProfile = ctx.occasion ? OCCASION_PROFILE[ctx.occasion] : null;
  const fallbackVibes: Aesthetic[] = [baseVibe, "urban-streetwear", "smart-casual"];
  const candidateVibes: Aesthetic[] =
    (occProfile?.aesthetics.slice(0, count) as Aesthetic[] | undefined) ?? fallbackVibes.slice(0, count);

  // Ensure unique
  const vibes = Array.from(new Set([baseVibe, ...candidateVibes])).slice(0, count);

  const results: GeneratedOutfit[] = [];
  for (const v of vibes) {
    const out = buildOutfit({ ...ctx, vibe: v });
    if (out) results.push(out);
  }
  return results;
}

/* ──────────────────────────────────────────────────────────────
   PUBLIC: complete the look given an anchor product
   ────────────────────────────────────────────────────────────── */
export function completeLook(anchorSku: string, ctx: OutfitContext = {}): GeneratedOutfit | null {
  return buildOutfit({ ...ctx, anchor_sku: anchorSku });
}

/* ──────────────────────────────────────────────────────────────
   PUBLIC: in-chat browse
   ────────────────────────────────────────────────────────────── */
export function browseCategory(
  category: string,
  opts: { gender?: string; limit?: number } = {},
): EnrichedProduct[] {
  const cat = category.toLowerCase();
  const wantedTypes: Record<string, string[]> = {
    "tops":        ["TOP"],
    "bottoms":     ["BOTTOM"],
    "dresses":     ["DRESS"],
    "footwear":    ["FOOTWEAR"],
    "accessories": ["BAG", "JEWELRY", "EYEWEAR", "WATCH", "HAT"],
    "all":         ["TOP", "BOTTOM", "DRESS", "FOOTWEAR", "BAG", "JEWELRY", "EYEWEAR"],
  };
  const types = wantedTypes[cat] ?? wantedTypes["all"];

  let list = CATALOGUE.filter(p => types.includes(p.product_type));
  if (opts.gender && opts.gender !== "all") {
    list = list.filter(p => !p.gender || p.gender === "unisex" || p.gender === opts.gender);
  }
  // Sort by rating then newness for top-of-list quality
  list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return list.slice(0, opts.limit ?? 12);
}

/* ──────────────────────────────────────────────────────────────
   PUBLIC: find similar to a product
   ────────────────────────────────────────────────────────────── */
export function findSimilar(sku: string, limit = 6): EnrichedProduct[] {
  const anchor = CATALOGUE_BY_ID[sku];
  if (!anchor) return [];
  return CATALOGUE
    .filter(p => p.id !== sku && p.product_type === anchor.product_type)
    .map(p => ({
      product: p,
      score:
        listAestheticAffinity(p.aesthetics, anchor.aesthetics) * 0.6 +
        colorAffinity(p.color_family, anchor.color_family) * 0.3 +
        (1 - Math.min(1, Math.abs(p.formality - anchor.formality) / 4)) * 0.1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.product);
}

/* ──────────────────────────────────────────────────────────────
   Curated outfit lookups (highest-quality fallback)
   ────────────────────────────────────────────────────────────── */
export function curatedForOccasion(occasion: string): GeneratedOutfit[] {
  const matches = CURATED_OUTFITS.filter(o => o.occasion === occasion);
  return matches.map(co => {
    const slots: OutfitSlot[] = [];
    for (const sku of co.skus) {
      const p = CATALOGUE_BY_ID[sku];
      if (!p) continue;
      slots.push({
        role: roleFromType(p.product_type),
        product: p,
        reason: `Curated for ${co.aesthetic.replace(/-/g, " ")}`,
      });
    }
    const total = slots.reduce((s, x) => s + x.product.price, 0);
    return {
      id: co.id,
      label: co.label,
      aesthetic: co.aesthetic,
      occasion: co.occasion,
      vibe_label: AESTHETIC_LABEL[co.aesthetic],
      slots,
      total_price: total,
      budget_note: budgetNote(total),
    };
  });
}

function roleFromType(t: string): string {
  switch (t) {
    case "TOP":      return "top";
    case "BOTTOM":   return "bottom";
    case "DRESS":    return "dress";
    case "FOOTWEAR": return "footwear";
    case "BAG":      return "bag";
    case "JEWELRY":  return "necklace";
    case "EYEWEAR":  return "sunglasses";
    case "HAT":      return "hat";
    case "WATCH":    return "watch";
    default:         return t.toLowerCase();
  }
}
