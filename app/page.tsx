"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

const BT = "https://burnt-toast.com/cdn/shop/files";

/* ── Hero ─────────────────────────────────────────────────────── */
const HERO_IMG = `${BT}/2_7e21e633-64e5-4c7c-8fdb-caa38b74c3f0.png`;

/* ── Featured products (from burnt-toast.com current homepage) ── */
const FEATURED = [
  { id: "301062634", name: "Mini Printed Dress",          price: 990,  img: `${BT}/301062634PINK_1.jpg`,    hover: `${BT}/301062634PINK_2.jpg` },
  { id: "301060692", name: "Boxy-Fit Printed T-Shirt",    price: 590,  img: `${BT}/301060692BROWN_1.jpg`,   hover: `${BT}/301060692BROWN_2.jpg` },
  { id: "301062668", name: "Striped Shirred Halter Top",   price: 690,  img: `${BT}/301062668_1.jpg`,        hover: `${BT}/301062668_2.jpg` },
  { id: "301062626", name: "Striped Wide-Leg Trousers",    price: 990,  img: `${BT}/301062626_1.jpg`,        hover: `${BT}/301062626_2.jpg` },
  { id: "301063479", name: "Regular-Fit T-Shirt",          price: 590,  img: `${BT}/301063479BROWN_1.jpg`,   hover: `${BT}/301063479BROWN_2.jpg` },
  { id: "301062295", name: "Baggy Track Pants",            price: 990,  img: `${BT}/301062295BROWN_1.jpg`,   hover: `${BT}/301062295BROWN_2.jpg` },
  { id: "301062296", name: "Relaxed-Fit Shorts",           price: 990,  img: `${BT}/301062296BROWN_1.jpg`,   hover: `${BT}/301062296BROWN_2.jpg` },
  { id: "301060703", name: "Regular-Fit Printed T-Shirt",  price: 590,  img: `${BT}/301060703BLUE_1.jpg`,    hover: `${BT}/301060703BLUE_2.jpg` },
  { id: "301062664", name: "Pintuck Detailed Top",         price: 690,  img: `${BT}/301062664WHITE_1.jpg`,   hover: `${BT}/301062664WHITE_2.jpg` },
  { id: "301062627", name: "Ruffled Tiered Mini Dress",    price: 1290, img: `${BT}/301062627_1.jpg`,        hover: `${BT}/301062627_2.jpg` },
];

/* ── Category cards ───────────────────────────────────────────── */
const WOMEN_CATS = [
  { label: "Dresses",  img: `${BT}/1_c604d254-58b0-496a-8261-09be2fb6842e.png`, href: "/#collection" },
  { label: "Tops",     img: `${BT}/5_567b1d21-317d-4011-8d9b-a76a1fb1e7ae.png`, href: "/#collection" },
  { label: "Bottoms",  img: `${BT}/2_2fd45438-fe99-41c4-873a-aaa66a332878.png`, href: "/#collection" },
];
const MEN_CATS = [
  { label: "T-Shirts", img: `${BT}/4.png`,                                       href: "/#collection" },
  { label: "Bottoms",  img: `${BT}/3_26321908-d5e5-4965-b297-45bb87de45b3.png`,  href: "/#collection" },
];

/* ── Collage hero images for Shop Women / Shop Men ────────────── */
const W_COLLAGE_A = `${BT}/2_7e21e633-64e5-4c7c-8fdb-caa38b74c3f0.png`;
const W_COLLAGE_B = `${BT}/Frame_1359318957_3.png`;
const M_COLLAGE_A = `${BT}/3.png`;
const M_COLLAGE_B = `${BT}/Frame_1359318957_4.png`;

/* ── Styled by You composite images ──────────────────────────── */
const STYLED_DESKTOP = `${BT}/Container_3_02a55572-55c7-4998-a1c3-84485468f217.png`;
const STYLED_MOBILE  = `${BT}/Container_2_9d7c044b-b7ac-4814-a680-e2a14e68352e.png`;


/* ═══════════════════════════════════════════════════════════════
   HomePage
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  return (
    <>
      {/* ─── 1. HERO BANNER ──────────────────────────────────── */}
      <section className="relative w-full" style={{ paddingTop: 72, background: "var(--cream)" }}>
        <div className="relative w-full overflow-hidden" style={{ height: "clamp(320px, 56vw, 640px)" }}>
          <Image
            src={HERO_IMG}
            alt="Summer Collection — Burnt Toast"
            fill
            className="object-cover object-top"
            priority
            unoptimized
            sizes="100vw"
          />
          {/* gradient overlay for legibility */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 40%)" }} />
          <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12">
            <Link href="/#collection" className="group">
              <span
                className="transition-opacity group-hover:opacity-80"
                style={{
                  fontFamily: "var(--font-brand)",
                  fontSize: "clamp(30px, 5vw, 56px)",
                  color: "#fff",
                  textShadow: "0 2px 16px rgba(0,0,0,0.35)",
                  letterSpacing: 1,
                }}
              >
                Shop Now
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. FEATURED PRODUCTS CAROUSEL ───────────────────── */}
      <section className="py-10 sm:py-14" style={{ background: "var(--cream)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative">
          {/* Scroll arrows (desktop) */}
          <button
            onClick={() => scroll("left")}
            className="hidden sm:flex absolute -left-1 top-[35%] -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full shadow-md transition-all hover:shadow-lg"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden sm:flex absolute -right-1 top-[35%] -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full shadow-md transition-all hover:shadow-lg"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>

          {/* Horizontal scroll track */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide pb-2 px-1 sm:px-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {FEATURED.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* VIEW MORE button */}
          <div className="flex justify-center mt-8 sm:mt-10">
            <Link
              href="/#collection"
              className="px-8 py-2.5 border transition-all duration-200 hover:bg-[var(--ink)] hover:text-[var(--cream)]"
              style={{
                borderColor: "var(--ink)", color: "var(--ink)",
                fontFamily: "var(--font-body)", fontSize: 11,
                fontWeight: 500, letterSpacing: 2, textTransform: "uppercase",
              }}
            >
              VIEW MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. SHOP WOMEN ───────────────────────────────────── */}
      <section className="py-10 sm:py-16" style={{ background: "var(--cream)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          {/* Collage */}
          <div className="flex justify-center mb-8">
            <div className="relative" style={{ width: "min(360px, 72vw)", aspectRatio: "4/5" }}>
              <div
                className="absolute overflow-hidden shadow-lg"
                style={{ width: "56%", height: "82%", left: 0, top: 0, transform: "rotate(-4deg)", zIndex: 1, borderRadius: 3 }}
              >
                <Image src={W_COLLAGE_A} alt="Women's Collection" fill className="object-cover" unoptimized sizes="220px" />
              </div>
              <div
                className="absolute overflow-hidden shadow-lg"
                style={{ width: "56%", height: "82%", right: 0, bottom: 0, transform: "rotate(3deg)", zIndex: 2, borderRadius: 3 }}
              >
                <Image src={W_COLLAGE_B} alt="Women's Style" fill className="object-cover" unoptimized sizes="220px" />
              </div>
            </div>
          </div>

          <h2 className="text-center mb-8 sm:mb-10" style={{ fontSize: "clamp(24px, 4vw, 38px)", color: "var(--ink)" }}>
            <span style={{ fontFamily: "var(--font-brand)", fontSize: "1.15em", marginRight: 6 }}>Shop</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>Women</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {WOMEN_CATS.map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. SHOP MEN ─────────────────────────────────────── */}
      <section className="py-10 sm:py-16" style={{ background: "var(--cream)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          {/* Collage */}
          <div className="flex justify-center mb-8">
            <div className="relative" style={{ width: "min(360px, 72vw)", aspectRatio: "4/5" }}>
              <div
                className="absolute overflow-hidden shadow-lg"
                style={{ width: "56%", height: "82%", left: 0, top: 0, transform: "rotate(-4deg)", zIndex: 1, borderRadius: 3 }}
              >
                <Image src={M_COLLAGE_A} alt="Men's Collection" fill className="object-cover" unoptimized sizes="220px" />
              </div>
              <div
                className="absolute overflow-hidden shadow-lg"
                style={{ width: "56%", height: "82%", right: 0, bottom: 0, transform: "rotate(3deg)", zIndex: 2, borderRadius: 3 }}
              >
                <Image src={M_COLLAGE_B} alt="Men's Style" fill className="object-cover" unoptimized sizes="220px" />
              </div>
            </div>
          </div>

          <h2 className="text-center mb-8 sm:mb-10" style={{ fontSize: "clamp(24px, 4vw, 38px)", color: "var(--ink)" }}>
            <span style={{ fontFamily: "var(--font-brand)", fontSize: "1.15em", marginRight: 6 }}>Shop</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>Men</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
            {MEN_CATS.map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. STYLED BY YOU ────────────────────────────────── */}
      <section className="py-10 sm:py-14" style={{ background: "var(--cream)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{
              fontFamily: "var(--font-body)", fontSize: 15,
              fontWeight: 500, color: "var(--ink)", letterSpacing: 0.3,
            }}>
              Styled by You
            </h2>
            <a
              href="https://www.instagram.com/burnttoastofficial/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-body)", fontSize: 13,
                color: "var(--ink)", textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Follow Us
            </a>
          </div>
          {/* Desktop */}
          <div className="hidden sm:block relative w-full">
            <Image
              src={STYLED_DESKTOP}
              alt="Styled by You — community looks"
              width={1400}
              height={500}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
          {/* Mobile */}
          <div className="block sm:hidden relative w-full">
            <Image
              src={STYLED_MOBILE}
              alt="Styled by You — community looks"
              width={600}
              height={1100}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ─── 6. ABOUT US ─────────────────────────────────────── */}
      <section className="py-14 sm:py-20" style={{ background: "var(--cream)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2
            className="mb-5"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 4vw, 32px)", color: "var(--ink)" }}
          >
            About Us
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.85, color: "var(--ink-soft)" }}>
            Burnt Toast — a clothing brand from Thrift ltd., is inspired by the idea that sometimes
            the most extraordinary things emerge from the unexpected.
          </p>
          <p className="mt-3" style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.85, color: "var(--ink-soft)" }}>
            Blending contemporary trends with effortless ease, we have created pieces that move
            seamlessly from casual hangouts to more curated moments…{" "}
            <a
              href="#"
              className="underline"
              style={{ color: "var(--ink)", textUnderlineOffset: 3, fontWeight: 500 }}
            >
              read more
            </a>
          </p>
        </div>
      </section>

      {/* ─── 7. FOOTER ───────────────────────────────────────── */}
      <footer style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
            {/* Brand + Social icons */}
            <div>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 700,
                color: "var(--ink)", letterSpacing: 2, textTransform: "uppercase",
              }}>
                BURNT TOAST
              </p>
              <div className="flex items-center gap-4 mt-4">
                {/* Facebook */}
                <a href="#" className="transition-opacity hover:opacity-60" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/burnttoastofficial/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" className="transition-opacity hover:opacity-60" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
                {/* Pinterest */}
                <a href="#" className="transition-opacity hover:opacity-60" aria-label="Pinterest">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 12a4 4 0 1 1 8 0c0 2.5-1.5 4.5-3 6l-1 4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Footer links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 sm:gap-x-14 gap-y-3">
              {[
                { label: "Our Story",        href: "#" },
                { label: "Shop Men",          href: "/#collection" },
                { label: "FAQs",              href: "#" },
                { label: "Privacy Policy",    href: "#" },
                { label: "Store Locator",     href: "#" },
                { label: "Shop Women",        href: "/#collection" },
                { label: "Contact Us",        href: "#" },
                { label: "Terms of Service",  href: "#" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="transition-opacity hover:opacity-60"
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 13,
                    color: "var(--ink)", textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright bar */}
          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ash)", letterSpacing: 0.5 }}>
              © 2025 BURNT TOAST · ALL RIGHT RESERVED
            </p>
            <a
              href="#"
              className="underline"
              style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink)", textUnderlineOffset: 3 }}
            >
              Manage Cookie Settings
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}


/* ═══════════════════════════════════════════════════════════════
   Product Card — horizontal carousel item with hover image swap
   ═══════════════════════════════════════════════════════════════ */
function ProductCard({ product }: { product: (typeof FEATURED)[number] }) {
  const [hovered, setHovered] = useState(false);
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      id: product.id,
      name: product.name,
      brand: "Burnt Toast",
      price: product.price,
      image: product.img,
      category: "",
      tags: [],
      rating: 0,
      reviews: 0,
      sizes: [],
      description: "",
    });
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="flex-shrink-0 group"
      style={{ width: 165, scrollSnapAlign: "start" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "3/4", background: "var(--cream-deep)", borderRadius: 2 }}
      >
        <Image
          src={hovered ? product.hover : product.img}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-300"
          unoptimized
          sizes="165px"
        />
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all"
          style={{ background: "rgba(255,255,255,0.88)" }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={14}
            fill={wishlisted ? "var(--burnt)" : "none"}
            stroke={wishlisted ? "var(--burnt)" : "var(--ink)"}
            strokeWidth={1.5}
          />
        </button>
      </div>
      <p
        className="mt-2.5"
        style={{
          fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 400,
          color: "var(--ink)", textTransform: "uppercase",
          letterSpacing: 0.5, lineHeight: 1.35,
        }}
      >
        {product.name}
      </p>
      <p
        className="mt-0.5"
        style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, color: "var(--ink)" }}
      >
        ₹ {product.price.toLocaleString("en-IN")}
      </p>
    </Link>
  );
}


/* ═══════════════════════════════════════════════════════════════
   Category Card — Shop Dresses / Tops / Bottoms / T-Shirts
   ═══════════════════════════════════════════════════════════════ */
function CategoryCard({ label, img, href }: { label: string; img: string; href: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden"
      style={{ aspectRatio: "3/4", display: "block", borderRadius: 2 }}
    >
      <Image
        src={img}
        alt={label}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        unoptimized
        sizes="(max-width: 640px) 100vw, 33vw"
      />
      <div
        className="absolute bottom-0 left-0 right-0 p-4 sm:p-5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
      >
        <p className="text-white" style={{ fontSize: "clamp(16px, 2.5vw, 22px)" }}>
          <span style={{ fontFamily: "var(--font-brand)", fontSize: "1.1em", marginRight: 4 }}>Shop</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}>{label}</span>
        </p>
      </div>
    </Link>
  );
}
