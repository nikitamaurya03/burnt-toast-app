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
  top:    { label: "TOP",    color: "#2563EB" },
  bottom: { label: "BOTTOM", color: "#0891B2" },
};

/* ── Occasion cards ──────────────────────────────────────────────── */
const OCCASIONS = [
  {
    emoji: "🎓",
    title: "Main Character\nLecture Era",
    desc: "Everyday campus fits that slap without even trying — comfy, expressive, and cheap enough to refresh on repeat, fr.",
    prompt: "College campus outfit that hits different, comfy but make it fashion, expressive and affordable, understood the assignment",
  },
  {
    emoji: "🎉",
    title: "Fest Mode:\nUnlocked",
    desc: "Bold prints and statement fits built for gigs, fests, and house parties where YOU are the main event. No cap.",
    prompt: "College fest or house party outfit, bold and statement-making, I need to absolutely serve, it's giving main character energy",
  },
  {
    emoji: "☀️",
    title: "Lowkey Snatched\nHangouts",
    desc: "Mall runs, café dates, friend's place — looks that feel effortless but actually hit different. Lowkey goes hard.",
    prompt: "Casual hangout outfit for mall or café, effortless and clean but actually fire, lowkey hits different no cap",
  },
  {
    emoji: "💃",
    title: "Date Night,\nNo Debating",
    desc: "Statement pieces that go absolutely crazy after dark — elevated, bold, and living rent-free in everyone's heads.",
    prompt: "Date night outfit, elevated and bold, statement pieces that turn heads, it's giving luxury energy, serve and slay fr",
  },
  {
    emoji: "⚡",
    title: "Sport-to-Street\nEra",
    desc: "Track pants styled up with a fitted tee — not gym wear, but the vibe between sport and street is bussin fr fr.",
    prompt: "Athleisure streetwear outfit, sport meets street energy, baggy track pants styled up with a fitted tee, lowkey bussin",
  },
  {
    emoji: "✈️",
    title: "Wanderlust But\nMake It Fashion",
    desc: "Put-together without trying too hard on a long day out — straight-fits and clean tees that travel and slay. Ate that.",
    prompt: "Travel and day trip outfit, comfortable but put-together, straight fits and regular tees that look clean all day, understood the assignment",
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

/* ── Product card ────────────────────────────────────────────────── */
function ProductCard({ section, item }: { section: string; item: OutfitItem }) {
  const meta = SECTION_META[section] ?? { label: section.toUpperCase(), color: ACCENT };
  const [imgError, setImgError] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { addItem: addToCart, isInCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  if (!item?.name) return null;

  const product = buildProduct(item, section);
  const defaultSize = product.sizes?.[0] ?? "M";
  const inCart = isInCart(item.sku);
  const wishlisted = isWishlisted(item.sku);

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addToCart(product, defaultSize);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1600);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    toggleItem(product);
  }

  return (
    <div
      style={{
        background: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
        overflow: "hidden", display: "flex", flexDirection: "column",
        cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onClick={() => item.url && window.open(item.url, "_blank")}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
    >
      <div style={{ height: 3, background: meta.color }} />

      {/* Portrait image — aspect ratio 3:4 */}
      <div style={{
        background: CARD,
        position: "relative",
        width: "100%",
        paddingBottom: "133%",   /* 4/3 = 133% — portrait */
        overflow: "hidden",
        fontSize: 40,
      }}>
        {item.img && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.img} alt={item.name}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top center",
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
          }}>{item.emoji}</span>
        )}
        <div style={{
          position: "absolute", top: 6, left: 6,
          background: meta.color, color: "#fff",
          fontSize: 8, fontWeight: 900, padding: "2px 7px",
          borderRadius: 4, letterSpacing: 1.5,
          fontFamily: "'Courier New', monospace",
        }}>{meta.label}</div>

        {/* Wishlist toggle */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          style={{
            position: "absolute", top: 6, right: 6,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 5px rgba(0,0,0,0.18)",
            transition: "transform 0.15s",
          }}
        >
          <Heart
            size={14}
            fill={wishlisted ? "#ef4444" : "none"}
            color={wishlisted ? "#ef4444" : "#888"}
          />
        </button>
      </div>

      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ color: TEXT, fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>{item.name}</div>
        <div style={{ color: meta.color, fontWeight: 900, fontSize: 18, fontFamily: "'Courier New',monospace" }}>₹{item.price}</div>
        <div style={{ color: MUTED, fontSize: 10, lineHeight: 1.6, marginTop: 1 }}>{item.note}</div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "9px 10px",
            borderRadius: 8,
            border: "none",
            background: cartAdded || inCart ? ACCENT : "#f3f4f6",
            color: cartAdded || inCart ? "#fff" : TEXT,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Courier New',monospace",
            letterSpacing: 1,
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          }}
        >
          {cartAdded ? <Check size={11} /> : <ShoppingBag size={11} />}
          {cartAdded ? "ADDED!" : inCart ? "IN CART" : "ADD TO CART"}
        </button>
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
  const items = (["top", "bottom"] as const).filter(k => outfit?.[k]?.name);
  const { addItem: addToCart } = useCart();
  const [shopAdded, setShopAdded] = useState(false);

  function handleShopLook(e: React.MouseEvent) {
    e.stopPropagation();
    items.forEach(k => {
      const it = outfit[k];
      if (!it) return;
      const product = buildProduct(it, k);
      addToCart(product, product.sizes?.[0] ?? "M");
    });
    setShopAdded(true);
    setTimeout(() => setShopAdded(false), 2000);
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
        {/* Badges */}
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

        {/* Product cards */}
        {items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "stretch" }}>
            {items.map(k => <ProductCard key={k} section={k} item={outfit[k]!} />)}
          </div>
        ) : (
          <div style={{ color: MUTED, fontSize: 12, textAlign: "center", padding: "12px 0" }}>
            No products in this look.
          </div>
        )}

        {/* Total + shop */}
        {items.length > 0 && (
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
              onClick={handleShopLook}
              style={{
                background: shopAdded ? "#16a34a" : ACCENT,
                color: "#fff", border: "none", borderRadius: 8,
                padding: "9px 16px", fontSize: 11, fontWeight: 900,
                cursor: "pointer", fontFamily: "'Courier New',monospace",
                letterSpacing: 1, whiteSpace: "nowrap",
                transition: "background 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {shopAdded ? <><Check size={13} /> ADDED TO CART!</> : <><ShoppingBag size={13} /> ADD LOOK TO CART</>}
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

function OutfitRenderer({ data }: { data: OutfitData }) {
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
    </div>
  );
}

function MultiRenderer({ data }: { data: MultiData }) {
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
    </div>
  );
}

/* ── Smart dispatcher ────────────────────────────────────────────── */
function ResponseRenderer({ data, onQuickReply }: { data: ParsedResponse; onQuickReply: (t: string) => void }) {
  if (data.type === "chat") return <ChatBubble data={data} onQuickReply={onQuickReply} />;
  if (data.type === "multi") return <MultiRenderer data={data} />;
  return <OutfitRenderer data={data as OutfitData} />;
}

/* ── Parse helper ────────────────────────────────────────────────── */
function parseRaw(raw: string): ParsedResponse | null {
  try {
    const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/,"").trim();
    const jsonStr = stripped.match(/\{[\s\S]*\}/)?.[0] ?? stripped;
    const obj = JSON.parse(jsonStr);

    // Normalise missing type field by detecting structure
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
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history }),
      });

      const data = await res.json();
      const parsed = parseRaw(data._raw || "");

      // Fallback: if parsing fails, show Claude's plain message text
      if (!parsed) {
        const fallback: ChatData = {
          type: "chat",
          message: data.message || "Something went wrong — try again!",
        };
        setMessages(prev => [...prev, { role: "assistant", content: data.message || "", parsed: fallback }]);
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

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "'Courier New',monospace" }}>LIVE</span>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Welcome screen */}
        {messages.length === 0 && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto", width: "100%" }}>

            {/* Hero card */}
            <div style={{ background: ACCENT, borderRadius: 20, padding: "32px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 900, marginBottom: 6, fontFamily: "'Courier New',monospace", letterSpacing: 1 }}>
                Ask Toastie
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, fontWeight: 700, marginBottom: 16, letterSpacing: 3, fontFamily: "'Courier New',monospace" }}>
                YOUR PERSONAL AI STYLIST
              </div>
              <div style={{ color: "rgba(255,255,255,0.80)", fontSize: 13, lineHeight: 1.85, maxWidth: 440, margin: "0 auto" }}>
                Drop your <strong style={{ color: "#fff" }}>occasion</strong>, <strong style={{ color: "#fff" }}>vibe</strong>, or <strong style={{ color: "#fff" }}>budget</strong> — Toastie builds a full shoppable look that absolutely slaps. Every piece from Burnt Toast, no cap. 🛍️
              </div>
            </div>

            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{ color: MUTED, fontSize: 9, fontWeight: 900, letterSpacing: 3, fontFamily: "'Courier New',monospace", whiteSpace: "nowrap" }}>
                OCCASIONS — WHERE CUSTOMERS WEAR BURNT TOAST
              </span>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>

            {/* Occasion cards grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {OCCASIONS.map((occ, i) => (
                <div
                  key={i}
                  style={{
                    background: BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    padding: "20px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.borderColor = "#bbb"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = BORDER; }}
                >
                  {/* Emoji */}
                  <div style={{ fontSize: 32, lineHeight: 1 }}>{occ.emoji}</div>

                  {/* Title */}
                  <div style={{
                    color: TEXT, fontWeight: 800, fontSize: 14,
                    lineHeight: 1.3, fontFamily: "'Segoe UI', sans-serif",
                    whiteSpace: "pre-line",
                  }}>
                    {occ.title}
                  </div>

                  {/* Description */}
                  <div style={{
                    color: MUTED, fontSize: 11, lineHeight: 1.65,
                    fontFamily: "'Segoe UI', sans-serif", flex: 1,
                  }}>
                    {occ.desc}
                  </div>

                  {/* Try Look button */}
                  <button
                    onClick={() => send(occ.prompt)}
                    style={{
                      marginTop: 4,
                      width: "100%",
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${BORDER}`,
                      background: BG,
                      color: TEXT,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Courier New',monospace",
                      letterSpacing: 0.5,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
                    onMouseLeave={e => { e.currentTarget.style.background = BG; e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BORDER; }}
                  >
                    Try Look ↗
                  </button>
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
              <style>{`@keyframes btpulse{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}`}</style>
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
