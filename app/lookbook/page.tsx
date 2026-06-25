"use client";

import { useState, useMemo } from "react";
import { Plus, Heart, Grid3X3, FolderOpen, Search, Trash2 } from "lucide-react";
import { useLookbook } from "@/context/LookbookContext";
import LookCard from "@/components/lookbook/LookCard";
import SaveLookModal from "@/components/lookbook/SaveLookModal";

type Tab = "all" | "liked" | "collections";

export default function LookbookPage() {
  const { items, collections, isLoaded, toggleLike, deleteItem, getCollectionItems, deleteCollection } = useLookbook();
  const [tab, setTab] = useState<Tab>("all");
  const [showSave, setShowSave] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const displayed = useMemo(() => {
    let list = tab === "liked" ? items.filter(i => i.liked) : items;

    if (tab === "collections" && activeCollection) {
      list = getCollectionItems(activeCollection);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        i.occasion?.toLowerCase().includes(q) ||
        i.aesthetic?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [items, tab, search, activeCollection, getCollectionItems]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="animate-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ash)" }}>Loading lookbook...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24" style={{ background: "var(--cream)" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sage)", letterSpacing: 3, fontWeight: 500 }}>
            YOUR STYLE BOARD
          </span>
          <h1 className="mt-2" style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--ink)", lineHeight: 1.2 }}>
            Lookbook
          </h1>
          <p className="mt-2 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ash)" }}>
            Save, organize and revisit your favorite looks & outfit inspiration
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <TabBtn active={tab === "all"} onClick={() => { setTab("all"); setActiveCollection(null); }} icon={<Grid3X3 size={14} />} label="All Looks" />
          <TabBtn active={tab === "liked"} onClick={() => { setTab("liked"); setActiveCollection(null); }} icon={<Heart size={14} />} label="Liked" />
          <TabBtn active={tab === "collections"} onClick={() => setTab("collections")} icon={<FolderOpen size={14} />} label="Collections" />
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ash)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search looks, tags, aesthetics..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
              style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }}
            />
          </div>
          <button
            onClick={() => setShowSave(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: "var(--ink)", color: "var(--cream)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1 }}
          >
            <Plus size={14} /> SAVE LOOK
          </button>
        </div>

        {/* Collections sidebar (when on collections tab) */}
        {tab === "collections" && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveCollection(null)}
              className="px-4 py-2 rounded-full text-xs transition-colors"
              style={{
                background: !activeCollection ? "var(--ink)" : "var(--paper)",
                color: !activeCollection ? "var(--cream)" : "var(--ash)",
                border: !activeCollection ? "none" : "1px solid var(--line)",
                fontFamily: "var(--font-mono)", letterSpacing: 1,
              }}
            >
              ALL
            </button>
            {collections.map(c => (
              <div key={c.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCollection(c.id)}
                  className="px-4 py-2 rounded-full text-xs transition-colors"
                  style={{
                    background: activeCollection === c.id ? "var(--ink)" : "var(--paper)",
                    color: activeCollection === c.id ? "var(--cream)" : "var(--ash)",
                    border: activeCollection === c.id ? "none" : "1px solid var(--line)",
                    fontFamily: "var(--font-mono)", letterSpacing: 1,
                  }}
                >
                  {c.name} ({c.itemCount})
                </button>
                <button onClick={() => deleteCollection(c.id)} className="p-1 rounded-full hover:bg-[var(--cream-deep)]">
                  <Trash2 size={10} style={{ color: "var(--ash)" }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map(item => (
              <LookCard key={item.id} item={item} onToggleLike={toggleLike} onDelete={deleteItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--cream-deep)" }}>
              {tab === "liked" ? <Heart size={24} style={{ color: "var(--ash)" }} /> : <Grid3X3 size={24} style={{ color: "var(--ash)" }} />}
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)" }}>
              {tab === "liked" ? "No liked looks yet" : items.length === 0 ? "Your lookbook is empty" : "No looks match your search"}
            </h3>
            <p className="mt-2" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ash)" }}>
              {items.length === 0 ? "Save your first outfit inspiration to get started" : "Try a different search term"}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowSave(true)}
                className="mt-4 px-6 py-2.5 rounded-xl transition-opacity hover:opacity-80"
                style={{ background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", letterSpacing: 1 }}
              >
                + SAVE FIRST LOOK
              </button>
            )}
          </div>
        )}
      </div>

      <SaveLookModal open={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 rounded-full transition-colors"
      style={{
        background: active ? "var(--ink)" : "var(--paper)",
        color: active ? "var(--cream)" : "var(--ash)",
        border: active ? "none" : "1px solid var(--line)",
        fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1,
      }}
    >
      {icon} {label.toUpperCase()}
    </button>
  );
}
