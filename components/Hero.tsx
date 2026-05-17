"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-16">

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">

        {/* Pre-badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-xs font-medium tracking-widest uppercase mb-10 animate-fade-in">
          <Sparkles size={12} className="text-gray-400" />
          AI-Powered Personal Styling
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold text-gray-900 leading-[1.05] tracking-tight animate-slide-up">
          Style for{" "}
          <br />
          <span className="text-gray-900">Real Moments</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Toastie builds looks that actually go hard — coffee runs,
          campus fits, nights out — all under ₹1,490. No cap.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/chat"
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-gray-900 text-white font-semibold text-sm tracking-wider uppercase hover:bg-black hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <Sparkles size={16} />
            Get Styled by Toastie
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/#collection"
            className="flex items-center gap-2 px-8 py-4 rounded-full border border-gray-300 text-gray-700 font-medium text-sm tracking-wider uppercase hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            Browse Collection
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in border-t border-gray-100 pt-12" style={{ animationDelay: "0.4s" }}>
          {[
            { label: "Styles from ₹490", value: "10+" },
            { label: "Real-Life Vibes",  value: "6" },
            { label: "Burnt Toast Fans", value: "10K+" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold font-display text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 tracking-wider uppercase mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
