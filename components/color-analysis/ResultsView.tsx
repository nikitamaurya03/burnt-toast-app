"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, RefreshCw, Sparkles, Palette, Shirt, Heart, Scissors } from "lucide-react";
import type { ColorAnalysisResult, ColorEntry, AvoidColor } from "@/types/colorAnalysis";
import { SwatchGrid, ColorSwatch } from "./ColorSwatches";

type Tab = "palette" | "beauty" | "styling" | "comparison";

function Section({ title, icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--paper, #fff)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--cream-soft)]"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>{title}</span>
        </div>
        {open ? <ChevronUp size={18} style={{ color: "var(--ash)" }} /> : <ChevronDown size={18} style={{ color: "var(--ash)" }} />}
      </button>
      {open && <div className="px-5 pb-5 space-y-6">{children}</div>}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg px-4 py-3" style={{ background: "var(--cream-soft)", border: "1px solid var(--line)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--ash)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--ink)", marginTop: 2 }}>{value}</span>
    </div>
  );
}

export default function ResultsView({
  result,
  onNewAnalysis,
  onDownloadPdf,
}: {
  result: ColorAnalysisResult;
  onNewAnalysis: () => void;
  onDownloadPdf: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("palette");
  const { face_attributes: fa, undertone: ut, contrast: ct, season, best_colors, neutrals, avoid_colors, beauty, styling, clothing_comparison, narrative } = result;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "palette", label: "Palette", icon: <Palette size={16} /> },
    { id: "beauty", label: "Beauty", icon: <Heart size={16} /> },
    { id: "styling", label: "Styling", icon: <Shirt size={16} /> },
    { id: "comparison", label: "Compare", icon: <Scissors size={16} /> },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Hero card — season + narrative */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--cream-soft)", border: "1px solid var(--line)" }}>
        <div className="px-6 pt-6 pb-4 text-center">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sage-deep)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            Your color season
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink)", lineHeight: 1.2 }}>
            {season.primary}
          </h2>
          {season.secondary !== season.primary && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ash)", marginTop: 4 }}>
              with {season.secondary} influences
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="rounded-full px-3 py-1" style={{ background: "var(--sage)", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
              {season.confidence}% confidence
            </div>
          </div>
        </div>

        {/* Face attributes row */}
        <div className="flex flex-wrap justify-center gap-3 px-6 pb-4">
          <InfoPill label="Undertone" value={ut.undertone} />
          <InfoPill label="Contrast" value={ct.contrast} />
          <InfoPill label="Skin" value={fa.skin_tone} />
          <InfoPill label="Eyes" value={fa.eye_color.split(" ").slice(0, 2).join(" ")} />
        </div>

        {/* Narrative */}
        <div className="px-6 pb-6">
          <div className="rounded-xl p-5" style={{ background: "var(--cream)", border: "1px solid var(--line)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} style={{ color: "var(--sage-deep)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--sage-deep)", letterSpacing: 1 }}>TOASTIE SAYS</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>
              {narrative}
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 rounded-full px-4 py-2 transition-all whitespace-nowrap"
            style={{
              background: activeTab === t.id ? "var(--ink)" : "var(--cream-soft)",
              color: activeTab === t.id ? "var(--cream)" : "var(--ash)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: 1,
              border: `1px solid ${activeTab === t.id ? "var(--ink)" : "var(--line)"}`,
            }}
          >
            {t.icon}
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "palette" && (
        <div className="space-y-6">
          <Section title="Your Best Colors" icon={<Palette size={18} style={{ color: "var(--sage-deep)" }} />}>
            <SwatchGrid colors={best_colors} title="" size="lg" showReasons />
          </Section>

          <Section title="Your Neutrals" icon={<Palette size={18} style={{ color: "var(--ash)" }} />}>
            {neutrals.best_whites?.length > 0 && (
              <SwatchGrid colors={neutrals.best_whites} title="Best Whites" size="md" />
            )}
            {neutrals.best_blacks?.length > 0 && (
              <SwatchGrid colors={neutrals.best_blacks} title="Best Darks" size="md" />
            )}
            {neutrals.business_neutrals?.length > 0 && (
              <SwatchGrid colors={neutrals.business_neutrals} title="Business Neutrals" size="md" />
            )}
            {neutrals.casual_neutrals?.length > 0 && (
              <SwatchGrid colors={neutrals.casual_neutrals} title="Casual Neutrals" size="md" />
            )}
            {neutrals.denim_recommendations?.length > 0 && (
              <div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)", marginBottom: 8 }}>Denim</h4>
                <ul className="space-y-2">
                  {neutrals.denim_recommendations.map((d, i) => (
                    <li key={i} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ash)" }}>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section title="Colors to Avoid" icon={<Palette size={18} style={{ color: "#dc2626" }} />} defaultOpen={false}>
            <SwatchGrid colors={avoid_colors} title="" showReasons />
          </Section>
        </div>
      )}

      {activeTab === "beauty" && (
        <div className="space-y-6">
          <Section title="Beauty Recommendations" icon={<Heart size={18} style={{ color: "var(--sage-deep)" }} />}>
            {beauty.lipstick?.length > 0 && <SwatchGrid colors={beauty.lipstick} title="Lipstick Shades" size="md" showReasons />}
            {beauty.blush?.length > 0 && <SwatchGrid colors={beauty.blush} title="Blush" size="md" showReasons />}
            {beauty.eyeshadow?.length > 0 && <SwatchGrid colors={beauty.eyeshadow} title="Eyeshadow" size="md" showReasons />}

            {beauty.jewelry && (
              <div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>Jewelry & Metals</h4>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ash)" }}>{beauty.jewelry}</p>
              </div>
            )}

            {beauty.frames?.length > 0 && <SwatchGrid colors={beauty.frames} title="Eyeglass Frames" size="sm" />}
            {beauty.handbags?.length > 0 && <SwatchGrid colors={beauty.handbags} title="Handbags" size="sm" />}
            {beauty.footwear?.length > 0 && <SwatchGrid colors={beauty.footwear} title="Footwear" size="sm" />}
          </Section>
        </div>
      )}

      {activeTab === "styling" && (
        <div className="space-y-4">
          {styling.map((rec) => (
            <Section
              key={rec.category}
              title={rec.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              icon={<Shirt size={18} style={{ color: "var(--sage-deep)" }} />}
              defaultOpen={false}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>{rec.description}</p>
              {rec.color_suggestions?.length > 0 && (
                <div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1, marginBottom: 6 }}>SUGGESTED COLORS</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.color_suggestions.map((c, i) => (
                      <span key={i} className="rounded-full px-3 py-1" style={{ background: "var(--cream-soft)", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink)", border: "1px solid var(--line)" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {rec.outfit_ideas?.length > 0 && (
                <div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1, marginBottom: 6 }}>OUTFIT IDEAS</p>
                  <ul className="space-y-2">
                    {rec.outfit_ideas.map((o, i) => (
                      <li key={i} className="flex items-start gap-2" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink)" }}>
                        <span style={{ color: "var(--sage-deep)" }}>-</span> {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          ))}
        </div>
      )}

      {activeTab === "comparison" && clothing_comparison && (
        <Section title="Color Comparison" icon={<Scissors size={18} style={{ color: "var(--sage-deep)" }} />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["best_match", "neutral", "avoid"] as const).map((key) => {
              const item = clothing_comparison[key];
              if (!item?.color) return null;
              const labels = { best_match: "Best Match", neutral: "Safe Neutral", avoid: "Avoid" };
              const accents = { best_match: "var(--sage)", neutral: "var(--ash)", avoid: "#dc2626" };
              return (
                <div key={key} className="rounded-xl p-4 text-center" style={{ border: "1px solid var(--line)", background: "var(--cream-soft)" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: accents[key], letterSpacing: 1, marginBottom: 8 }}>
                    {labels[key].toUpperCase()}
                  </p>
                  <div className="flex justify-center mb-3">
                    <ColorSwatch color={item.color} size="lg" />
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ash)", lineHeight: 1.5 }}>
                    {item.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onDownloadPdf}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 transition-colors"
          style={{
            background: "var(--ink)",
            color: "var(--cream)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: 1,
          }}
        >
          <Download size={16} />
          DOWNLOAD PDF
        </button>
        <button
          onClick={onNewAnalysis}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 transition-colors"
          style={{
            background: "var(--cream-soft)",
            color: "var(--ink)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: 1,
            border: "1px solid var(--line)",
          }}
        >
          <RefreshCw size={16} />
          NEW ANALYSIS
        </button>
      </div>
    </div>
  );
}
