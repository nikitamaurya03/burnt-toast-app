"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, Camera, Loader2, Sparkles } from "lucide-react";
import { useWardrobe } from "@/context/WardrobeContext";
import { WARDROBE_CATEGORIES } from "@/types/wardrobe";
import type { WardrobeItem, AITagResult } from "@/types/wardrobe";

interface Props {
  open: boolean;
  onClose: () => void;
}

const OCCASIONS = ["Casual", "Work", "Party", "Wedding", "Beach", "Gym", "Lounge", "Festive", "Date Night", "Everyday"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All-Season"];
const PATTERNS = ["Solid", "Striped", "Plaid", "Floral", "Abstract", "Animal Print", "Geometric", "Polka Dot", "Tie-Dye"];

export default function AddItemModal({ open, onClose }: Props) {
  const { addItem } = useWardrobe();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [tagging, setTagging] = useState(false);
  const [tagError, setTagError] = useState("");

  const [category, setCategory] = useState("Tops");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("Solid");
  const [season, setSeason] = useState("All-Season");
  const [occasion, setOccasion] = useState("Everyday");
  const [style, setStyle] = useState("");
  const [fabric, setFabric] = useState("");
  const [brand, setBrand] = useState("");
  const [fit, setFit] = useState("Regular");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const resetForm = () => {
    setImageUrl(""); setCategory("Tops"); setColor(""); setPattern("Solid");
    setSeason("All-Season"); setOccasion("Everyday"); setStyle(""); setFabric("");
    setBrand(""); setFit("Regular"); setPrice(""); setTags([]); setTagError("");
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) { setTagError("Max 10 MB"); return; }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);

      const base64 = dataUrl.split(",")[1];
      const mime = file.type;
      setTagging(true);
      setTagError("");

      try {
        const res = await fetch("/api/wardrobe-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mime }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Tagging failed");
        const result: AITagResult = await res.json();
        setCategory(result.category || "Tops");
        setColor(result.color || "");
        setPattern(result.pattern || "Solid");
        setSeason(result.season || "All-Season");
        setOccasion(result.occasion || "Everyday");
        setStyle(result.style || "");
        setFabric(result.fabric || "");
        setBrand(result.brand || "");
        setFit(result.fit || "Regular");
        setTags(result.tags || []);
      } catch (err) {
        setTagError(err instanceof Error ? err.message : "AI tagging failed");
      } finally {
        setTagging(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = () => {
    if (!color) return;
    const item: WardrobeItem = {
      id: crypto.randomUUID(),
      imageUrl,
      category, color, pattern, season, brand, fit, fabric, occasion, style,
      purchasePrice: price ? parseFloat(price) : undefined,
      currentStatus: "active",
      wearCount: 0,
      favorite: false,
      tags,
      source: imageUrl ? "upload" : "manual",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addItem(item);
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: "var(--cream)", border: "1px solid var(--line)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>Add to Wardrobe</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--cream-deep)]"><X size={20} /></button>
        </div>

        {/* Image Upload */}
        <div className="mb-5">
          {imageUrl ? (
            <div className="relative w-full aspect-square rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
              <img src={imageUrl} alt="Item" className="w-full h-full object-cover" />
              {tagging && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "rgba(255,255,255,0.85)" }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: "var(--sage)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)" }}>AI is analyzing...</span>
                </div>
              )}
              <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 p-1 rounded-full" style={{ background: "var(--cream)" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center gap-3 transition-colors hover:bg-[var(--cream-deep)]"
              style={{ border: "2px dashed var(--line)" }}
            >
              <div className="flex items-center gap-2">
                <Camera size={20} style={{ color: "var(--sage)" }} />
                <Upload size={20} style={{ color: "var(--sage)" }} />
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)" }}>
                Upload photo for AI auto-tagging
              </span>
              <span className="flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--sage)" }}>
                <Sparkles size={12} /> Powered by Claude Vision
              </span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {tagError && <p className="mt-2 text-xs" style={{ color: "var(--burnt)", fontFamily: "var(--font-mono)" }}>{tagError}</p>}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <SelectField label="Category" value={category} onChange={setCategory} options={[...WARDROBE_CATEGORIES]} />
          <InputField label="Color *" value={color} onChange={setColor} placeholder="e.g. Navy Blue" />
          <SelectField label="Pattern" value={pattern} onChange={setPattern} options={PATTERNS} />
          <SelectField label="Season" value={season} onChange={setSeason} options={SEASONS} />
          <SelectField label="Occasion" value={occasion} onChange={setOccasion} options={OCCASIONS} />
          <InputField label="Style" value={style} onChange={setStyle} placeholder="e.g. Minimalist" />
          <InputField label="Fabric" value={fabric} onChange={setFabric} placeholder="e.g. Cotton" />
          <InputField label="Brand" value={brand} onChange={setBrand} placeholder="e.g. Zara" />
          <SelectField label="Fit" value={fit} onChange={setFit} options={["Slim", "Regular", "Oversized", "Relaxed", "Tailored", "Cropped", "Flowy"]} />
          <InputField label="Price (₹)" value={price} onChange={setPrice} placeholder="e.g. 1999" type="number" />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(t => (
              <span key={t} className="px-2 py-1 rounded-full" style={{ background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink)" }}>
                {t}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!color || tagging}
          className="w-full py-3 rounded-xl font-medium transition-opacity disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--cream)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: 2 }}
        >
          {tagging ? "ANALYZING..." : "ADD TO WARDROBE"}
        </button>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>{label.toUpperCase()}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
        style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>{label.toUpperCase()}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
        style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }}
      />
    </div>
  );
}
