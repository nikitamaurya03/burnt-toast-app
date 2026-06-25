"use client";

import { useState, useRef } from "react";
import { X, Upload, Camera } from "lucide-react";
import { useLookbook } from "@/context/LookbookContext";
import type { LookbookItem, LookSource } from "@/types/lookbook";

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: Partial<LookbookItem>;
}

const OCCASIONS = ["Casual", "Work", "Party", "Wedding", "Date Night", "Beach", "Festive", "Brunch", "Gym"];
const AESTHETICS = ["Quiet Luxury", "Old Money", "Streetwear", "Minimalist", "Boho", "Y2K", "Indian Festive", "Classic", "Cottagecore", "Dark Academia"];

export default function SaveLookModal({ open, onClose, prefill }: Props) {
  const { addItem, collections, createCollection } = useLookbook();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(prefill?.imageUrl || "");
  const [title, setTitle] = useState(prefill?.title || "");
  const [description, setDescription] = useState(prefill?.description || "");
  const [occasion, setOccasion] = useState(prefill?.occasion || "");
  const [aesthetic, setAesthetic] = useState(prefill?.aesthetic || "");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(prefill?.collectionIds || []);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(prefill?.tags || []);
  const [newColName, setNewColName] = useState("");

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
  };

  const handleSave = () => {
    if (!title || !imageUrl) return;
    const item: LookbookItem = {
      id: crypto.randomUUID(),
      imageUrl,
      title,
      description,
      occasion,
      aesthetic,
      colors: [],
      tags,
      source: (prefill?.source || "upload") as LookSource,
      liked: false,
      collectionIds: selectedCollections,
      createdAt: Date.now(),
    };
    addItem(item);
    onClose();
  };

  const handleCreateCol = () => {
    if (!newColName.trim()) return;
    const col = createCollection(newColName.trim());
    setSelectedCollections(prev => [...prev, col.id]);
    setNewColName("");
  };

  const toggleCol = (id: string) => {
    setSelectedCollections(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
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
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>Save Look</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--cream-deep)]"><X size={20} /></button>
        </div>

        {/* Image */}
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
              <img src={imageUrl} alt="Look" className="w-full h-full object-cover" />
              <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 p-1 rounded-full" style={{ background: "var(--cream)" }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors hover:bg-[var(--cream-deep)]"
              style={{ border: "2px dashed var(--line)" }}
            >
              <div className="flex items-center gap-2">
                <Camera size={20} style={{ color: "var(--sage)" }} />
                <Upload size={20} style={{ color: "var(--sage)" }} />
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)" }}>Upload outfit photo</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-4">
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>TITLE *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer brunch look" className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }} />
          </div>
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>DESCRIPTION</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this look..." rows={2} className="w-full mt-1 px-3 py-2 rounded-lg text-sm resize-none"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>OCCASION</label>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
                <option value="">Select...</option>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>AESTHETIC</label>
              <select value={aesthetic} onChange={e => setAesthetic(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg text-sm"
                style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
                <option value="">Select...</option>
                {AESTHETICS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>TAGS</label>
          <div className="flex gap-2 mt-1">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add tag..." className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }} />
            <button onClick={addTag} className="px-3 py-2 rounded-lg" style={{ background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 10 }}>ADD</button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "var(--cream-deep)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink)" }}>
                  {t} <button onClick={() => setTags(tags.filter(x => x !== t))}><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Collections */}
        <div className="mb-5">
          <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>ADD TO COLLECTIONS</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {collections.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCol(c.id)}
                className="px-3 py-1.5 rounded-full text-xs transition-colors"
                style={{
                  background: selectedCollections.includes(c.id) ? "var(--sage)" : "var(--paper)",
                  border: "1px solid var(--line)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--ink)",
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="New collection..."
              className="flex-1 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }} />
            <button onClick={handleCreateCol} className="px-3 py-1.5 rounded-lg" style={{ background: "var(--cream-deep)", fontFamily: "var(--font-mono)", fontSize: 10 }}>CREATE</button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!title || !imageUrl}
          className="w-full py-3 rounded-xl font-medium transition-opacity disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--cream)", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: 2 }}
        >
          SAVE TO LOOKBOOK
        </button>
      </div>
    </div>
  );
}
