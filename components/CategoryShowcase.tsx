"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CDN = "https://cdn.shopify.com/s/files/1/0626/4890/9886/files";

const CATEGORY_CARDS = [
  {
    title: "Tops",
    emoji: "👚",
    count: "17 styles",
    bg: "#F8F4FF",
    accent: "#7C3AED",
    img: `${CDN}/301060679WHITE_1.jpg`,
    href: "/#collection",
    description: "Fitted tees, knits & cropped tops",
  },
  {
    title: "Bottoms",
    emoji: "👖",
    count: "12 styles",
    bg: "#FFF7ED",
    accent: "#EA580C",
    img: `${CDN}/301064620PINK_1.jpg`,
    href: "/#collection",
    description: "Wide-leg pants, skirts & denims",
  },
  {
    title: "Dresses",
    emoji: "👗",
    count: "6 styles",
    bg: "#FFF1F2",
    accent: "#E11D48",
    img: `${CDN}/301062644KHAKHI_1.jpg`,
    href: "/#collection",
    description: "Mini dresses for every occasion",
  },
  {
    title: "Footwear",
    emoji: "👟",
    count: "17 styles",
    bg: "#F0FDF4",
    accent: "#16A34A",
    img: `${CDN}/301055054_1.jpg`,
    href: "/#collection",
    description: "Sandals, sneakers & loafers",
  },
];

export default function CategoryShowcase() {
  function scrollToCollection(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mb-2">
            Shop by Category
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
            What are you looking for?
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
            Browse the full Spring 26 collection — from statement tops to must-have footwear.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {CATEGORY_CARDS.map(({ title, emoji, count, bg, accent, img, description }) => (
            <a
              key={title}
              href="/#collection"
              onClick={scrollToCollection}
              className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100"
              style={{ background: bg }}
            >
              {/* Product image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={img}
                  alt={title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Bottom text */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{emoji}</span>
                    <span
                      className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full"
                      style={{ background: accent + "33", color: "#fff" }}
                    >
                      {count}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight">{title}</h3>
                  <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{description}</p>
                </div>
              </div>

              {/* Arrow hint */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm">
                <ArrowRight size={12} style={{ color: accent }} />
              </div>
            </a>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mb-3">
            Your Personal Stylist
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Not sure what to wear?
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">
            Drop your occasion, mood, or vibe to Toastie — it builds a full look that slaps in seconds. No cap, bestie.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-900 text-white font-semibold text-sm tracking-wider uppercase hover:bg-black hover:scale-105 transition-all duration-300 shadow-md"
          >
            Let Toastie Cook
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
