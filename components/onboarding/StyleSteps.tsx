"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

/* ── Step Definitions ─────────────────────────────────────────── */
interface StepOption {
  value: string;
  label: string;
  visual?: string;   // emoji, color swatch, or icon hint
  color?: string;     // for color chips
}

interface StepDef {
  key: string;
  question: string;
  multiSelect: boolean;
  allowSkip: boolean;
  type: "image-card" | "color-chip" | "illustrated" | "silhouette" | "tag";
  options: StepOption[];
}

const STEPS: StepDef[] = [
  {
    key: "preferredStyles",
    question: "Which styles feel most like you?",
    multiSelect: true,
    allowSkip: false,
    type: "image-card",
    options: [
      { value: "minimal",    label: "Minimal",     visual: "🤍" },
      { value: "casual",     label: "Casual",      visual: "☕" },
      { value: "streetwear", label: "Streetwear",   visual: "🔥" },
      { value: "old-money",  label: "Old Money",    visual: "🥂" },
      { value: "korean",     label: "Korean",       visual: "🌸" },
      { value: "trendy",     label: "Trendy",       visual: "✨" },
    ],
  },
  {
    key: "favoriteColors",
    question: "Which colors dominate your wardrobe?",
    multiSelect: true,
    allowSkip: false,
    type: "color-chip",
    options: [
      { value: "black",       label: "Black",        color: "#1A1A1A" },
      { value: "white",       label: "White",        color: "#FAFAFA" },
      { value: "beige",       label: "Beige",        color: "#D4C5A9" },
      { value: "earthy",      label: "Earthy Tones", color: "#8B7355" },
      { value: "pop-colors",  label: "Pop Colors",   color: "linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #A06CD5)" },
    ],
  },
  {
    key: "skinTone",
    question: "Which skin tone is closest to yours?",
    multiSelect: false,
    allowSkip: false,
    type: "illustrated",
    options: [
      { value: "very-light", label: "Very Light", color: "#FDEBD0" },
      { value: "light",      label: "Light",      color: "#F5CBA7" },
      { value: "medium",     label: "Medium",     color: "#D4A574" },
      { value: "tan",        label: "Tan",        color: "#BA8A5E" },
      { value: "deep",       label: "Deep",       color: "#8B6914" },
      { value: "rich-deep",  label: "Rich Deep",  color: "#5C4033" },
    ],
  },
  {
    key: "bodyShape",
    question: "Which body shape looks closest to yours?",
    multiSelect: false,
    allowSkip: true,
    type: "silhouette",
    options: [
      { value: "pear",              label: "Pear",              visual: "🍐" },
      { value: "apple",             label: "Apple",             visual: "🍎" },
      { value: "rectangle",         label: "Rectangle",         visual: "▬" },
      { value: "hourglass",         label: "Hourglass",         visual: "⏳" },
      { value: "inverted-triangle", label: "Inverted Triangle", visual: "🔻" },
      { value: "not-sure",          label: "Not Sure",          visual: "🤷" },
    ],
  },
  {
    key: "stylingNeeds",
    question: "Where do you need styling help most?",
    multiSelect: true,
    allowSkip: false,
    type: "tag",
    options: [
      { value: "everyday",  label: "Everyday Looks",    visual: "☀️" },
      { value: "casual",    label: "Casual Looks",      visual: "🧢" },
      { value: "vacation",  label: "Vacation Styling",  visual: "🌴" },
      { value: "party",     label: "Party Looks",       visual: "🎉" },
      { value: "travel",    label: "Travel Looks",      visual: "✈️" },
    ],
  },
];

/* ── Types ────────────────────────────────────────────────────── */
export interface OnboardingData {
  preferredStyles: string[];
  favoriteColors: string[];
  skinTone: string;
  bodyShape: string;
  stylingNeeds: string[];
}

interface Props {
  name: string;
  onComplete: (data: OnboardingData) => void;
  onSkipAll: () => void;
}

/* ── Animation Variants ──────────────────────────────────────── */
const pageVariants = {
  enter:  { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -60 },
};

/* ═══════════════════════════════════════════════════════════════
   StyleSteps Component
   ═══════════════════════════════════════════════════════════════ */
export default function StyleSteps({ name, onComplete, onSkipAll }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({
    preferredStyles: [],
    favoriteColors: [],
    skinTone: [],
    bodyShape: [],
    stylingNeeds: [],
  });

  const step = STEPS[stepIdx];
  const selected = answers[step.key] || [];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const toggle = (value: string) => {
    setAnswers((prev) => {
      const current = prev[step.key] || [];
      if (step.multiSelect) {
        return {
          ...prev,
          [step.key]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      }
      return { ...prev, [step.key]: [value] };
    });
  };

  const canProceed = selected.length > 0;

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      onComplete({
        preferredStyles: answers.preferredStyles,
        favoriteColors: answers.favoriteColors,
        skinTone: answers.skinTone[0] || "",
        bodyShape: answers.bodyShape[0] || "not-sure",
        stylingNeeds: answers.stylingNeeds,
      });
    }
  };

  const goBack = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  const skipStep = () => {
    if (step.key === "bodyShape") {
      setAnswers((prev) => ({ ...prev, bodyShape: ["not-sure"] }));
    }
    goNext();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "var(--cream)" }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <button
          onClick={goBack}
          className="p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
          style={{ visibility: stepIdx > 0 ? "visible" : "hidden" }}
          aria-label="Back"
        >
          <ArrowLeft size={18} stroke="var(--ink)" />
        </button>

        <div className="text-center">
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            letterSpacing: 2, color: "var(--ash)", textTransform: "uppercase",
          }}>
            Step {stepIdx + 1} of {STEPS.length}
          </p>
        </div>

        <button
          onClick={onSkipAll}
          className="p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
          aria-label="Skip onboarding"
        >
          <X size={18} stroke="var(--ash)" />
        </button>
      </div>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div className="px-5 mb-6">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: "var(--cream-deep)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--sage-deep)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* ── Step title ──────────────────────────────────────── */}
      <div className="px-6 mb-2 text-center">
        {stepIdx === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3"
          >
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(24px, 5vw, 32px)",
              color: "var(--ink)", lineHeight: 1.2,
            }}>
              Let&apos;s Find Your Style
            </h1>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 13,
              color: "var(--ash)", marginTop: 6,
            }}>
              This takes less than 30 seconds.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Step content ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg mx-auto"
          >
            {/* Question */}
            <h2
              className="text-center mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 4vw, 26px)",
                color: "var(--ink)", lineHeight: 1.25,
              }}
            >
              {step.question}
            </h2>

            {step.multiSelect && (
              <p
                className="text-center -mt-3 mb-5"
                style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ash)" }}
              >
                Select all that apply
              </p>
            )}

            {/* Options grid */}
            <div
              className={
                step.type === "color-chip"
                  ? "flex flex-wrap justify-center gap-3"
                  : step.type === "illustrated"
                  ? "grid grid-cols-3 gap-3"
                  : "grid grid-cols-2 sm:grid-cols-3 gap-3"
              }
            >
              {step.options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    type={step.type}
                    isSelected={isSelected}
                    onClick={() => toggle(opt.value)}
                  />
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 py-4 flex items-center justify-between"
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--line)",
        }}
      >
        {step.allowSkip ? (
          <button
            onClick={skipStep}
            style={{
              fontFamily: "var(--font-body)", fontSize: 13,
              color: "var(--ash)", textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Skip
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={canProceed ? goNext : undefined}
          disabled={!canProceed}
          className="flex items-center gap-2 px-7 py-3 rounded-full transition-all duration-200"
          style={{
            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
            background: canProceed ? "var(--ink)" : "var(--cream-deep)",
            color: canProceed ? "var(--cream)" : "var(--ash)",
            cursor: canProceed ? "pointer" : "not-allowed",
          }}
        >
          {stepIdx === STEPS.length - 1 ? "Finish" : "Next"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OptionCard — renders a single selectable option
   ═══════════════════════════════════════════════════════════════ */
function OptionCard({
  option,
  type,
  isSelected,
  onClick,
}: {
  option: StepOption;
  type: StepDef["type"];
  isSelected: boolean;
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: isSelected ? "2px solid var(--sage-deep)" : "2px solid var(--line)",
    background: isSelected ? "var(--cream-soft)" : "var(--paper)",
    borderRadius: 14,
  };

  /* ── Color chip ────────────────────────────────────────────── */
  if (type === "color-chip") {
    const isGradient = option.color?.startsWith("linear");
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-2 p-3 w-[72px]" style={base}>
        <div
          className="w-10 h-10 rounded-full border"
          style={{
            background: option.color,
            borderColor: option.value === "white" ? "var(--line)" : "transparent",
            boxShadow: isSelected ? "0 0 0 3px var(--sage)" : "none",
            ...(isGradient ? { background: option.color } : {}),
          }}
        />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--ink)", fontWeight: isSelected ? 600 : 400 }}>
          {option.label}
        </span>
      </button>
    );
  }

  /* ── Skin tone (illustrated) ───────────────────────────────── */
  if (type === "illustrated") {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-2 p-3" style={base}>
        <div
          className="w-12 h-12 rounded-full"
          style={{
            background: option.color,
            boxShadow: isSelected ? "0 0 0 3px var(--sage)" : "none",
          }}
        />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink)", fontWeight: isSelected ? 600 : 400 }}>
          {option.label}
        </span>
      </button>
    );
  }

  /* ── Default: image-card / silhouette / tag ────────────────── */
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-4"
      style={{
        ...base,
        minHeight: 90,
        transform: isSelected ? "scale(1.03)" : "scale(1)",
      }}
    >
      <span className="text-2xl select-none">{option.visual}</span>
      <span style={{
        fontFamily: "var(--font-body)", fontSize: 12,
        color: "var(--ink)", fontWeight: isSelected ? 600 : 400,
        lineHeight: 1.2, textAlign: "center",
      }}>
        {option.label}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: "var(--sage-deep)" }}
        >
          <span className="text-white text-[10px]">✓</span>
        </motion.div>
      )}
    </button>
  );
}
