"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { products as allProducts } from "@/data/products";
import { catalogueProducts } from "@/data/catalogue";
import { Product } from "@/types";

/* ── Palette ─────────────────────────────────────────────────────── */
const BG     = "#FFFFFF";
const CARD   = "#F7F7F7";
const BORDER = "#E8E8E8";
const TEXT   = "#111111";
const MUTED  = "#888888";
const ACCENT = "#111111";

/* ── Section colour bands ────────────────────────────────────────── */
const SECTION_META: Record<string, { label: string; color: string }> = {
  top:        { label: "TOP",        color: "#2563EB" },
  bottom:     { label: "BOTTOM",     color: "#0891B2" },
  dress:      { label: "DRESS",      color: "#DB2777" },
  footwear:   { label: "FOOTWEAR",   color: "#7C3AED" },
  bag:        { label: "BAG",        color: "#B45309" },
  sunglasses: { label: "SUNGLASSES", color: "#059669" },
  necklace:   { label: "NECKLACE",   color: "#E11D48" },
  hat:        { label: "HAT",        color: "#0E7490" },
  watch:      { label: "WATCH",      color: "#475569" },
};

/* ── Aesthetic identities ────────────────────────────────────────── */
const AESTHETICS = [
  {
    title:    "Y2K Revival",
    icon:     "✨",
    color:    "#5B21B6",
    tagBg:    "#EDE9FE",
    tagColor: "#5B21B6",
    tags:     ["Bold", "Y2K", "Retro", "Statement"],
    occasions: [
      { icon: "🎓", label: "College fest / Freshers night" },
      { icon: "👗", label: "Farewell / Prom" },
      { icon: "🏠", label: "House party" },
      { icon: "🎵", label: "Clubbing / Music gig / Concert" },
      { icon: "🎂", label: "Birthday outfit" },
    ],
    prompt: "Show me Y2K revival style — bold and statement-making, full retro energy no cap",
  },
  {
    title:    "Urban Streetwear",
    icon:     "🔥",
    color:    "#92400E",
    tagBg:    "#FEF3C7",
    tagColor: "#92400E",
    tags:     ["Oversized", "Streetwear", "Preppy", "Athleisure"],
    occasions: [
      { icon: "✈️", label: "Airport look / Travel day trip" },
      { icon: "☕", label: "Casual hangout (café, brunch, mall, friends' place)" },
      { icon: "🏏", label: "Watching sports / IPL screening" },
      { icon: "🎒", label: "Daily campus life" },
    ],
    prompt: "Show me urban streetwear style — oversized and street-coded, preppy athleisure energy hits different",
  },
  {
    title:    "Smart Casual",
    icon:     "💫",
    color:    "#065F46",
    tagBg:    "#D1FAE5",
    tagColor: "#065F46",
    tags:     ["Classic", "Minimal", "Elegant", "Chic"],
    occasions: [
      { icon: "🌙", label: "Date night" },
      { icon: "💼", label: "Internship / Family office dinner" },
      { icon: "🤝", label: "Networking" },
    ],
    prompt: "Show me smart casual style — classic and minimal, elegant and chic, clean effortless look fr",
  },
];

/* ── Color hex map — used by ColorChip + product card swatches ─── */
const COLOR_HEX: Record<string, string> = {
  white:      "#FFFFFF",
  black:      "#1A1A1A",
  grey:       "#9CA3AF", gray: "#9CA3AF",
  brown:      "#8B5E3C",
  darkchocolate: "#3E2723",
  beige:      "#D4B996",
  cream:      "#F5F0E1",
  stone:      "#A8A29E",
  khaki:      "#A89968",
  tan:        "#C19A6B",
  camel:      "#C19A6B",
  pink:       "#EC4899",
  winepink:   "#B83280",
  peach:      "#FFB199",
  coral:      "#FF7F50",
  red:        "#DC2626",
  rust:       "#B7410E",
  wine:       "#722F37",
  burgundy:   "#800020",
  maroon:     "#800000",
  blue:       "#3B82F6",
  navy:       "#1E3A8A",
  midindigo:  "#34568B",
  indigo:     "#4F46E5",
  sky:        "#7DD3FC",
  lilac:      "#C8A2C8",
  lavender:   "#B57EDC",
  green:      "#22C55E",
  sage:       "#9CAF88",
  olive:      "#7A8450",
  mint:       "#98FF98",
  yellow:     "#FACC15",
  gold:       "#D4AF37",
  silver:     "#C0C0C0",
  orange:     "#F97316",
  cherry:     "#DE3163",
  multi:      "conic-gradient(from 0deg, #EC4899, #F97316, #FACC15, #22C55E, #3B82F6, #EC4899)",
  print:      "linear-gradient(135deg, #F87171 25%, #FBBF24 25%, #FBBF24 50%, #34D399 50%, #34D399 75%, #60A5FA 75%)",
  stripe:     "repeating-linear-gradient(90deg, #1A1A1A 0 5px, #FFFFFF 5px 10px)",
  striped:    "repeating-linear-gradient(90deg, #1A1A1A 0 5px, #FFFFFF 5px 10px)",
  floral:     "linear-gradient(135deg, #F472B6, #FBCFE8, #FCA5A5)",
  checked:    "repeating-conic-gradient(#1A1A1A 0% 25%, #FFFFFF 0% 50%) 50% / 8px 8px",
};

function colorBg(name: string): string {
  return COLOR_HEX[name.toLowerCase().replace(/[^a-z]/g, "")] ?? "#9CA3AF";
}

function ColorChip({ colors, size = 9 }: { colors?: string[]; size?: number }) {
  if (!colors || colors.length === 0) return null;
  const primary = colors[0];
  const bg = colorBg(primary);
  const label = colors.slice(0, 2).join(" / ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: MUTED, lineHeight: 1, fontFamily: "'Courier New',monospace", letterSpacing: 0.5 }}>
      <span
        title={label}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: bg,
          border: primary.toLowerCase().includes("white") || primary.toLowerCase().includes("cream")
            ? "1px solid #d1d5db"
            : "1px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      />
      <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
    </div>
  );
}

/* ── Types ───────────────────────────────────────────────────────── */
interface OutfitItem {
  sku: string;
  name: string;
  price: number;
  note: string;
  emoji: string;
  url: string;
  img?: string | null;
  colors?: string[];
  color_family?: string;
}

interface OutfitPair {
  top?: OutfitItem;
  bottom?: OutfitItem;
  dress?: OutfitItem;
  footwear?: OutfitItem;
  bag?: OutfitItem;
  sunglasses?: OutfitItem;
  necklace?: OutfitItem;
  hat?: OutfitItem;
  watch?: OutfitItem;
}

interface ChatData {
  type: "chat";
  message: string;
  quick_replies?: string[];
}

interface StyleNotes {
  aesthetic_name: string;
  vibe_summary:   string;
  color_story:    string;
  fit_balance:    string;
  accessory_note: string;
  day_to_night?:  string;
}

interface OutfitData {
  type: "outfit";
  message: string;
  occasion: string;
  vibe: string;
  outfit: OutfitPair;
  total: number;
  budget_note: string;
  next_question?: string;
  style_notes?: StyleNotes;
}

interface LookEntry {
  look_number: number;
  label: string;
  occasion: string;
  vibe: string;
  outfit: OutfitPair;
  total: number;
  budget_note: string;
  style_notes?: StyleNotes;
}

interface MultiData {
  type: "multi";
  message: string;
  looks: LookEntry[];
  next_question?: string;
}

interface ProductsApiItem {
  sku: string;
  name: string;
  price: number;
  img: string;
  url: string;
  category?: string;
  sizes?: string[];
  rating?: number;
  isNew?: boolean;
  colors?: string[];
  color_family?: string;
}

interface ProductsData {
  type: "products";
  message: string;
  category: string;
  gender?: string;
  next_question?: string;
  products?: ProductsApiItem[];
}

interface ReplaceOptionsData {
  type: "replace_options";
  message: string;
  replace_slot: string;
  locked_outfit?: Record<string, { sku: string; name?: string; price?: number }>;
  options: ProductsApiItem[];
  next_question?: string;
}

type ParsedResponse = ChatData | OutfitData | MultiData | ProductsData | ReplaceOptionsData;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  parsed?: ParsedResponse | null;
}

/* ── Helper: filter catalogue by chat category string ─────────── */
function chatCategoryFilter(cat: string, gender: string) {
  return catalogueProducts.filter(p => {
    const pc = p.category.toLowerCase();
    const catMatch = (() => {
      switch (cat.toLowerCase()) {
        case "tops":        return pc === "t-shirts" || pc === "tops";
        case "bottoms":     return pc === "bottoms" || pc === "skirts" || pc === "denims";
        case "dresses":     return pc === "dresses";
        case "footwear":    return pc === "footwear";
        case "accessories": return pc === "accessories";
        default:            return true;
      }
    })();
    const genderMatch = gender === "all" || gender === "" || p.gender === gender || p.gender === "unisex";
    return catMatch && genderMatch;
  });
}

/* ── Helper: build a Product from OutfitItem + optional DB lookup ── */
function buildProduct(item: OutfitItem, section: string): Product {
  // Check catalogue first (50+ products), then old 6-product list, then fallback
  return (
    catalogueProducts.find(p => p.id === item.sku) ??
    allProducts.find(p => p.id === item.sku) ?? {
      id: item.sku,
      name: item.name,
      brand: "Burnt Toast",
      price: item.price,
      image: item.img ?? "",
      category: section === "top" ? "Tops" : section === "bottom" ? "Bottoms" : section === "footwear" ? "Footwear" : "Accessories",
      tags: [],
      rating: 0,
      reviews: 0,
      sizes: ["XS", "S", "M", "L", "XL"],
      description: item.note,
    }
  );
}

/* ── Compact card — renders ALL outfit sections in one unified grid ── */
function CompactCard({ section, item }: { section: string; item: OutfitItem }) {
  const meta = SECTION_META[section] ?? { label: section.toUpperCase(), color: ACCENT };
  const [imgError,    setImgError]    = useState(false);
  const [cartAdded,   setCartAdded]   = useState(false);
  const [showSizes,   setShowSizes]   = useState(false);
  const [pickedSize,  setPickedSize]  = useState<string | null>(null);
  const { addItem: addToCart, isInCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  if (!item?.name) return null;

  const product   = buildProduct(item, section);
  const inCart    = isInCart(item.sku);
  const wishlisted = isWishlisted(item.sku);

  // Items whose first size is NOT "one size" need user selection
  const needsSize = product.sizes?.[0] !== "one size";

  function addWithSize(size: string) {
    addToCart(product, size);
    setPickedSize(size);
    setCartAdded(true);
    setShowSizes(false);
    setTimeout(() => setCartAdded(false), 1800);
  }

  function handleCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (cartAdded || inCart) return;
    if (needsSize) {
      setShowSizes(prev => !prev);   // toggle size picker
    } else {
      addWithSize(product.sizes?.[0] ?? "one size");
    }
  }

  function handleWish(e: React.MouseEvent) {
    e.stopPropagation();
    toggleItem(product);
  }

  return (
    <div
      style={{
        background: BG,
        border: `1px solid ${showSizes ? meta.color : BORDER}`,
        borderRadius: 10, overflow: "hidden",
        display: "flex", flexDirection: "column",
        cursor: "pointer",
        boxShadow: showSizes ? `0 0 0 2px ${meta.color}22` : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
      }}
      onClick={() => !showSizes && item.url && window.open(item.url, "_blank", "noopener,noreferrer")}
      onMouseEnter={e => { if (!showSizes) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 5px 16px rgba(0,0,0,0.10)"; }}}
      onMouseLeave={e => { if (!showSizes) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; }}}
    >
      {/* Colour band */}
      <div style={{ height: 3, background: meta.color }} />

      {/* Square image */}
      <div style={{
        background: CARD, position: "relative",
        width: "100%", paddingBottom: "100%", overflow: "hidden",
      }}>
        {item.img && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.img} alt={item.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 28 }}>
            {item.emoji}
          </span>
        )}

        {/* Section label badge */}
        <div style={{
          position: "absolute", top: 5, left: 5,
          background: meta.color, color: "#fff",
          fontSize: 7, fontWeight: 900, padding: "2px 6px",
          borderRadius: 3, letterSpacing: 1.2,
          fontFamily: "'Courier New', monospace",
        }}>{meta.label}</div>

        {/* Wishlist button */}
        <button
          onClick={handleWish}
          aria-label="Toggle wishlist"
          style={{
            position: "absolute", top: 5, right: 5,
            width: 24, height: 24, borderRadius: "50%",
            background: "rgba(255,255,255,0.90)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          <Heart size={11} fill={wishlisted ? "#ef4444" : "none"} color={wishlisted ? "#ef4444" : "#888"} />
        </button>

        {/* Color swatch — bottom-left so it's always visible on the image */}
        {item.colors && item.colors.length > 0 && (
          <div
            title={item.colors.join(" / ")}
            style={{
              position: "absolute", bottom: 5, left: 5,
              display: "flex", alignItems: "center", gap: 3,
              background: "rgba(255,255,255,0.92)",
              padding: "2px 5px 2px 3px", borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: colorBg(item.colors[0]),
              border: /^(white|cream)$/i.test(item.colors[0]) ? "1px solid #d1d5db" : "1px solid rgba(0,0,0,0.1)",
            }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: "#111", letterSpacing: 0.3, textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>
              {item.colors[0]}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div style={{
          color: TEXT, fontWeight: 700, fontSize: 11, lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{item.name}</div>
        <ColorChip colors={item.colors} />
        <div style={{ color: meta.color, fontWeight: 900, fontSize: 13, fontFamily: "'Courier New',monospace" }}>₹{item.price}</div>

        {/* ADD / ADDED button */}
        <button
          onClick={handleCart}
          style={{
            marginTop: "auto",
            width: "100%", padding: "6px 8px", borderRadius: 6, border: "none",
            background: cartAdded || inCart ? ACCENT : showSizes ? meta.color : "#f3f4f6",
            color: cartAdded || inCart || showSizes ? "#fff" : TEXT,
            fontSize: 9, fontWeight: 700,
            fontFamily: "'Courier New',monospace", letterSpacing: 0.8,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          }}
        >
          {cartAdded
            ? <><Check size={9} /> ADDED!</>
            : inCart
              ? <><Check size={9} /> IN CART</>
              : showSizes
                ? <>✕ CANCEL</>
                : needsSize
                  ? <><ShoppingBag size={9} /> SELECT SIZE</>
                  : <><ShoppingBag size={9} /> ADD</>
          }
        </button>

        {/* ── Inline size picker ── */}
        {showSizes && !cartAdded && (
          <div
            onClick={e => e.stopPropagation()}
            style={{ marginTop: 2 }}
          >
            <div style={{
              color: MUTED, fontSize: 8, fontWeight: 700,
              letterSpacing: 1.2, fontFamily: "'Courier New',monospace",
              marginBottom: 5,
            }}>PICK SIZE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {product.sizes?.map(sz => (
                <button
                  key={sz}
                  onClick={e => { e.stopPropagation(); addWithSize(sz); }}
                  style={{
                    padding: "4px 8px", fontSize: 9, fontWeight: 700,
                    border: `1.5px solid ${pickedSize === sz ? meta.color : BORDER}`,
                    borderRadius: 5,
                    background: pickedSize === sz ? meta.color : BG,
                    color: pickedSize === sz ? "#fff" : TEXT,
                    cursor: "pointer",
                    fontFamily: "'Courier New',monospace",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (pickedSize !== sz) { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.color = meta.color; }}}
                  onMouseLeave={e => { if (pickedSize !== sz) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT; }}}
                >{sz}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Style Notes panel — the "WHY this works" stylist explanation ── */
function StyleNotesPanel({ notes }: { notes: StyleNotes }) {
  const lines: Array<{ icon: string; label: string; text: string }> = [
    { icon: "🎨", label: "COLOR STORY",   text: notes.color_story },
    { icon: "✂️",  label: "FIT BALANCE",   text: notes.fit_balance },
    { icon: "✨", label: "ACCESSORIES",   text: notes.accessory_note },
  ];
  if (notes.day_to_night) lines.push({ icon: "🌙", label: "DAY → NIGHT", text: notes.day_to_night });

  return (
    <div style={{
      background: "linear-gradient(135deg, #fff7ed 0%, #fef3f2 100%)",
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      {/* Aesthetic name banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        paddingBottom: 8, borderBottom: `1px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 16 }}>✦</span>
        <div style={{ flex: 1 }}>
          <div style={{
            color: TEXT, fontWeight: 900, fontSize: 13,
            fontFamily: "'Courier New',monospace", letterSpacing: 0.5,
          }}>
            {notes.aesthetic_name.toUpperCase()}
          </div>
          <div style={{ color: MUTED, fontSize: 11, lineHeight: 1.4, marginTop: 2, fontStyle: "italic" }}>
            {notes.vibe_summary}
          </div>
        </div>
      </div>

      {/* Reason lines */}
      {lines.map((line, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 13, marginTop: 1, flexShrink: 0 }}>{line.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              color: MUTED, fontSize: 8, fontWeight: 900, letterSpacing: 1.5,
              fontFamily: "'Courier New',monospace", marginBottom: 2,
            }}>
              {line.label}
            </div>
            <div style={{ color: TEXT, fontSize: 12, lineHeight: 1.55 }}>
              {line.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Single outfit block (reused in both outfit + multi) ─────────── */
function OutfitBlock({
  outfit, occasion, vibe, total, budget_note, label, style_notes,
}: {
  outfit: OutfitPair;
  occasion: string;
  vibe: string;
  total: number;
  budget_note: string;
  label?: string;
  style_notes?: StyleNotes;
}) {
  // All available items in display order — every slot is its own key
  // Order: dress first if present (replaces top+bottom), else top → bottom → rest
  const allKeys = (["dress", "top", "bottom", "footwear", "bag", "sunglasses", "necklace", "hat", "watch"] as const).filter(k => outfit?.[k]?.name);

  // Items that need size selection (not "one size")
  const sizableKeys = allKeys.filter(k => {
    const it = outfit[k];
    if (!it) return false;
    const prod = buildProduct(it, k as string);
    return prod.sizes?.[0] !== "one size";
  });

  const { addItem: addToCart } = useCart();
  const [shopAdded,     setShopAdded]     = useState(false);
  const [showLookSizer, setShowLookSizer] = useState(false);
  const [lookSizes,     setLookSizes]     = useState<Record<string, string>>({});

  // All sizable items have a size picked
  const allSizesPicked = sizableKeys.every(k => lookSizes[k]);

  function confirmAddLook() {
    allKeys.forEach(k => {
      const it = outfit[k];
      if (!it) return;
      const prod = buildProduct(it, k as string);
      const needsSize = prod.sizes?.[0] !== "one size";
      const size = needsSize ? (lookSizes[k] ?? prod.sizes?.[0] ?? "M") : (prod.sizes?.[0] ?? "one size");
      addToCart(prod, size);
    });
    setShopAdded(true);
    setShowLookSizer(false);
    setLookSizes({});
    setTimeout(() => setShopAdded(false), 2200);
  }

  function handleLookCartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (sizableKeys.length === 0) {
      // nothing needs sizing — add immediately
      confirmAddLook();
    } else {
      setShowLookSizer(prev => !prev);
    }
  }

  return (
    <div style={{
      background: BG, border: `1px solid ${BORDER}`,
      borderRadius: 14, overflow: "hidden",
    }}>
      {/* Label strip for multi-look */}
      {label && (
        <div style={{
          background: ACCENT, color: "#fff",
          padding: "7px 14px", fontSize: 10, fontWeight: 900,
          letterSpacing: 2, fontFamily: "'Courier New',monospace",
        }}>
          LOOK — {label.toUpperCase()}
        </div>
      )}

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Occasion + vibe badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {occasion && (
            <span style={{
              background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 900,
              padding: "2px 9px", borderRadius: 4, letterSpacing: 1.5,
              fontFamily: "'Courier New',monospace",
            }}>{occasion.toUpperCase()}</span>
          )}
          {vibe && (
            <span style={{
              border: `1px solid ${ACCENT}`, color: ACCENT, fontSize: 9, fontWeight: 900,
              padding: "2px 9px", borderRadius: 4, letterSpacing: 1.5,
              fontFamily: "'Courier New',monospace",
            }}>{vibe}</span>
          )}
        </div>

        {/* ONE ROW — fixed order: top → bottom → footwear → bag → sunglasses → necklace */}
        {allKeys.length > 0 ? (
          <div style={{ overflowX: "auto", paddingBottom: 4 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(${allKeys.length}, minmax(120px, 1fr))`,
              gap: 8,
              minWidth: allKeys.length * 128,
              alignItems: "start",
            }}>
              {allKeys.map(k => <CompactCard key={k} section={k} item={outfit[k]!} />)}
            </div>
          </div>
        ) : (
          <div style={{ color: MUTED, fontSize: 12, textAlign: "center", padding: "12px 0" }}>
            No products in this look.
          </div>
        )}

        {/* ── Style notes panel — why this works ── */}
        {style_notes && <StyleNotesPanel notes={style_notes} />}

        {/* ── Look-level size picker panel ── */}
        {showLookSizer && (
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: "14px 16px",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div style={{
              color: TEXT, fontWeight: 900, fontSize: 11,
              fontFamily: "'Courier New',monospace", letterSpacing: 1.5,
            }}>
              SELECT YOUR SIZES
            </div>

            {sizableKeys.map(k => {
              const it = outfit[k]!;
              const prod = buildProduct(it, k as string);
              const meta = SECTION_META[k] ?? { label: k.toUpperCase(), color: ACCENT };
              return (
                <div key={k}>
                  {/* Item header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <span style={{
                      background: meta.color, color: "#fff",
                      fontSize: 7, fontWeight: 900, padding: "2px 7px",
                      borderRadius: 3, letterSpacing: 1.2,
                      fontFamily: "'Courier New',monospace",
                    }}>{meta.label}</span>
                    <span style={{ color: TEXT, fontSize: 11, fontWeight: 600 }}>{it.name}</span>
                    {lookSizes[k] && (
                      <span style={{
                        marginLeft: "auto", background: meta.color, color: "#fff",
                        fontSize: 9, fontWeight: 900, padding: "2px 8px", borderRadius: 20,
                        fontFamily: "'Courier New',monospace",
                      }}>✓ {lookSizes[k]}</span>
                    )}
                  </div>
                  {/* Size pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {prod.sizes?.map(sz => (
                      <button
                        key={sz}
                        onClick={() => setLookSizes(prev => ({ ...prev, [k]: sz }))}
                        style={{
                          padding: "6px 12px", fontSize: 11, fontWeight: 700,
                          border: `1.5px solid ${lookSizes[k] === sz ? meta.color : BORDER}`,
                          borderRadius: 7,
                          background: lookSizes[k] === sz ? meta.color : BG,
                          color: lookSizes[k] === sz ? "#fff" : TEXT,
                          cursor: "pointer",
                          fontFamily: "'Courier New',monospace",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { if (lookSizes[k] !== sz) { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.color = meta.color; }}}
                        onMouseLeave={e => { if (lookSizes[k] !== sz) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT; }}}
                      >{sz}</button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Confirm button */}
            <button
              onClick={allSizesPicked ? confirmAddLook : undefined}
              disabled={!allSizesPicked}
              style={{
                width: "100%", padding: "10px", borderRadius: 8, border: "none",
                background: allSizesPicked ? "#16a34a" : CARD,
                color: allSizesPicked ? "#fff" : MUTED,
                fontSize: 11, fontWeight: 900,
                fontFamily: "'Courier New',monospace", letterSpacing: 1,
                cursor: allSizesPicked ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <ShoppingBag size={13} />
              {allSizesPicked ? "CONFIRM & ADD ALL TO CART" : `PICK ALL SIZES (${sizableKeys.filter(k => lookSizes[k]).length}/${sizableKeys.length} done)`}
            </button>
          </div>
        )}

        {/* Total + add-look-to-cart */}
        {allKeys.length > 0 && (
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: "10px 12px", display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            <div>
              <div style={{ color: MUTED, fontSize: 9, fontFamily: "'Courier New',monospace", letterSpacing: 1 }}>TOTAL</div>
              <div style={{ color: TEXT, fontSize: 22, fontWeight: 900, fontFamily: "'Courier New',monospace" }}>
                ₹{(total || 0).toLocaleString("en-IN")}
              </div>
              <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{budget_note}</div>
            </div>
            <button
              onClick={handleLookCartClick}
              style={{
                background: shopAdded ? "#16a34a" : showLookSizer ? ACCENT : ACCENT,
                color: "#fff", border: "none", borderRadius: 8,
                padding: "9px 16px", fontSize: 11, fontWeight: 900,
                cursor: "pointer", fontFamily: "'Courier New',monospace",
                letterSpacing: 1, whiteSpace: "nowrap",
                transition: "background 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {shopAdded
                ? <><Check size={13} /> ADDED TO CART!</>
                : showLookSizer
                  ? <>✕ CANCEL</>
                  : <><ShoppingBag size={13} /> SHOP THE LOOK</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Renderers ───────────────────────────────────────────────────── */

function ChatBubble({ data, onQuickReply }: { data: ChatData; onQuickReply: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: "4px 12px 12px 12px",
        padding: "12px 16px", color: TEXT, fontSize: 13, lineHeight: 1.75,
      }}>
        {data.message}
      </div>

      {/* Quick reply chips */}
      {data.quick_replies && data.quick_replies.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.quick_replies.map((qr, i) => (
            <button
              key={i}
              onClick={() => onQuickReply(qr)}
              style={{
                background: BG, border: `1px solid ${BORDER}`,
                borderRadius: 20, padding: "6px 12px",
                fontSize: 11, color: TEXT, cursor: "pointer",
                fontFamily: "'Segoe UI',sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.background = BG; e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BORDER; }}
            >{qr}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Shared follow-up chips shown after every outfit / multi ─────── */
const FOLLOWUP_CHIPS = [
  "Show me more looks",
  "Different vibe",
  "Show me dresses",
  "Show me footwear",
  "More streetwear",
];

function FollowUpChips({ onQuickReply }: { onQuickReply: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
      {FOLLOWUP_CHIPS.map((chip, i) => (
        <button
          key={i}
          onClick={() => onQuickReply(chip)}
          style={{
            background: BG, border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: "6px 12px",
            fontSize: 11, color: TEXT, cursor: "pointer",
            fontFamily: "'Segoe UI',sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
          onMouseLeave={e => { e.currentTarget.style.background = BG; e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BORDER; }}
        >{chip}</button>
      ))}
    </div>
  );
}

function OutfitRenderer({ data, onQuickReply }: { data: OutfitData; onQuickReply: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: "13px 15px",
        color: TEXT, fontSize: 13, lineHeight: 1.75,
      }}>{data.message}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
        <span style={{ color: MUTED, fontSize: 9, fontWeight: 900, letterSpacing: 3, fontFamily: "'Courier New',monospace" }}>
          TOASTIE&apos;S PICK FOR YOU
        </span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <OutfitBlock
        outfit={data.outfit}
        occasion={data.occasion}
        vibe={data.vibe}
        total={data.total}
        budget_note={data.budget_note}
        style_notes={data.style_notes}
      />

      {data.next_question && (
        <div style={{
          color: MUTED, fontSize: 12, fontStyle: "italic",
          padding: "8px 14px", borderLeft: `3px solid ${BORDER}`, lineHeight: 1.6,
        }}>{data.next_question}</div>
      )}

      <FollowUpChips onQuickReply={onQuickReply} />
    </div>
  );
}

function MultiRenderer({ data, onQuickReply }: { data: MultiData; onQuickReply: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: "13px 15px",
        color: TEXT, fontSize: 13, lineHeight: 1.75,
      }}>{data.message}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
        <span style={{ color: MUTED, fontSize: 9, fontWeight: 900, letterSpacing: 3, fontFamily: "'Courier New',monospace" }}>
          {data.looks?.length ?? 0} LOOKS BY TOASTIE
        </span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(data.looks ?? []).map(look => (
          <OutfitBlock
            key={look.look_number}
            outfit={look.outfit}
            occasion={look.occasion}
            vibe={look.vibe}
            total={look.total}
            budget_note={look.budget_note}
            label={look.label}
            style_notes={look.style_notes}
          />
        ))}
      </div>

      {data.next_question && (
        <div style={{
          color: MUTED, fontSize: 12, fontStyle: "italic",
          padding: "8px 14px", borderLeft: `3px solid ${BORDER}`, lineHeight: 1.6,
        }}>{data.next_question}</div>
      )}

      <FollowUpChips onQuickReply={onQuickReply} />
    </div>
  );
}

/* ── Mini catalogue card for in-chat product browsing ─────────── */
function MiniProductCard({ product }: { product: Product & { colors?: string[]; url?: string } }) {
  const { addItem, isInCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const sizeList = product.sizes ?? [];
  const needsSize = sizeList[0] !== "one size" && sizeList.length > 1;
  const inCart = isInCart(product.id);
  const wished = isWishlisted(product.id);
  const productColors = product.colors;

  function addWithSize(sz: string) {
    addItem(product, sz);
    setAdded(true);
    setShowSizes(false);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (added || inCart) return;
    if (needsSize) { setShowSizes(p => !p); } else { addWithSize(sizeList[0] ?? "one size"); }
  }

  return (
    <div
      style={{
        background: BG, border: `1px solid ${showSizes ? ACCENT : BORDER}`, borderRadius: 10,
        overflow: "hidden", display: "flex", flexDirection: "column",
        cursor: "pointer", minWidth: 130, maxWidth: 150,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onClick={() => {
        if (showSizes) return;
        const externalUrl = (product as Product & { url?: string }).url;
        const target = externalUrl || `/product/${product.id}`;
        window.open(target, "_blank", "noopener,noreferrer");
      }}
      onMouseEnter={e => { if (!showSizes) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 5px 16px rgba(0,0,0,0.10)"; } }}
      onMouseLeave={e => { if (!showSizes) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; } }}
    >
      {/* Image */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "120%", background: CARD, overflow: "hidden" }}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 24 }}>👚</span>
        )}
        {/* Wishlist */}
        <button onClick={e => { e.stopPropagation(); toggleItem(product); }}
          style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={10} fill={wished ? "#ef4444" : "none"} color={wished ? "#ef4444" : "#888"} />
        </button>
        {product.isNew && (
          <span style={{ position: "absolute", top: 5, left: 5, background: ACCENT, color: "#fff", fontSize: 7, fontWeight: 900, padding: "2px 5px", borderRadius: 3, fontFamily: "'Courier New',monospace", letterSpacing: 1 }}>NEW</span>
        )}
        {/* Color swatch — bottom-left over image */}
        {productColors && productColors.length > 0 && (
          <div
            title={productColors.join(" / ")}
            style={{
              position: "absolute", bottom: 5, left: 5,
              display: "flex", alignItems: "center", gap: 3,
              background: "rgba(255,255,255,0.92)",
              padding: "2px 5px 2px 3px", borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: colorBg(productColors[0]),
              border: /^(white|cream)$/i.test(productColors[0]) ? "1px solid #d1d5db" : "1px solid rgba(0,0,0,0.1)",
            }} />
            <span style={{ fontSize: 7, fontWeight: 800, color: "#111", letterSpacing: 0.3, textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>
              {productColors[0]}
            </span>
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: "7px 8px 9px", display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: TEXT, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{product.name}</div>
        <ColorChip colors={productColors} size={8} />
        <div style={{ fontSize: 12, fontWeight: 900, color: ACCENT, fontFamily: "'Courier New',monospace" }}>₹{product.price.toLocaleString("en-IN")}</div>
        <button onClick={handleCart}
          style={{ marginTop: "auto", width: "100%", padding: "5px 6px", borderRadius: 5, border: "none", background: added || inCart ? "#16a34a" : showSizes ? ACCENT : "#f3f4f6", color: added || inCart || showSizes ? "#fff" : TEXT, fontSize: 8, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New',monospace", letterSpacing: 0.8, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
          {added ? <><Check size={8} /> ADDED!</> : inCart ? <><Check size={8} /> IN CART</> : showSizes ? <>✕ CANCEL</> : needsSize ? <><ShoppingBag size={8} /> SELECT SIZE</> : <><ShoppingBag size={8} /> ADD</>}
        </button>
        {showSizes && !added && (
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
            {sizeList.map(sz => (
              <button key={sz} onClick={e => { e.stopPropagation(); addWithSize(sz); }}
                style={{ padding: "3px 6px", fontSize: 8, fontWeight: 700, border: `1px solid ${BORDER}`, borderRadius: 4, background: BG, color: TEXT, cursor: "pointer", fontFamily: "'Courier New',monospace" }}>
                {sz}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Products renderer — in-chat catalogue browsing ──────────── */
function ProductsRenderer({ data, onQuickReply }: { data: ProductsData; onQuickReply: (t: string) => void }) {
  // Prefer API-provided products (engine output) — they include the burnt-toast.com URL.
  // Fallback to local catalogue filter if API didn't provide any.
  type ProductWithExtras = Product & { url?: string; colors?: string[] };
  const results: ProductWithExtras[] = data.products && data.products.length > 0
    ? data.products.map(p => ({
        id: p.sku,
        name: p.name,
        brand: "Burnt Toast",
        price: p.price,
        image: p.img,
        category: p.category ?? "",
        tags: [],
        rating: p.rating ?? 4.5,
        reviews: 0,
        isNew: p.isNew,
        sizes: p.sizes ?? ["XS", "S", "M", "L", "XL"],
        description: "",
        url: p.url,
        colors: p.colors ?? [],
      } as ProductWithExtras))
    : (chatCategoryFilter(data.category ?? "all", data.gender ?? "all").slice(0, 12)
        .map(p => ({ ...p, colors: p.color ?? [] } as ProductWithExtras)));

  const catLabel = data.category === "all" ? "Collection" : data.category;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Message bubble */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "4px 12px 12px 12px", padding: "12px 16px", color: TEXT, fontSize: 13, lineHeight: 1.75 }}>
        {data.message}
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
        <span style={{ color: MUTED, fontSize: 9, fontWeight: 900, letterSpacing: 3, fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>
          {results.length} {catLabel.toUpperCase()} PIECES
        </span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      {/* Horizontal scroll grid */}
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {results.map(p => <MiniProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* View all link */}
      <a href="/#collection" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: ACCENT, fontSize: 11, fontWeight: 700, fontFamily: "'Courier New',monospace", letterSpacing: 1, textDecoration: "none", alignSelf: "flex-start" }}>
        VIEW ALL IN SHOP →
      </a>

      {data.next_question && (
        <div style={{ color: MUTED, fontSize: 12, fontStyle: "italic", padding: "8px 14px", borderLeft: `3px solid ${BORDER}`, lineHeight: 1.6 }}>
          {data.next_question}
        </div>
      )}

      <FollowUpChips onQuickReply={onQuickReply} />
    </div>
  );
}

/* ── Replace-options renderer — 3-4 alternative cards for one slot ──
   User taps a card → onSelectReplacement fires → API confirms swap and
   the updated full outfit appears as the next chat message.
   ───────────────────────────────────────────────────────────────── */
function ReplaceOptionsRenderer({
  data,
  onQuickReply,
  onSelectReplacement,
}: {
  data: ReplaceOptionsData;
  onQuickReply: (t: string) => void;
  onSelectReplacement: (slot: string, sku: string, name: string) => void;
}) {
  const slotMeta = SECTION_META[data.replace_slot] ?? { label: data.replace_slot.toUpperCase(), color: ACCENT };
  const lockedRoles = Object.keys(data.locked_outfit ?? {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Message bubble */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: "4px 12px 12px 12px",
        padding: "12px 16px", color: TEXT, fontSize: 13, lineHeight: 1.65,
      }}>
        {data.message}
      </div>

      {/* "Keeping these" tags */}
      {lockedRoles.length > 0 && (
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5,
          padding: "6px 10px", background: "#f0fdf4",
          border: "1px solid #bbf7d0", borderRadius: 8,
        }}>
          <span style={{ color: "#15803d", fontSize: 9, fontWeight: 900, fontFamily: "'Courier New',monospace", letterSpacing: 1 }}>
            ✓ KEEPING
          </span>
          {lockedRoles.map(role => {
            const meta = SECTION_META[role] ?? { label: role.toUpperCase(), color: MUTED };
            return (
              <span key={role} style={{
                background: meta.color, color: "#fff",
                fontSize: 8, fontWeight: 900, padding: "2px 7px", borderRadius: 3,
                letterSpacing: 1, fontFamily: "'Courier New',monospace",
              }}>
                {meta.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
        <span style={{ color: slotMeta.color, fontSize: 9, fontWeight: 900, letterSpacing: 3, fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>
          {data.options.length} NEW {slotMeta.label} OPTIONS
        </span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      {/* Option cards — horizontal scroll */}
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
          {data.options.map(p => (
            <ReplaceOptionCard
              key={p.sku}
              product={p}
              slotColor={slotMeta.color}
              onChoose={() => onSelectReplacement(data.replace_slot, p.sku, p.name)}
            />
          ))}
        </div>
      </div>

      {data.next_question && (
        <div style={{ color: MUTED, fontSize: 12, fontStyle: "italic", padding: "8px 14px", borderLeft: `3px solid ${BORDER}`, lineHeight: 1.6 }}>
          {data.next_question}
        </div>
      )}

      <FollowUpChips onQuickReply={onQuickReply} />
    </div>
  );
}

function ReplaceOptionCard({
  product,
  slotColor,
  onChoose,
}: {
  product: ProductsApiItem;
  slotColor: string;
  onChoose: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const { toggleItem, isWishlisted } = useWishlist();
  const wished = isWishlisted(product.sku);

  function openOriginal(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(product.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      onClick={onChoose}
      style={{
        background: BG, border: `2px solid ${BORDER}`, borderRadius: 10,
        overflow: "hidden", display: "flex", flexDirection: "column",
        minWidth: 145, maxWidth: 170, cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = slotColor; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = BORDER; }}
    >
      <div style={{ height: 3, background: slotColor }} />
      <div style={{ position: "relative", width: "100%", paddingBottom: "120%", background: CARD, overflow: "hidden" }}>
        {product.img && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.img} alt={product.name}
            onError={() => setImgError(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 24 }}>👚</span>
        )}
        {/* Wishlist */}
        <button onClick={e => { e.stopPropagation(); toggleItem({ id: product.sku, name: product.name, brand: "Burnt Toast", price: product.price, image: product.img, category: "", tags: [], rating: 0, reviews: 0, sizes: product.sizes ?? [], description: "" }); }}
          style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={10} fill={wished ? "#ef4444" : "none"} color={wished ? "#ef4444" : "#888"} />
        </button>
        {/* Color swatch */}
        {product.colors && product.colors.length > 0 && (
          <div style={{ position: "absolute", bottom: 5, left: 5, display: "flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.92)", padding: "2px 5px 2px 3px", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: colorBg(product.colors[0]), border: /^(white|cream)$/i.test(product.colors[0]) ? "1px solid #d1d5db" : "1px solid rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: 7, fontWeight: 800, color: "#111", letterSpacing: 0.3, textTransform: "uppercase", fontFamily: "'Courier New',monospace" }}>{product.colors[0]}</span>
          </div>
        )}
      </div>
      <div style={{ padding: "7px 8px 9px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: TEXT, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{product.name}</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: slotColor, fontFamily: "'Courier New',monospace" }}>₹{product.price.toLocaleString("en-IN")}</div>
        <button onClick={(e) => { e.stopPropagation(); onChoose(); }}
          style={{ marginTop: "auto", width: "100%", padding: "6px 6px", borderRadius: 6, border: "none", background: slotColor, color: "#fff", fontSize: 9, fontWeight: 900, cursor: "pointer", fontFamily: "'Courier New',monospace", letterSpacing: 0.8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          ✓ CHOOSE THIS
        </button>
        <button onClick={openOriginal}
          style={{ width: "100%", padding: "4px 6px", borderRadius: 5, border: `1px solid ${BORDER}`, background: BG, color: MUTED, fontSize: 8, fontWeight: 700, cursor: "pointer", fontFamily: "'Courier New',monospace", letterSpacing: 0.6 }}>
          👀 VIEW MORE
        </button>
      </div>
    </div>
  );
}

/* ── Smart dispatcher ────────────────────────────────────────────── */
function ResponseRenderer({ data, onQuickReply, onSelectReplacement }: {
  data: ParsedResponse;
  onQuickReply: (t: string) => void;
  onSelectReplacement: (slot: string, sku: string, name: string) => void;
}) {
  if (data.type === "chat") return <ChatBubble data={data} onQuickReply={onQuickReply} />;
  if (data.type === "multi") return <MultiRenderer data={data} onQuickReply={onQuickReply} />;
  if (data.type === "products") return <ProductsRenderer data={data as ProductsData} onQuickReply={onQuickReply} />;
  if (data.type === "replace_options") return <ReplaceOptionsRenderer data={data} onQuickReply={onQuickReply} onSelectReplacement={onSelectReplacement} />;
  return <OutfitRenderer data={data as OutfitData} onQuickReply={onQuickReply} />;
}

/* ── Parse helper ────────────────────────────────────────────────── */
function parseRaw(raw: string): ParsedResponse | null {
  if (!raw || !raw.trim()) return null;
  try {
    // 1. Strip markdown fences
    const stripped = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    // 2. Try to extract a JSON object — greedy from first { to last }
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const jsonStr = match[0];

    // 3. Parse and normalise missing type field
    const obj = JSON.parse(jsonStr);

    if (!obj.type) {
      if (Array.isArray(obj.looks)) obj.type = "multi";
      else if (obj.outfit) obj.type = "outfit";
      else obj.type = "chat";
    }

    return obj as ParsedResponse;
  } catch {
    return null;
  }
}

/* ── Main component ──────────────────────────────────────────────── */
/* ── Session memory: outfit state + user profile across turns ── */
interface SessionState {
  currentOutfit: Record<string, { sku: string; name?: string; price?: number }>;
  userProfile: {
    gender?: string;
    occasion?: string;
    vibe?: string;
    color?: string;
    budget?: number;
  };
  rejectedSkus: string[];
  likedSkus: string[];
}

const EMPTY_SESSION: SessionState = {
  currentOutfit: {},
  userProfile: {},
  rejectedSkus: [],
  likedSkus: [],
};

/** Pull the latest outfit and profile bits from a parsed assistant response */
function deriveSessionUpdate(parsed: ParsedResponse, prev: SessionState): SessionState {
  const next: SessionState = {
    currentOutfit: { ...prev.currentOutfit },
    userProfile: { ...prev.userProfile },
    rejectedSkus: [...prev.rejectedSkus],
    likedSkus: [...prev.likedSkus],
  };
  // OUTFIT → store all slots as current
  if (parsed.type === "outfit") {
    const outfit = parsed.outfit ?? {};
    const newOutfit: SessionState["currentOutfit"] = {};
    for (const role of Object.keys(outfit) as Array<keyof OutfitPair>) {
      const item = outfit[role];
      if (item?.sku) newOutfit[role as string] = { sku: item.sku, name: item.name, price: item.price };
    }
    next.currentOutfit = newOutfit;
    if (parsed.occasion) next.userProfile.occasion = parsed.occasion;
    if (parsed.vibe)     next.userProfile.vibe = parsed.vibe;
  }
  // MULTI → take the FIRST look as the "current" outfit (user can swap by tapping)
  if (parsed.type === "multi" && parsed.looks?.[0]) {
    const outfit = parsed.looks[0].outfit ?? {};
    const newOutfit: SessionState["currentOutfit"] = {};
    for (const role of Object.keys(outfit) as Array<keyof OutfitPair>) {
      const item = outfit[role];
      if (item?.sku) newOutfit[role as string] = { sku: item.sku, name: item.name, price: item.price };
    }
    next.currentOutfit = newOutfit;
    if (parsed.looks[0].occasion) next.userProfile.occasion = parsed.looks[0].occasion;
    if (parsed.looks[0].vibe)     next.userProfile.vibe = parsed.looks[0].vibe;
  }
  return next;
}

export default function LookbookChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [session, setSession]   = useState<SessionState>(EMPTY_SESSION);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /** User tapped one of the 3-4 alternative cards in a replace_options grid */
  const handleSelectReplacement = (slot: string, sku: string, name: string) => {
    send("", {
      action: "confirm_replacement",
      actionParams: { replace_slot: slot, selected_sku: sku },
      userBubble: `Going with "${name}" ✓`,
    });
  };

  const send = async (text?: string, opts?: { action?: string; actionParams?: Record<string, unknown>; userBubble?: string }) => {
    const query = (text ?? input).trim();
    if (!query && !opts?.action) return;
    if (loading) return;
    if (!opts?.action) setInput("");

    // Show a user-side bubble unless explicitly suppressed
    const bubbleText = opts?.userBubble ?? query;
    if (bubbleText) {
      const userMsg: ChatMessage = { role: "user", content: bubbleText };
      setMessages(prev => [...prev, userMsg]);
    }
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query || "(action)",
          history,
          session,
          ...(opts?.action ? { action: opts.action, action_params: opts.actionParams } : {}),
        }),
      });

      const data = await res.json();

      let parsed: ParsedResponse | null = null;
      if (data && typeof data.type === "string") {
        parsed = data as ParsedResponse;
      } else {
        parsed = parseRaw(data._raw || "") ?? parseRaw(data.message || "");
      }

      if (!parsed) {
        const rawMsg = data.message || "";
        const safeMessage = rawMsg.trimStart().startsWith("{")
          ? "Toastie's brain had a moment — try asking again! No cap it'll hit different next time 😅"
          : (rawMsg || "Something went wrong — try again!");
        const fallback: ChatData = { type: "chat", message: safeMessage };
        setMessages(prev => [...prev, { role: "assistant", content: safeMessage, parsed: fallback }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.message || "", parsed }]);
        // Update session memory with anything new from this response
        setSession(prev => deriveSessionUpdate(parsed!, prev));
      }
    } catch {
      const fallback: ChatData = { type: "chat", message: "Couldn't connect — try again!" };
      setMessages(prev => [...prev, { role: "assistant", content: "", parsed: fallback }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div style={{
        background: BG, borderBottom: `1px solid ${BORDER}`,
        padding: "12px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image
            src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
            alt="Burnt Toast" width={110} height={36}
            style={{ width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        <div style={{ textAlign: "center" }}>
          <div style={{ color: TEXT, fontWeight: 900, fontSize: 14, letterSpacing: 1, fontFamily: "'Courier New',monospace" }}>Ask Toastie</div>
          <div style={{ color: MUTED, fontSize: 9, letterSpacing: 2, fontFamily: "'Courier New',monospace" }}>YOUR PERSONAL AI STYLIST</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 6px #22c55e" }} />
            <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "'Courier New',monospace" }}>LIVE</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setSession(EMPTY_SESSION); }}
              title="Start a new chat"
              style={{
                background: "transparent", border: `1px solid ${BORDER}`,
                borderRadius: 6, padding: "4px 10px",
                fontSize: 9, fontWeight: 700, color: MUTED,
                fontFamily: "'Courier New',monospace", letterSpacing: 1,
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT; e.currentTarget.style.color = TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}
            >
              NEW CHAT
            </button>
          )}
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Welcome screen */}
        {messages.length === 0 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto", width: "100%" }}>

            {/* ── Hero card ── */}
            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
              <div style={{ color: TEXT, fontSize: 26, fontWeight: 900, marginBottom: 6, fontFamily: "'Courier New',monospace", letterSpacing: 1 }}>
                Ask Toastie
              </div>
              <div style={{ color: MUTED, fontSize: 9, fontWeight: 700, marginBottom: 14, letterSpacing: 3, fontFamily: "'Courier New',monospace" }}>
                YOUR PERSONAL AI STYLIST · SPRING 26
              </div>
              <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.9, maxWidth: 440, margin: "0 auto" }}>
                Tell Toastie your <strong style={{ color: TEXT }}>aesthetic</strong>, <strong style={{ color: TEXT }}>occasion</strong>, or <strong style={{ color: TEXT }}>budget</strong> — get a full shoppable Spring 26 look in seconds.
              </div>
            </div>

            {/* ── AESTHETIC IDENTITY ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{ color: MUTED, fontSize: 9, fontWeight: 700, letterSpacing: 3, fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>
                FIND YOUR AESTHETIC
              </span>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {AESTHETICS.map((a, i) => (
                <div
                  key={i}
                  onClick={() => send(a.prompt)}
                  style={{
                    background: BG, border: `1px solid ${BORDER}`,
                    borderRadius: 14, overflow: "hidden",
                    cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
                    display: "flex", flexDirection: "column",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.boxShadow = `0 4px 20px ${a.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Colour bar */}
                  <div style={{ height: 4, background: a.color }} />

                  <div style={{ padding: "18px 16px 16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>

                    {/* Icon + Title row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: a.tagBg, display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 17,
                        flexShrink: 0,
                      }}>{a.icon}</div>
                      <div style={{ color: TEXT, fontWeight: 900, fontSize: 13, letterSpacing: 0.5, fontFamily: "'Courier New',monospace", lineHeight: 1.2 }}>
                        {a.title.toUpperCase()}
                      </div>
                    </div>

                    {/* Style tag chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {a.tags.map((tag, t) => (
                        <span key={t} style={{
                          background: a.tagBg, color: a.tagColor,
                          fontSize: 9, fontWeight: 700, padding: "3px 9px",
                          borderRadius: 20, letterSpacing: 0.5,
                          fontFamily: "'Courier New',monospace",
                        }}>{tag}</span>
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: BORDER }} />

                    {/* Occasions list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                      {a.occasions.map((occ, o) => (
                        <div key={o} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{
                            fontSize: 13, lineHeight: 1,
                            marginTop: 1, flexShrink: 0,
                          }}>{occ.icon}</span>
                          <span style={{
                            color: MUTED, fontSize: 11, lineHeight: 1.5,
                          }}>{occ.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginTop: 4,
                    }}>
                      <div style={{
                        color: a.color, fontSize: 10, fontWeight: 700,
                        fontFamily: "'Courier New',monospace", letterSpacing: 0.5,
                      }}>
                        Shop this aesthetic ↗
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Message thread */}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            gap: 8,
            width: msg.role === "assistant" ? "100%" : undefined,
            maxWidth: msg.role === "user" ? "80%" : "100%",
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 32, height: 32, minWidth: 32, background: TEXT,
                borderRadius: 8, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 15, marginTop: 2,
              }}>✨</div>
            )}

            <div style={{ flex: msg.role === "assistant" ? 1 : undefined }}>
              {msg.role === "assistant" ? (
                msg.parsed
                  ? <ResponseRenderer data={msg.parsed} onQuickReply={(t) => send(t)} onSelectReplacement={handleSelectReplacement} />
                  : (
                    <div style={{
                      background: CARD, border: `1px solid ${BORDER}`,
                      borderRadius: "4px 12px 12px 12px",
                      padding: "12px 16px", color: TEXT, fontSize: 13, lineHeight: 1.7,
                    }}>{msg.content || "Let me think about that..."}</div>
                  )
              ) : (
                <div style={{
                  background: ACCENT, color: "#fff",
                  borderRadius: "12px 12px 4px 12px",
                  padding: "10px 14px", fontSize: 13, lineHeight: 1.5,
                }}>{msg.content}</div>
              )}
            </div>

            {msg.role === "user" && (
              <div style={{
                width: 32, height: 32, minWidth: 32, background: CARD,
                border: `1px solid ${BORDER}`, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, marginTop: 2,
              }}>👤</div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{
              width: 32, height: 32, background: TEXT, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>✨</div>
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: "4px 12px 12px 12px",
              padding: "14px 18px", display: "flex", gap: 6, alignItems: "center",
            }}>
              <span style={{ color: MUTED, fontSize: 12, marginRight: 8, fontFamily: "'Courier New',monospace" }}>
                Toastie is cooking something fire...
              </span>
              {[0, 1, 2].map(n => (
                <div key={n} style={{
                  width: 7, height: 7, background: ACCENT, borderRadius: "50%",
                  animation: "btpulse 1.2s infinite",
                  animationDelay: `${n * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT BAR ────────────────────────────────────────────── */}
      <div style={{
        padding: "12px 16px", background: BG,
        borderTop: `1px solid ${BORDER}`,
        display: "flex", gap: 8,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.05)",
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask Toastie — occasion, vibe, budget..."
          rows={2}
          style={{
            flex: 1, background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: "10px 14px", color: TEXT,
            fontSize: 13, fontFamily: "'Segoe UI',sans-serif",
            resize: "none", outline: "none", lineHeight: 1.4,
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = ACCENT)}
          onBlur={e => (e.target.style.borderColor = BORDER)}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            background: (!input.trim() || loading) ? CARD : ACCENT,
            color: (!input.trim() || loading) ? MUTED : "#fff",
            border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: "0 20px", fontSize: 18,
            cursor: (!input.trim() || loading) ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "⏳" : "✈️"}
        </button>
      </div>
    </div>
  );
}
