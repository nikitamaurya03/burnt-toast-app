"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12 px-4 sm:px-8"
      style={{ background: "var(--cream)" }}
    >
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* LEFT — copy */}
        <div className="flex flex-col gap-5 animate-slide-up">
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)",
            letterSpacing: 4, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            YOUR AI STYLIST <span style={{ color: "var(--ink)", fontSize: 12 }}>✦</span>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            fontSize: "clamp(54px, 8vw, 100px)",
            lineHeight: 0.94,
            fontWeight: 400,
            letterSpacing: -1.5,
          }}>
            Style<br />
            that feels<br />
            <em style={{ fontStyle: "italic" }}>like you.</em>
          </h1>

          <svg width="200" height="14" viewBox="0 0 200 14" style={{ marginTop: -8 }}>
            <path d="M2 8 Q40 2, 100 6 T198 5" stroke="var(--ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M5 11 Q70 7, 140 9" stroke="var(--ink)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          </svg>

          <p style={{
            color: "var(--ash)", fontSize: 15, lineHeight: 1.7,
            maxWidth: 440, fontFamily: "var(--font-body)", marginTop: 4,
          }}>
            Tell Toastie your vibe, occasion or budget —
            get a full shoppable look in seconds.
          </p>

          <div style={{
            fontFamily: "var(--font-brand)", color: "var(--ink)",
            fontSize: 26, transform: "rotate(-1deg)",
            display: "flex", alignItems: "center", gap: 12, marginTop: 8,
          }}>
            Styled around you. Always.
            <span style={{ fontSize: 18, color: "var(--ash)" }}>♡</span>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/chat"
              className="group flex items-center gap-3 px-7 py-3.5 rounded-full transition-all"
              style={{
                background: "var(--ink)", color: "var(--cream)",
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: 2, fontWeight: 500,
              }}
            >
              ASK TOASTIE
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/#collection"
              className="flex items-center px-7 py-3.5 rounded-full transition-all"
              style={{
                background: "transparent",
                border: "1px solid var(--ink)", color: "var(--ink)",
                fontFamily: "var(--font-mono)", fontSize: 11,
                letterSpacing: 2, fontWeight: 500,
              }}
            >
              BROWSE COLLECTION
            </Link>
          </div>
        </div>

        {/* RIGHT — polaroid collage */}
        <div className="relative animate-fade-in" style={{ minHeight: 480, paddingRight: 20 }}>

          {/* Main polaroid (model) */}
          <div className="polaroid" style={{
            position: "absolute",
            width: "60%", aspectRatio: "3/4",
            left: "8%", top: "6%",
            transform: "rotate(-3deg)",
            zIndex: 2,
          }}>
            <div style={{
              width: "100%", height: "100%",
              backgroundImage: "url('https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80')",
              backgroundSize: "cover", backgroundPosition: "center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "12px 14px",
                background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                color: "#fff", fontFamily: "var(--font-mono)",
              }}>
                <div style={{ fontSize: 14, letterSpacing: 3, fontWeight: 500 }}>DOWNTOWN</div>
                <div style={{ fontSize: 8, opacity: 0.85, marginTop: 3, letterSpacing: 2 }}>MINIMAL · COOL · ELEVATED</div>
              </div>
            </div>
          </div>

          {/* Bag polaroid */}
          <div className="polaroid" style={{
            position: "absolute",
            width: "26%", aspectRatio: "3/4",
            left: "-3%", bottom: "12%",
            transform: "rotate(-8deg)",
            zIndex: 1,
          }}>
            <div style={{
              width: "100%", height: "100%",
              backgroundImage: "url('https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80')",
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
          </div>

          {/* Tag note */}
          <div className="polaroid" style={{
            position: "absolute",
            width: "30%", padding: "16px 14px 18px",
            right: "0%", top: "10%",
            transform: "rotate(4deg)",
            zIndex: 3,
            background: "#FFFEF5",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", lineHeight: 2.1 }}>
              minimal<br />
              downtown<br />
              clean girl<br />
              soft grunge<br />
              elevated basics
            </div>
          </div>

          {/* Shoes polaroid */}
          <div className="polaroid" style={{
            position: "absolute",
            width: "28%", aspectRatio: "1/1",
            right: "4%", bottom: "4%",
            transform: "rotate(6deg)",
            zIndex: 2,
          }}>
            <div style={{
              width: "100%", height: "100%",
              backgroundImage: "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80')",
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
          </div>

          {/* Sage BT APPROVED stamp */}
          <div style={{
            position: "absolute", right: "30%", bottom: "2%",
            width: 88, height: 88, borderRadius: "50%",
            background: "var(--sage)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: "rotate(-10deg)", zIndex: 4,
            boxShadow: "0 4px 16px rgba(116, 139, 106, 0.3)",
          }}>
            <div style={{ textAlign: "center", color: "var(--ink)" }}>
              <div style={{ fontFamily: "var(--font-brand)", fontSize: 26, lineHeight: 0.9 }}>BT</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: 1.5, marginTop: 2, fontWeight: 500 }}>APPROVED</div>
            </div>
          </div>

          {/* Sparkle accents */}
          <span style={{ position: "absolute", left: "6%", top: "0%", fontSize: 20, color: "var(--ink)", zIndex: 5 }}>✦</span>
          <span style={{ position: "absolute", right: "2%", top: "2%", fontSize: 16, color: "var(--ink)", zIndex: 5 }}>✦</span>
        </div>
      </div>
    </section>
  );
}
