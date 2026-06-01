"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Download, RefreshCw, Upload, Sparkles } from "lucide-react";

/* ── Palette mirrors LookbookChat editorial theme ───────────────── */
const BG          = "#F1EBDD";
const CARD        = "#FFFFFF";
const SOFT        = "#F5F1E8";
const BORDER      = "#E5DFD0";
const TEXT        = "#1A1A1A";
const MUTED       = "#8A8782";
const SAGE_DEEP   = "#748B6A";

const FONT_DISPLAY = "'DM Serif Display', Georgia, serif";
const FONT_MONO    = "'JetBrains Mono', 'Courier New', monospace";
const FONT_BODY    = "'Inter', system-ui, sans-serif";

const MAX_SIZE_MB = 5;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const BODY_TYPES = [
  { value: "slim",                label: "Slim" },
  { value: "athletic",            label: "Athletic" },
  { value: "regular",             label: "Regular" },
  { value: "curvy",               label: "Curvy" },
  { value: "plus-size",           label: "Plus size" },
  { value: "prefer-not-to-say",   label: "Prefer not to say" },
];

/* ── The outfit shape this modal accepts (matches LookbookChat) ─ */
export interface TryOnOutfitItem {
  sku?: string;
  name?: string;
  price?: number;
  note?: string;
  url?: string;
  img?: string | null;
  colors?: string[];
  color_family?: string;
}
export type TryOnOutfitMap = Record<string, TryOnOutfitItem>;

interface Props {
  open:   boolean;
  outfit: TryOnOutfitMap;
  onClose: () => void;
}

/* ── Helper: file → base64 (strip data: prefix) ─────────────────── */
function fileToBase64(file: File): Promise<{ base64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ base64, preview: result });
    };
    reader.readAsDataURL(file);
  });
}

export default function VirtualTryOnModal({ open, outfit, onClose }: Props) {
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>("image/jpeg");
  const [bodyType, setBodyType] = useState<string>("regular");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Close on Esc */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* Reset when reopened */
  useEffect(() => {
    if (!open) {
      // Brief delay so the close animation doesn't flicker reset content
      const t = setTimeout(() => {
        setPhotoBase64(null);
        setPhotoPreview(null);
        setGenerated(null);
        setError(null);
        setLoading(false);
        setDragOver(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const handleFile = useCallback(async (file: File | undefined | null) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setError("Please upload a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large. Max ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    try {
      const { base64, preview } = await fileToBase64(file);
      setPhotoBase64(base64);
      setPhotoPreview(preview);
      setPhotoMime(file.type);
      setGenerated(null);
    } catch {
      setError("Could not read that file. Try another image.");
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!photoBase64) {
      setError("Please upload a photo first.");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError(null);
    setGenerated(null);

    try {
      const res = await fetch("/api/virtual-tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhoto: photoBase64,
          userMime:  photoMime,
          bodyType,
          outfit,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Generation failed.");
      }
      setGenerated(data.image as string);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong — please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [photoBase64, photoMime, bodyType, outfit, loading]);

  const handleDownload = useCallback(() => {
    if (!generated) return;
    const a = document.createElement("a");
    a.href = generated;
    a.download = `burnt-toast-tryon-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [generated]);

  const handleRegenerate = useCallback(() => {
    setGenerated(null);
    handleGenerate();
  }, [handleGenerate]);

  if (!open) return null;

  /* Count outfit items for the small subtitle */
  const itemCount = Object.values(outfit).filter(i => i?.name).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Virtual Try-On"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(20,18,14,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 14px",
        animation: "btFadeIn 180ms ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bt-tryon-modal"
        style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          width: "100%", maxWidth: 560,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          position: "relative",
          fontFamily: FONT_BODY,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 2,
            width: 34, height: 34, borderRadius: "50%",
            background: CARD, border: `1px solid ${BORDER}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} stroke={TEXT} />
        </button>

        <div style={{ padding: "26px 24px 22px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px", borderRadius: 999,
              background: CARD, border: `1px solid ${BORDER}`,
              color: TEXT,
              fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2.5, fontWeight: 600,
              marginBottom: 12,
            }}>
              <Sparkles size={11} /> VIRTUAL TRY-ON
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY, color: TEXT,
              fontSize: 28, lineHeight: 1.1,
              margin: "0 0 6px",
            }}>
              See Yourself In <em style={{ fontStyle: "italic" }}>This Look</em>
            </h2>
            <p style={{
              color: MUTED, fontSize: 13, lineHeight: 1.5,
              margin: "0 auto", maxWidth: 380,
            }}>
              Upload a photo and let Toastie visualize this outfit on you.
              {itemCount > 0 && (
                <> · <span style={{ color: TEXT, fontWeight: 500 }}>{itemCount} item{itemCount !== 1 ? "s" : ""}</span></>
              )}
            </p>
          </div>

          {/* ═══ RESULT VIEW ═════════════════════════════════════ */}
          {generated && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{
                position: "relative",
                borderRadius: 14,
                overflow: "hidden",
                border: `1px solid ${BORDER}`,
                background: SOFT,
                aspectRatio: "3/4",
                maxWidth: 440, margin: "0 auto",
                width: "100%",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generated}
                  alt="Your virtual try-on"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "contain", display: "block",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  style={{
                    flex: 1, minWidth: 140,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "12px 16px", borderRadius: 999,
                    background: "transparent", border: `1px solid ${TEXT}`, color: TEXT,
                    fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.8, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={13} /> REGENERATE
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    flex: 1, minWidth: 140,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "12px 16px", borderRadius: 999,
                    background: TEXT, border: "none", color: BG,
                    fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.8, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Download size={13} /> DOWNLOAD
                </button>
                <button
                  onClick={onClose}
                  style={{
                    width: "100%",
                    padding: "10px 16px", borderRadius: 999,
                    background: "transparent", border: `1px solid ${BORDER}`, color: MUTED,
                    fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.8, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}

          {/* ═══ LOADING VIEW ════════════════════════════════════ */}
          {loading && (
            <div style={{
              padding: "30px 14px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[0, 1, 2].map(n => (
                  <span key={n} style={{
                    width: 9, height: 9, borderRadius: "50%", background: TEXT,
                    animation: "btTryPulse 1.2s infinite",
                    animationDelay: `${n * 0.2}s`,
                    display: "inline-block",
                  }} />
                ))}
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: 22, fontStyle: "italic", color: TEXT,
              }}>
                Creating your virtual try-on…
              </div>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 10, color: MUTED, letterSpacing: 2,
              }}>
                THIS USUALLY TAKES 10–25 SECONDS
              </div>
            </div>
          )}

          {/* ═══ INPUT VIEW ══════════════════════════════════════ */}
          {!loading && !generated && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Photo upload */}
              <div>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2.5, fontWeight: 600,
                  color: MUTED, marginBottom: 8,
                }}>
                  YOUR PHOTO
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault(); setDragOver(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    background: dragOver ? SOFT : CARD,
                    border: `1.5px dashed ${dragOver ? TEXT : BORDER}`,
                    borderRadius: 14,
                    padding: 16,
                    cursor: "pointer",
                    transition: "all 180ms ease",
                    display: "flex", alignItems: "center", gap: 14,
                    minHeight: 110,
                  }}
                >
                  {photoPreview ? (
                    <>
                      <div style={{
                        position: "relative",
                        width: 74, height: 96,
                        borderRadius: 10, overflow: "hidden",
                        flexShrink: 0, background: SOFT,
                        border: `1px solid ${BORDER}`,
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photoPreview} alt="Your upload" style={{
                          width: "100%", height: "100%", objectFit: "cover",
                        }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>Photo uploaded ✓</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                          Click to change · JPG, PNG, WEBP · max {MAX_SIZE_MB} MB
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: SOFT, border: `1px solid ${BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Upload size={20} stroke={TEXT} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>
                          Tap or drop a photo here
                        </div>
                        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
                          Full-body forward-facing photo · JPG / PNG / WEBP · max {MAX_SIZE_MB} MB
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={e => {
                    handleFile(e.target.files?.[0]);
                    if (e.target) e.target.value = "";
                  }}
                />
              </div>

              {/* Body type */}
              <div>
                <label htmlFor="bt-body-type" style={{
                  display: "block",
                  fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2.5, fontWeight: 600,
                  color: MUTED, marginBottom: 8,
                }}>
                  BODY TYPE
                </label>
                <select
                  id="bt-body-type"
                  value={bodyType}
                  onChange={e => setBodyType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    color: TEXT,
                    fontSize: 14, fontFamily: FONT_BODY,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                >
                  {BODY_TYPES.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "#b91c1c",
                  fontSize: 12,
                  lineHeight: 1.45,
                }}>
                  {error}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!photoBase64 || loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 999,
                  background: !photoBase64 ? "#C9C2B0" : TEXT,
                  color: BG,
                  border: "none",
                  fontFamily: FONT_MONO,
                  fontSize: 12, letterSpacing: 2, fontWeight: 600,
                  cursor: !photoBase64 ? "not-allowed" : "pointer",
                  transition: "background 180ms ease, transform 180ms ease",
                  marginTop: 2,
                }}
              >
                <Sparkles size={14} /> GENERATE TRY-ON
              </button>

              <div style={{
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
                color: MUTED, fontSize: 10, fontFamily: FONT_MONO, letterSpacing: 2,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: SAGE_DEEP, display: "inline-block" }} />
                POWERED BY GEMINI
              </div>

              {/* Tiny outfit preview strip */}
              {itemCount > 0 && (
                <div style={{
                  display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4,
                }}>
                  {Object.values(outfit)
                    .filter(i => i?.img)
                    .slice(0, 6)
                    .map((it, i) => (
                      <div key={i} style={{
                        position: "relative",
                        width: 44, height: 44, borderRadius: 8,
                        overflow: "hidden", flexShrink: 0,
                        border: `1px solid ${BORDER}`, background: SOFT,
                      }}>
                        <Image
                          src={it.img!}
                          alt={it.name ?? ""}
                          fill
                          sizes="44px"
                          style={{ objectFit: "cover", objectPosition: "top" }}
                          unoptimized
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes btFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes btTryPulse {
          0%, 60%, 100% { transform: scale(1);   opacity: 0.4 }
          30%           { transform: scale(1.4); opacity: 1   }
        }
      `}</style>
    </div>
  );
}
