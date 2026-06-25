"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, BarChart3, Grid3X3, SlidersHorizontal } from "lucide-react";
import { useWardrobe } from "@/context/WardrobeContext";
import { WARDROBE_CATEGORIES } from "@/types/wardrobe";
import ItemCard from "@/components/wardrobe/ItemCard";
import AddItemModal from "@/components/wardrobe/AddItemModal";
import AnalyticsPanel from "@/components/wardrobe/AnalyticsPanel";

type Tab = "closet" | "analytics";

export default function WardrobePage() {
  const { items, isLoaded, toggleFavorite, incrementWear, deleteItem, getAnalytics } = useWardrobe();
  const [tab, setTab] = useState<Tab>("closet");
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterSeason, setFilterSeason] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const activeItems = useMemo(() => {
    let filtered = items.filter(i => i.currentStatus === "active");
    if (filterCategory !== "All") filtered = filtered.filter(i => i.category === filterCategory);
    if (filterSeason !== "All") filtered = filtered.filter(i => i.season === filterSeason);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.category.toLowerCase().includes(q) ||
        i.color.toLowerCase().includes(q) ||
        i.brand?.toLowerCase().includes(q) ||
        i.style?.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [items, filterCategory, filterSeason, search]);

  const analytics = useMemo(() => getAnalytics(), [getAnalytics]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="animate-pulse" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ash)" }}>Loading wardrobe...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-6 pb-24" style={{ background: "var(--cream)" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sage)", letterSpacing: 3, fontWeight: 500 }}>
            YOUR DIGITAL CLOSET
          </span>
          <h1 className="mt-2" style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--ink)", lineHeight: 1.2 }}>
            My Wardrobe
          </h1>
          <p className="mt-2 max-w-md mx-auto" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ash)" }}>
            {items.length} items · ₹{analytics.totalValue.toLocaleString()} total value
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <TabButton active={tab === "closet"} onClick={() => setTab("closet")} icon={<Grid3X3 size={14} />} label="Closet" />
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")} icon={<BarChart3 size={14} />} label="Analytics" />
        </div>

        {tab === "closet" && (
          <>
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ash)" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by color, brand, style..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "var(--paper)", border: "1px solid var(--line)", fontFamily: "var(--font-body)", color: "var(--ink)" }}
                />
              </div>
              <button
                onClick={() => setShowFilters(f => !f)}
                className="p-2.5 rounded-xl transition-colors"
                style={{ background: showFilters ? "var(--sage)" : "var(--paper)", border: "1px solid var(--line)" }}
              >
                <SlidersHorizontal size={16} style={{ color: showFilters ? "var(--ink)" : "var(--ash)" }} />
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-opacity hover:opacity-80"
                style={{ background: "var(--ink)", color: "var(--cream)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1 }}
              >
                <Plus size={14} /> ADD
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>CATEGORY</label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="block mt-1 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "var(--cream)", border: "1px solid var(--line)", fontFamily: "var(--font-body)" }}
                  >
                    <option value="All">All Categories</option>
                    {WARDROBE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1 }}>SEASON</label>
                  <select
                    value={filterSeason}
                    onChange={e => setFilterSeason(e.target.value)}
                    className="block mt-1 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "var(--cream)", border: "1px solid var(--line)", fontFamily: "var(--font-body)" }}
                  >
                    <option value="All">All Seasons</option>
                    {["Spring", "Summer", "Autumn", "Winter", "All-Season"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Item Grid */}
            {activeItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={toggleFavorite}
                    onWear={incrementWear}
                    onDelete={deleteItem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--cream-deep)" }}>
                  <Filter size={24} style={{ color: "var(--ash)" }} />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)" }}>
                  {items.length === 0 ? "Your wardrobe is empty" : "No items match filters"}
                </h3>
                <p className="mt-2" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ash)" }}>
                  {items.length === 0 ? "Add your first clothing item to get started" : "Try adjusting your search or filters"}
                </p>
                {items.length === 0 && (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="mt-4 px-6 py-2.5 rounded-xl transition-opacity hover:opacity-80"
                    style={{ background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", letterSpacing: 1 }}
                  >
                    + ADD FIRST ITEM
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {tab === "analytics" && <AnalyticsPanel analytics={analytics} />}
      </div>

      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 rounded-full transition-colors"
      style={{
        background: active ? "var(--ink)" : "var(--paper)",
        color: active ? "var(--cream)" : "var(--ash)",
        border: active ? "none" : "1px solid var(--line)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: 1,
      }}
    >
      {icon} {label.toUpperCase()}
    </button>
  );
}
