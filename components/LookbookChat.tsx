"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { products as allProducts } from "@/data/products";
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
  footwear:   { label: "FOOTWEAR",   color: "#7C3AED" },
  bag:        { label: "BAG",        color: "#B45309" },
  sunglasses: { label: "SUNGLASSES", color: "#059669" },
  necklace:   { label: "NECKLACE",   color: "#DB2777" },
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

/* ── Types ───────────────────────────────────────────────────────── */
interface OutfitItem {
  sku: string;
  name: string;
  price: number;
  note: string;
  emoji: string;
  url: string;
  img?: string | null;
}

interface OutfitPair {
  top?: OutfitItem;
  bottom?: OutfitItem;
  footwear?: OutfitItem;
  bag?: OutfitItem;
  sunglasses?: OutfitItem;
  necklace?: OutfitItem;
}

interface ChatData {
  type: "chat";
  message: string;
  quick_replies?: string[];
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
}

interface LookEntry {
  look_number: number;
  label: string;
  occasion: string;
  vibe: string;
  outfit: OutfitPair;
  total: number;
  budget_note: string;
}

interface MultiData {
  type: "multi";
  message: string;
  looks: LookEntry[];
  next_question?: string;
}

type ParsedResponse = ChatData | OutfitData | MultiData;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  parsed?: ParsedResponse | null;
}

/* ── Helper: build a Product from OutfitItem + optional DB lookup ── */
function buildProduct(item: OutfitItem, section: string): Product {
  return allProducts.find(p => p.id === item.sku) ?? {
    id: item.sku,
    name: item.name,
    brand: "Burnt Toast",
    price: item.price,
    image: item.img ?? "",
    category: section === "top" ? "Tops" : "Bottoms",
    tags: [],
    rating: 0,
    reviews: 0,
    sizes: ["XS", "S", "M", "L", "XL"],
    description: item.note,
  };
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
      onClick={() => !showSizes && item.url && window.open(item.url, "_blank")}
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
      </div>

      {/* Card body */}
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div style={{
          color: TEXT, fontWeight: 700, fontSize: 11, lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{item.name}</div>
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

/* ── Single outfit block (reused in both outfit + multi) ─────────── */
function OutfitBlock({
  outfit, occasion, vibe, total, budget_note, label,
}: {
  outfit: OutfitPair;
  occasion: string;
  vibe: string;
  total: number;
  budget_note: string;
  label?: string;
}) {
  // All available items in display order — every slot is its own key
  const allKeys = (["top", "bottom", "footwear", "bag", "sunglasses", "necklace"] as const).filter(k => outfit?.[k]?.name);

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
                  : <><ShoppingBag size={13} /> ADD LOOK TO CART</>
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
  "Keep it under ₹1500",
  "More streetwear",
  "Something bolder",
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

/* ── Smart dispatcher ────────────────────────────────────────────── */
function ResponseRenderer({ data, onQuickReply }: { data: ParsedResponse; onQuickReply: (t: string) => void }) {
  if (data.type === "chat") return <ChatBubble data={data} onQuickReply={onQuickReply} />;
  if (data.type === "multi") return <MultiRenderer data={data} onQuickReply={onQuickReply} />;
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
export default function LookbookChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || loading) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Keep only last 10 messages to avoid context bloat on long conversations
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history }),
      });

      const data = await res.json();

      // Try _raw first (full Claude output), then fall back to data.message (may be partial)
      const parsed = parseRaw(data._raw || "") ?? parseRaw(data.message || "");

      if (!parsed) {
        // Guard: if data.message looks like raw JSON, never show it — use friendly text
        const rawMsg = data.message || "";
        const safeMessage = rawMsg.trimStart().startsWith("{")
          ? "Toastie's brain had a moment — try asking again! No cap it'll hit different next time 😅"
          : (rawMsg || "Something went wrong — try again!");

        const fallback: ChatData = { type: "chat", message: safeMessage };
        setMessages(prev => [...prev, { role: "assistant", content: safeMessage, parsed: fallback }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.message || "", parsed }]);
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
              onClick={() => setMessages([])}
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
                  ? <ResponseRenderer data={msg.parsed} onQuickReply={send} />
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
