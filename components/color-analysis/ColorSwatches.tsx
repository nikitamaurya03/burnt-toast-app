"use client";

import type { ColorEntry, AvoidColor } from "@/types/colorAnalysis";

function parseRgb(rgb: string | { r: number; g: number; b: number }): string {
  if (typeof rgb === "string") return rgb;
  return `${rgb.r},${rgb.g},${rgb.b}`;
}

export function ColorSwatch({
  color,
  size = "md",
  showLabel = true,
  showReason,
}: {
  color: ColorEntry | AvoidColor;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showReason?: boolean;
}) {
  const dims = { sm: 40, md: 56, lg: 72 }[size];
  const reason = "reason" in color ? color.reason : ("why_it_works" in color ? color.why_it_works : undefined);

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ maxWidth: dims + 24 }}>
      <div
        className="rounded-lg shadow-sm border"
        style={{
          width: dims,
          height: dims,
          backgroundColor: color.hex,
          borderColor: "var(--line)",
        }}
      />
      {showLabel && (
        <span
          className="text-center leading-tight"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--ash)",
            letterSpacing: 0.5,
          }}
        >
          {color.name}
        </span>
      )}
      {showReason && reason && (
        <span
          className="text-center leading-tight"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 10,
            color: "var(--ash)",
            maxWidth: 120,
          }}
        >
          {reason}
        </span>
      )}
    </div>
  );
}

export function SwatchGrid({
  colors,
  title,
  subtitle,
  size = "md",
  showReasons = false,
}: {
  colors: (ColorEntry | AvoidColor)[];
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  showReasons?: boolean;
}) {
  if (!colors || colors.length === 0) return null;

  return (
    <div>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          color: "var(--ink)",
          marginBottom: 4,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ash)",
            letterSpacing: 1,
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>
      )}
      <div className="flex flex-wrap gap-4">
        {colors.map((c, i) => (
          <ColorSwatch key={`${c.hex}-${i}`} color={c} size={size} showReason={showReasons} />
        ))}
      </div>
    </div>
  );
}
