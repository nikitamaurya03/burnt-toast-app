"use client";

import { Package, DollarSign, TrendingUp, Heart, AlertCircle, BarChart3 } from "lucide-react";
import type { WardrobeAnalytics } from "@/types/wardrobe";

interface Props {
  analytics: WardrobeAnalytics;
}

export default function AnalyticsPanel({ analytics }: Props) {
  const topCategories = Object.entries(analytics.categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topColors = Object.entries(analytics.colorDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Package size={16} />} label="Total Items" value={analytics.totalItems.toString()} />
        <StatCard icon={<DollarSign size={16} />} label="Wardrobe Value" value={`₹${analytics.totalValue.toLocaleString()}`} />
        <StatCard icon={<TrendingUp size={16} />} label="Avg Cost/Wear" value={analytics.avgCostPerWear > 0 ? `₹${analytics.avgCostPerWear}` : "—"} />
        <StatCard icon={<Heart size={16} />} label="Favorites" value={analytics.favoriteCount.toString()} />
      </div>

      {/* Category Distribution */}
      {topCategories.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} style={{ color: "var(--sage)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1 }}>CATEGORY BREAKDOWN</span>
          </div>
          <div className="space-y-2">
            {topCategories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-20 truncate" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink)" }}>{cat}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--cream-deep)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ background: "var(--sage)", width: `${(count / analytics.totalItems) * 100}%` }}
                  />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Distribution */}
      {topColors.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1 }}>TOP COLORS</span>
          <div className="flex flex-wrap gap-2 mt-3">
            {topColors.map(([col, count]) => (
              <div key={col} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: "var(--cream-deep)" }}>
                <div className="w-3 h-3 rounded-full border" style={{ background: col.toLowerCase(), borderColor: "var(--line)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink)" }}>{col}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)" }}>×{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unused items warning */}
      {analytics.unused.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: "var(--cream-deep)", border: "1px solid var(--line)" }}>
          <AlertCircle size={16} style={{ color: "var(--burnt)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", fontWeight: 500 }}>
              {analytics.unused.length} items never worn
            </span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ash)", marginTop: 2 }}>
              Consider styling them into outfits or donating if unused for 6+ months.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
      <div className="flex items-center justify-center mb-2" style={{ color: "var(--sage)" }}>{icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>{value}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--ash)", letterSpacing: 1, marginTop: 2 }}>{label.toUpperCase()}</div>
    </div>
  );
}
