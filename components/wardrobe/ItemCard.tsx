"use client";

import { Heart, RotateCw, Trash2, Shirt } from "lucide-react";
import type { WardrobeItem } from "@/types/wardrobe";

interface Props {
  item: WardrobeItem;
  onToggleFavorite: (id: string) => void;
  onWear: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ItemCard({ item, onToggleFavorite, onWear, onDelete }: Props) {
  return (
    <div className="group relative rounded-xl overflow-hidden" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden" style={{ background: "var(--cream-deep)" }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt size={40} style={{ color: "var(--line)" }} />
          </div>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={() => onToggleFavorite(item.id)}
        className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
        style={{ background: "var(--cream)" }}
      >
        <Heart size={14} fill={item.favorite ? "var(--burnt)" : "none"} stroke={item.favorite ? "var(--burnt)" : "var(--ash)"} />
      </button>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full border" style={{ background: item.color.toLowerCase(), borderColor: "var(--line)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1, textTransform: "uppercase" }}>
            {item.category}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          {item.brand && <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{item.brand}</span>}
          {item.pattern && item.pattern !== "Solid" && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--cream-deep)", fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--ash)" }}>
              {item.pattern}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <RotateCw size={10} style={{ color: "var(--sage)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sage)" }}>
              {item.wearCount} wears
            </span>
          </div>
          {item.purchasePrice && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)" }}>
              ₹{item.purchasePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action buttons (show on hover) */}
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onWear(item.id)}
            className="flex-1 py-1.5 rounded-lg text-center transition-colors hover:opacity-80"
            style={{ background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ink)", letterSpacing: 1 }}
          >
            WORE IT
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--cream-deep)]"
          >
            <Trash2 size={12} style={{ color: "var(--ash)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
