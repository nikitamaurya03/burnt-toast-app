"use client";

import { Heart, Trash2, FolderPlus, Image as ImageIcon } from "lucide-react";
import type { LookbookItem } from "@/types/lookbook";

interface Props {
  item: LookbookItem;
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function LookCard({ item, onToggleLike, onDelete }: Props) {
  return (
    <div className="group relative rounded-xl overflow-hidden" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden" style={{ background: "var(--cream-deep)" }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} style={{ color: "var(--line)" }} />
          </div>
        )}
      </div>

      {/* Like button */}
      <button
        onClick={() => onToggleLike(item.id)}
        className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
        style={{ background: "var(--cream)" }}
      >
        <Heart size={14} fill={item.liked ? "var(--burnt)" : "none"} stroke={item.liked ? "var(--burnt)" : "var(--ash)"} />
      </button>

      {/* Source badge */}
      {item.source !== "upload" && (
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
          style={{ background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--ink)", letterSpacing: 1 }}
        >
          {item.source.toUpperCase()}
        </span>
      )}

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate mb-1" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>
          {item.title}
        </h3>

        <div className="flex items-center gap-2 mb-1.5">
          {item.occasion && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--cream-deep)", fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--ash)" }}>
              {item.occasion}
            </span>
          )}
          {item.aesthetic && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: "var(--cream-deep)", fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--sage-deep)" }}>
              {item.aesthetic}
            </span>
          )}
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(t => (
              <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)" }}>#{t}</span>
            ))}
          </div>
        )}

        {/* Delete (hover) */}
        <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--cream-deep)]">
            <Trash2 size={12} style={{ color: "var(--ash)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
