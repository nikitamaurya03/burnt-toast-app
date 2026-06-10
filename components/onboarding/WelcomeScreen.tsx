"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  onContinue: (name: string) => void;
}

export default function WelcomeScreen({ onContinue }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onContinue(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      style={{ background: "var(--cream)" }}
    >
      {/* Decorative floating sparkles */}
      <motion.span
        className="absolute top-[15%] left-[12%] text-2xl select-none"
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ✦
      </motion.span>
      <motion.span
        className="absolute top-[20%] right-[15%] text-lg select-none"
        animate={{ y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      >
        ✦
      </motion.span>
      <motion.span
        className="absolute bottom-[25%] left-[20%] text-xl select-none"
        animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      >
        ✦
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
            alt="Burnt Toast"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            style={{ width: "auto" }}
            unoptimized
          />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 sm:p-10 text-center"
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            boxShadow: "0 4px 24px rgba(26,26,26,0.06), 0 1px 4px rgba(26,26,26,0.04)",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--cream-soft)" }}
            >
              <Sparkles size={24} style={{ color: "var(--sage-deep)" }} />
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              color: "var(--ink)",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            Meet <em>Toastie</em>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--ash)",
              lineHeight: 1.7,
              maxWidth: 320,
              margin: "0 auto 28px",
            }}
          >
            Your personal AI stylist. Get outfit recommendations
            tailored to your style, body shape and preferences.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: 2,
                color: "var(--ash)",
                textTransform: "uppercase",
                display: "block",
                textAlign: "left",
                marginBottom: 8,
              }}
            >
              What should Toastie call you?
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
              style={{
                fontFamily: "var(--font-body)",
                background: "var(--cream-soft)",
                border: "1.5px solid var(--line)",
                color: "var(--ink)",
                fontSize: 15,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--sage)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
            />

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full mt-5 py-3.5 rounded-xl font-medium transition-all duration-200"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 0.5,
                background: name.trim() ? "var(--ink)" : "var(--cream-deep)",
                color: name.trim() ? "var(--cream)" : "var(--ash)",
                cursor: name.trim() ? "pointer" : "not-allowed",
              }}
            >
              Continue
            </button>
          </form>
        </div>

        {/* Footer text */}
        <p
          className="text-center mt-5"
          style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ash)" }}
        >
          No sign-up needed. Everything stays on your device.
        </p>
      </motion.div>
    </div>
  );
}
