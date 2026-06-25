"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { label: "Reading your natural coloring", icon: "🎨" },
  { label: "Mapping undertone signals", icon: "🔍" },
  { label: "Calculating contrast levels", icon: "📐" },
  { label: "Finding your seasonal palette", icon: "🌿" },
  { label: "Curating your best colors", icon: "✨" },
  { label: "Crafting beauty recommendations", icon: "💄" },
  { label: "Writing your style narrative", icon: "📝" },
];

export default function AnalysisLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8 py-12">
      {/* Spinner */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full animate-spin"
          style={{
            border: "3px solid var(--line)",
            borderTopColor: "var(--sage-deep)",
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-3xl"
          style={{ animation: "pulse 2s ease-in-out infinite" }}
        >
          {STEPS[step].icon}
        </div>
      </div>

      {/* Current step */}
      <div className="text-center">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--ink)",
            marginBottom: 8,
          }}
        >
          Analyzing your colors
        </p>
        <p
          className="transition-opacity duration-500"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--ash)",
          }}
          key={step}
        >
          {STEPS[step].label}...
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              background: i <= step ? "var(--sage)" : "var(--line)",
            }}
          />
        ))}
      </div>

      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--ash)",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        This usually takes 15-30 seconds
      </p>
    </div>
  );
}
