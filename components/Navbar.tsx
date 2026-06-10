"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToastieUser } from "@/context/ToastieUserContext";

const HIDE_ON = ["/chat"];

const WOMEN_LINKS = [
  { label: "Dresses", href: "/#collection" },
  { label: "Tops", href: "/#collection" },
  { label: "Bottoms", href: "/#collection" },
  { label: "View All", href: "/#collection" },
];

const MEN_LINKS = [
  { label: "T-Shirts", href: "/#collection" },
  { label: "Bottoms", href: "/#collection" },
  { label: "View All", href: "/#collection" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user: toastieUser } = useToastieUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [womenOpen, setWomenOpen] = useState(false);
  const [menOpen, setMenOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (HIDE_ON.some((p) => pathname === p) || pathname.startsWith("/product/")) {
    return null;
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "var(--cream)",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <nav
        className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between transition-all duration-300"
        style={{ height: scrolled ? 56 : 72 }}
      >
        {/* ── Left: Desktop dropdowns / Mobile hamburger ──────── */}
        <div className="flex items-center gap-5 min-w-[100px] sm:min-w-[140px]">
          <div className="hidden md:flex items-center gap-5">
            {/* WOMEN */}
            <div
              className="relative"
              onMouseEnter={() => setWomenOpen(true)}
              onMouseLeave={() => setWomenOpen(false)}
            >
              <button
                className="flex items-center gap-1 py-2"
                style={{
                  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
                  color: "var(--ink)", letterSpacing: 0.8, textTransform: "uppercase",
                }}
              >
                WOMEN <ChevronDown size={12} style={{ marginTop: 1 }} />
              </button>
              {womenOpen && (
                <div
                  className="absolute top-full left-0 mt-1 py-2 min-w-[160px] rounded-md shadow-lg animate-fade-in"
                  style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
                >
                  {WOMEN_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="block px-4 py-2 text-sm transition-colors"
                      style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream-soft)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* MEN */}
            <div
              className="relative"
              onMouseEnter={() => setMenOpen(true)}
              onMouseLeave={() => setMenOpen(false)}
            >
              <button
                className="flex items-center gap-1 py-2"
                style={{
                  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
                  color: "var(--ink)", letterSpacing: 0.8, textTransform: "uppercase",
                }}
              >
                MEN <ChevronDown size={12} style={{ marginTop: 1 }} />
              </button>
              {menOpen && (
                <div
                  className="absolute top-full left-0 mt-1 py-2 min-w-[140px] rounded-md shadow-lg animate-fade-in"
                  style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
                >
                  {MEN_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="block px-4 py-2 text-sm transition-colors"
                      style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream-soft)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 -ml-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} stroke="var(--ink)" /> : <Menu size={20} stroke="var(--ink)" />}
          </button>
        </div>

        {/* ── Center: Logo + Ask Toastie ─────────────────────── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Image
              src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
              alt="Burnt Toast"
              width={130}
              height={42}
              className="h-8 sm:h-10 w-auto object-contain"
              style={{ width: "auto" }}
              priority
              unoptimized
            />
          </Link>
          <Link
            href="/chat"
            className="hidden sm:flex flex-col items-center"
            style={{ textDecoration: "none", marginTop: 1 }}
          >
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: 13, color: "var(--ink)", lineHeight: 1,
            }}>
              Ask Toastie
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 7, color: "var(--ash)",
              letterSpacing: 2, marginTop: 2, fontWeight: 500,
            }}>
              YOUR PERSONAL AI STYLIST
            </span>
          </Link>
        </div>

        {/* ── Right: Icon cluster ────────────────────────────── */}
        <div className="flex items-center gap-0.5 sm:gap-1 min-w-[100px] sm:min-w-[140px] justify-end">
          <Link
            href="/#collection"
            className="p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
            aria-label="Search"
          >
            <Search size={18} stroke="var(--ink)" strokeWidth={1.5} />
          </Link>
          <Link
            href={toastieUser?.onboardingCompleted ? "/profile" : "/chat"}
            className="hidden sm:flex p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]"
            aria-label={toastieUser?.onboardingCompleted ? "Style Profile" : "Ask Toastie"}
          >
            {toastieUser?.onboardingCompleted ? (
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 20, height: 20,
                  background: "var(--sage)",
                  fontFamily: "var(--font-brand)",
                  fontSize: 11, color: "var(--ink)",
                  lineHeight: 1,
                }}
              >
                {toastieUser.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={18} stroke="var(--ink)" strokeWidth={1.5} />
            )}
          </Link>
          <Link href="/wishlist" className="relative p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]">
            <Heart
              size={18}
              fill={wishlistCount > 0 ? "var(--burnt)" : "none"}
              stroke="var(--ink)"
              strokeWidth={1.5}
            />
            {wishlistCount > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2,
                background: "var(--burnt)", color: "#fff",
                fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700,
                borderRadius: "50%", width: 14, height: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2 rounded-full transition-colors hover:bg-[var(--cream-deep)]">
            <ShoppingBag size={18} stroke="var(--ink)" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2,
                background: "var(--ink)", color: "var(--cream)",
                fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700,
                borderRadius: "50%", width: 14, height: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 py-6 animate-slide-up"
          style={{ background: "var(--cream)", borderBottom: "1px solid var(--line)" }}
        >
          <ul className="flex flex-col items-center gap-4">
            <li>
              <Link
                href="/chat"
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)" }}
              >
                Ask Toastie
              </Link>
            </li>
            <li className="w-12 border-t" style={{ borderColor: "var(--line)" }} />
            <li>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 3 }}>
                WOMEN
              </span>
            </li>
            {WOMEN_LINKS.map((l) => (
              <li key={`w-${l.label}`}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-soft)" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="w-12 border-t mt-1" style={{ borderColor: "var(--line)" }} />
            <li>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 3 }}>
                MEN
              </span>
            </li>
            {MEN_LINKS.map((l) => (
              <li key={`m-${l.label}`}>
                <Link
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink-soft)" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="w-12 border-t mt-1" style={{ borderColor: "var(--line)" }} />
            <li>
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}
              >
                Wishlist
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}
              >
                Cart
              </Link>
            </li>
            {toastieUser?.onboardingCompleted && (
              <>
                <li className="w-12 border-t mt-1" style={{ borderColor: "var(--line)" }} />
                <li>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2"
                    style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}
                  >
                    <span
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: 22, height: 22,
                        background: "var(--sage)",
                        fontFamily: "var(--font-brand)",
                        fontSize: 12, color: "var(--ink)",
                      }}
                    >
                      {toastieUser.name.charAt(0).toUpperCase()}
                    </span>
                    Style Profile
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
