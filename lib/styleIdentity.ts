/**
 * Toastie — Style Identity Generator
 * Maps user onboarding selections to a personalized style identity.
 * Pure functions, no API calls, no side effects.
 */

export interface StyleInput {
  preferredStyles: string[];
  favoriteColors: string[];
  skinTone: string;
  bodyShape: string;
  stylingNeeds: string[];
}

export interface StyleOutput {
  styleIdentity: string;
  colorPersonality: string;
  stylingDirection: string;
  tags: string[];
}

/* ── Style Identity Mapping ──────────────────────────────────── */
const IDENTITY_MAP: [string[], string][] = [
  [["minimal", "old-money"],   "Quiet Luxury Minimalist"],
  [["minimal", "korean"],      "K-Minimal Purist"],
  [["minimal"],                "Modern Minimalist"],
  [["old-money", "trendy"],    "New-Money Classic"],
  [["old-money"],              "Quiet Luxury"],
  [["streetwear", "korean"],   "K-Street Hybrid"],
  [["streetwear", "trendy"],   "Bold Street"],
  [["streetwear"],             "Urban Edge"],
  [["korean", "trendy"],       "K-Trend Forward"],
  [["korean", "casual"],       "Soft Korean Casual"],
  [["korean"],                 "K-Fashion Forward"],
  [["trendy", "casual"],       "Effortless Trendsetter"],
  [["trendy"],                 "Bold Trendsetter"],
  [["casual", "minimal"],      "Clean Casual"],
  [["casual"],                 "Relaxed Classic"],
];

function resolveIdentity(styles: string[]): string {
  const s = new Set(styles);
  for (const [keys, label] of IDENTITY_MAP) {
    if (keys.every((k) => s.has(k))) return label;
  }
  return styles.length > 0
    ? styles[0].charAt(0).toUpperCase() + styles[0].slice(1) + " Stylist"
    : "Modern Stylist";
}

/* ── Color Personality Mapping ───────────────────────────────── */
function resolveColorPersonality(colors: string[]): string {
  const c = new Set(colors);
  if (c.has("black") && c.has("white") && c.size <= 2) return "Monochrome Core";
  if (c.has("pop-colors") && c.size === 1) return "Vibrant Spectrum";
  if (c.has("pop-colors")) return "Colour-Forward Mix";
  if (c.has("earthy") && c.has("beige")) return "Warm Earth";
  if (c.has("earthy")) return "Earthy Palette";
  if (c.has("beige") && c.has("white")) return "Soft Neutral";
  if (c.has("beige")) return "Neutral Earth";
  if (c.has("black") && c.size === 1) return "Dark Palette";
  if (c.has("white") && c.size === 1) return "Clean Canvas";
  if (c.has("black")) return "Dark Neutral";
  return "Versatile Mix";
}

/* ── Styling Direction Mapping ───────────────────────────────── */
function resolveStylingDirection(
  styles: string[],
  needs: string[],
): string {
  const s = new Set(styles);
  const n = new Set(needs);

  if (n.has("vacation") && s.has("minimal"))      return "Effortless Resort Casual";
  if (n.has("vacation") && s.has("trendy"))        return "Statement Vacation Wear";
  if (n.has("vacation"))                           return "Relaxed Getaway Style";
  if (n.has("party") && s.has("streetwear"))       return "Night-Out Statement";
  if (n.has("party") && s.has("old-money"))        return "Evening Elegance";
  if (n.has("party"))                              return "After-Dark Glam";
  if (n.has("everyday") && s.has("minimal"))       return "Clean Daily Rotation";
  if (n.has("everyday"))                           return "Comfortable & Curated";
  if (n.has("casual") && s.has("streetwear"))      return "Off-Duty Street";
  if (n.has("casual"))                             return "Easy Weekend Wear";
  if (n.has("travel"))                             return "Versatile Travel Capsule";
  if (s.has("old-money"))                          return "Polished Every Day";
  if (s.has("korean"))                             return "Seoul-Inspired Daily";
  return "Everyday Elevated";
}

/* ── Tag Generator ───────────────────────────────────────────── */
function generateTags(input: StyleInput): string[] {
  const tags: string[] = [];

  input.preferredStyles.forEach((s) => tags.push(s));
  input.favoriteColors.forEach((c) => tags.push(c));

  if (input.skinTone) tags.push(`${input.skinTone}_tone`);
  if (input.bodyShape && input.bodyShape !== "not-sure") {
    tags.push(`${input.bodyShape}_body`);
  }
  input.stylingNeeds.forEach((n) => tags.push(`${n}_style`));

  return [...new Set(tags)];
}

/* ── Main Export ─────────────────────────────────────────────── */
export function generateStyleIdentity(input: StyleInput): StyleOutput {
  return {
    styleIdentity:    resolveIdentity(input.preferredStyles),
    colorPersonality: resolveColorPersonality(input.favoriteColors),
    stylingDirection: resolveStylingDirection(input.preferredStyles, input.stylingNeeds),
    tags:             generateTags(input),
  };
}
