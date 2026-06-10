"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

interface Props {
  name: string;
  styleIdentity: string;
  colorPersonality: string;
  stylingDirection: string;
  onStart: () => void;
}

/* ── Floating style tags for the loading animation ───────────── */
const FLOATING_TAGS = [
  "minimal", "clean girl", "neutral palette", "elevated basics",
  "streetwear", "smart casual", "Korean", "old money",
  "vacation", "date night", "campus", "party",
];

/* ═══════════════════════════════════════════════════════════════
   IdentityReveal — Loading screen → Identity card
   ═══════════════════════════════════════════════════════════════ */
export default function IdentityReveal({
  name,
  styleIdentity,
  colorPersonality,
  stylingDirection,
  onStart,
}: Props) {
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("reveal"), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      style={{ background: "var(--cream)" }}
    >
      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <LoadingPhase key="loading" />
        ) : (
          <RevealPhase
            key="reveal"
            name={name}
            styleIdentity={styleIdentity}
            colorPersonality={colorPersonality}
            stylingDirection={stylingDirection}
            onStart={onStart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Loading Phase ───────────────────────────────────────────── */
function LoadingPhase() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      {/* Floating tags */}
      <div className="relative w-64 h-48 mx-auto mb-8">
        {FLOATING_TAGS.map((tag, i) => (
          <motion.span
            key={tag}
            className="absolute px-3 py-1.5 rounded-full text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: 0.5,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              color: "var(--ink-soft)",
              left: `${(i % 4) * 25}%`,
              top: `${Math.floor(i / 4) * 33}%`,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 2 + (i % 3) * 0.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Spinner ring */}
      <div className="flex justify-center mb-6">
        <motion.div
          className="w-10 h-10 rounded-full"
          style={{ border: "2.5px solid var(--line)", borderTopColor: "var(--sage-deep)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(22px, 5vw, 30px)",
        color: "var(--ink)", lineHeight: 1.2,
      }}>
        Creating Your Style Identity...
      </h2>

      <p style={{
        fontFamily: "var(--font-body)", fontSize: 13,
        color: "var(--ash)", marginTop: 8,
      }}>
        Analyzing your preferences
      </p>
    </motion.div>
  );
}

/* ── Reveal Phase ────────────────────────────────────────────── */
function RevealPhase({
  name,
  styleIdentity,
  colorPersonality,
  stylingDirection,
  onStart,
}: Omit<Props, "">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
          alt="Burnt Toast"
          width={100}
          height={34}
          className="h-8 w-auto object-contain"
          style={{ width: "auto" }}
          unoptimized
        />
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-7 sm:p-9 text-center"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          boxShadow: "0 8px 32px rgba(26,26,26,0.08), 0 2px 8px rgba(26,26,26,0.04)",
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-5"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "var(--sage)", boxShadow: "0 4px 16px rgba(116,139,106,0.3)" }}
          >
            <Sparkles size={28} style={{ color: "var(--ink)" }} />
          </div>
        </motion.div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 26, color: "var(--ink)", lineHeight: 1.15, marginBottom: 4,
        }}>
          Your Style Identity Is Ready
        </h1>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: 13,
          color: "var(--ash)", marginBottom: 24,
        }}>
          Hey {name}, here&apos;s what Toastie learned about you.
        </p>

        {/* Identity rows */}
        <div className="space-y-4 text-left mb-6">
          <IdentityRow label="Style Identity" value={styleIdentity} delay={0.3} />
          <IdentityRow label="Color Personality" value={colorPersonality} delay={0.45} />
          <IdentityRow label="Styling Direction" value={stylingDirection} delay={0.6} />
        </div>

        {/* AI summary */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-7"
          style={{
            fontFamily: "var(--font-body)", fontSize: 13,
            color: "var(--ash)", lineHeight: 1.7,
            padding: "14px 16px",
            background: "var(--cream-soft)",
            borderRadius: 12,
            borderLeft: "3px solid var(--sage)",
          }}
        >
          Toastie now understands your style preferences and will personalize
          recommendations based on your aesthetic, body shape and wardrobe preferences.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90"
          style={{
            fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600,
            background: "var(--ink)", color: "var(--cream)",
            letterSpacing: 0.3,
          }}
        >
          Start Styling
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Identity Row ────────────────────────────────────────────── */
function IdentityRow({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: "var(--cream-soft)" }}
    >
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9,
        letterSpacing: 2, color: "var(--ash)", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontSize: 16,
        color: "var(--ink)", fontStyle: "italic",
      }}>
        {value}
      </span>
    </motion.div>
  );
}
