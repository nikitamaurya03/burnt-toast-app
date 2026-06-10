"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sparkles, Palette, User, Heart, Shirt,
  RotateCcw, Pencil, Check, X,
} from "lucide-react";
import { useToastieUser } from "@/context/ToastieUserContext";
import { generateStyleIdentity } from "@/lib/styleIdentity";

/* ── Editable field options (same as onboarding) ─────────────── */
const STYLE_OPTIONS   = ["minimal", "casual", "streetwear", "old-money", "korean", "trendy"];
const COLOR_OPTIONS   = ["black", "white", "beige", "earthy", "pop-colors"];
const SKIN_OPTIONS    = ["very-light", "light", "medium", "tan", "deep", "rich-deep"];
const BODY_OPTIONS    = ["pear", "apple", "rectangle", "hourglass", "inverted-triangle", "not-sure"];
const NEEDS_OPTIONS   = ["everyday", "casual", "vacation", "party", "travel"];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, clearUser, isLoaded } = useToastieUser();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string[]>([]);
  const [showReset, setShowReset] = useState(false);

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "2.5px solid var(--line)", borderTopColor: "var(--sage-deep)" }} />
      </div>
    );
  }

  if (!user) {
    router.push("/chat");
    return null;
  }

  /* ── Edit handlers ─────────────────────────────────────────── */
  const startEdit = (field: string, current: string | string[]) => {
    setEditing(field);
    setEditValue(Array.isArray(current) ? current : [current]);
  };

  const toggleEditValue = (val: string, multi: boolean) => {
    if (multi) {
      setEditValue((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
      );
    } else {
      setEditValue([val]);
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    const patch: Record<string, unknown> = {};

    if (editing === "preferredStyles") patch.preferredStyles = editValue;
    else if (editing === "favoriteColors") patch.favoriteColors = editValue;
    else if (editing === "skinTone") patch.skinTone = editValue[0] || "";
    else if (editing === "bodyShape") patch.bodyShape = editValue[0] || "not-sure";
    else if (editing === "stylingNeeds") patch.stylingNeeds = editValue;

    // Recalculate identity
    const newInput = {
      preferredStyles: (patch.preferredStyles as string[]) ?? user.preferredStyles,
      favoriteColors:  (patch.favoriteColors as string[])  ?? user.favoriteColors,
      skinTone:        (patch.skinTone as string)           ?? user.skinTone,
      bodyShape:       (patch.bodyShape as string)          ?? user.bodyShape,
      stylingNeeds:    (patch.stylingNeeds as string[])     ?? user.stylingNeeds,
    };
    const result = generateStyleIdentity(newInput);

    updateUser({
      ...patch,
      styleIdentity:    result.styleIdentity,
      colorPersonality: result.colorPersonality,
      stylingDirection: result.stylingDirection,
      tags:             result.tags,
    } as Record<string, unknown> as Parameters<typeof updateUser>[0]);

    setEditing(null);
  };

  const handleReset = () => {
    clearUser();
    router.push("/chat");
  };

  const formatLabel = (s: string) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)", paddingTop: 80 }}>
      <div className="max-w-xl mx-auto px-5 pb-20">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/chat"
            className="p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
          >
            <ArrowLeft size={18} stroke="var(--ink)" />
          </Link>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 24,
            color: "var(--ink)",
          }}>
            Style Profile
          </h1>
        </div>

        {/* ── Identity Card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            boxShadow: "0 4px 20px rgba(26,26,26,0.06)",
          }}
        >
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--sage)", boxShadow: "0 2px 10px rgba(116,139,106,0.25)" }}
            >
              <span style={{ fontFamily: "var(--font-brand)", fontSize: 22, color: "var(--ink)" }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)" }}>
                {user.name}
              </h2>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1.5 }}>
                MEMBER SINCE {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <IdentityRow icon={<Sparkles size={14} />} label="Style Identity" value={user.styleIdentity} />
            <IdentityRow icon={<Palette size={14} />} label="Color Personality" value={user.colorPersonality} />
            <IdentityRow icon={<Shirt size={14} />} label="Styling Direction" value={user.stylingDirection} />
          </div>
        </motion.div>

        {/* ── Editable Preferences ───────────────────────────── */}
        <h3
          className="mb-3 mt-8"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "var(--ash)", textTransform: "uppercase" }}
        >
          Your Preferences
        </h3>

        <div className="space-y-3">
          <EditableRow
            label="Preferred Styles"
            values={user.preferredStyles}
            options={STYLE_OPTIONS}
            multi
            isEditing={editing === "preferredStyles"}
            editValue={editValue}
            formatLabel={formatLabel}
            onStartEdit={() => startEdit("preferredStyles", user.preferredStyles)}
            onToggle={(v) => toggleEditValue(v, true)}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
          <EditableRow
            label="Favorite Colors"
            values={user.favoriteColors}
            options={COLOR_OPTIONS}
            multi
            isEditing={editing === "favoriteColors"}
            editValue={editValue}
            formatLabel={formatLabel}
            onStartEdit={() => startEdit("favoriteColors", user.favoriteColors)}
            onToggle={(v) => toggleEditValue(v, true)}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
          <EditableRow
            label="Skin Tone"
            values={user.skinTone ? [user.skinTone] : []}
            options={SKIN_OPTIONS}
            multi={false}
            isEditing={editing === "skinTone"}
            editValue={editValue}
            formatLabel={formatLabel}
            onStartEdit={() => startEdit("skinTone", user.skinTone)}
            onToggle={(v) => toggleEditValue(v, false)}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
          <EditableRow
            label="Body Shape"
            values={user.bodyShape ? [user.bodyShape] : []}
            options={BODY_OPTIONS}
            multi={false}
            isEditing={editing === "bodyShape"}
            editValue={editValue}
            formatLabel={formatLabel}
            onStartEdit={() => startEdit("bodyShape", user.bodyShape)}
            onToggle={(v) => toggleEditValue(v, false)}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
          <EditableRow
            label="Styling Needs"
            values={user.stylingNeeds}
            options={NEEDS_OPTIONS}
            multi
            isEditing={editing === "stylingNeeds"}
            editValue={editValue}
            formatLabel={formatLabel}
            onStartEdit={() => startEdit("stylingNeeds", user.stylingNeeds)}
            onToggle={(v) => toggleEditValue(v, true)}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
        </div>

        {/* ── Reset Button ───────────────────────────────────── */}
        <div className="mt-12 text-center">
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full transition-all hover:bg-red-50"
              style={{
                fontFamily: "var(--font-body)", fontSize: 13,
                color: "var(--burnt)", border: "1px solid var(--burnt)",
              }}
            >
              <RotateCcw size={14} />
              Reset My Style Profile
            </button>
          ) : (
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--paper)", border: "1px solid var(--burnt)" }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", marginBottom: 12 }}>
                This will clear your style profile. Are you sure?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: "var(--burnt)" }}
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="px-5 py-2 rounded-lg text-sm font-medium"
                  style={{ background: "var(--cream-deep)", color: "var(--ink)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function IdentityRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: "var(--cream-soft)" }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--sage-deep)" }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.5, color: "var(--ash)", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink)", fontStyle: "italic" }}>
        {value}
      </span>
    </div>
  );
}

function EditableRow({
  label, values, options, multi, isEditing, editValue,
  formatLabel, onStartEdit, onToggle, onSave, onCancel,
}: {
  label: string;
  values: string[];
  options: string[];
  multi: boolean;
  isEditing: boolean;
  editValue: string[];
  formatLabel: (s: string) => string;
  onStartEdit: () => void;
  onToggle: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: 1.5, color: "var(--ash)", textTransform: "uppercase" }}>
          {label}
        </span>
        {!isEditing ? (
          <button
            onClick={onStartEdit}
            className="p-1.5 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
          >
            <Pencil size={12} stroke="var(--ash)" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={onSave} className="p-1.5 rounded-full hover:bg-green-50">
              <Check size={14} stroke="var(--sage-deep)" />
            </button>
            <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-red-50">
              <X size={14} stroke="var(--burnt)" />
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="flex flex-wrap gap-2">
          {values.length > 0 ? values.map((v) => (
            <span
              key={v}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                fontFamily: "var(--font-body)",
                background: "var(--cream-soft)",
                color: "var(--ink)",
                border: "1px solid var(--line)",
              }}
            >
              {formatLabel(v)}
            </span>
          )) : (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ash)" }}>
              Not set
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const sel = editValue.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className="px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  fontFamily: "var(--font-body)",
                  background: sel ? "var(--sage)" : "var(--cream-soft)",
                  color: sel ? "var(--ink)" : "var(--ash)",
                  border: sel ? "1.5px solid var(--sage-deep)" : "1.5px solid var(--line)",
                  fontWeight: sel ? 600 : 400,
                }}
              >
                {formatLabel(opt)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
