"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, User, ShoppingBag, Heart, Palette, BookImage,
  Menu, X, MessageCircle, ChevronRight,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useToastieUser } from "@/context/ToastieUserContext";

const NAV_ITEMS = [
  { href: "/",                label: "Home",           icon: Home },
  { href: "/profile",         label: "Style Profile",  icon: User },
  { href: "/wardrobe",        label: "Wardrobe",       icon: ShoppingBag },
  { href: "/lookbook",        label: "Lookbook",       icon: BookImage },
  { href: "/color-analysis",  label: "Color Analysis", icon: Palette },
  { href: "/wishlist",        label: "Favorites",      icon: Heart },
];

const HIDE_ON = ["/chat"];

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems: wishlistCount } = useWishlist();
  const { user: toastieUser } = useToastieUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (HIDE_ON.some((p) => pathname === p) || pathname.startsWith("/product/")) {
    return null;
  }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] flex-col z-50"
        style={{ background: "var(--cream)", borderRight: "1px solid var(--line)" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Image
              src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
              alt="Burnt Toast"
              width={110}
              height={36}
              className="h-8 w-auto object-contain"
              style={{ width: "auto" }}
              priority
              unoptimized
            />
          </Link>
          <div className="flex items-center gap-1.5 mt-3">
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--sage)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--sage)", letterSpacing: 1, fontWeight: 500 }}>
              AI STYLIST LIVE
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--cream)" : "var(--ash)",
                  textDecoration: "none",
                }}
              >
                <div className="relative">
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                  {href === "/wishlist" && wishlistCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex items-center justify-center"
                      style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: "var(--burnt)", color: "#fff",
                        fontFamily: "var(--font-mono)", fontSize: 7, fontWeight: 700,
                      }}
                    >
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: 1.5,
                  fontWeight: active ? 600 : 500,
                  textTransform: "uppercase",
                }}>
                  {label}
                </span>
                {active && <ChevronRight size={12} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — Ask Toastie CTA + Profile */}
        <div className="px-3 pb-5 space-y-3" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <Link
            href="/chat"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
            style={{
              background: "var(--sage)", color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            <MessageCircle size={16} strokeWidth={1.5} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>
              Ask Toastie
            </span>
          </Link>

          {toastieUser?.onboardingCompleted && (
            <div className="flex items-center gap-2.5 px-3">
              <span
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 28, height: 28,
                  background: "var(--sage)",
                  fontFamily: "var(--font-brand)",
                  fontSize: 13, color: "var(--ink)",
                }}
              >
                {toastieUser.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>
                  {toastieUser.name}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--ash)", letterSpacing: 1 }}>
                  {toastieUser.stylePersonality || "Style Explorer"}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: "var(--cream)", borderBottom: "1px solid var(--line)" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Image
            src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
            alt="Burnt Toast"
            width={90}
            height={30}
            className="h-7 w-auto object-contain"
            style={{ width: "auto" }}
            priority
            unoptimized
          />
        </Link>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="p-2 rounded-full hover:bg-[var(--cream-deep)]"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} stroke="var(--ink)" /> : <Menu size={20} stroke="var(--ink)" />}
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="md:hidden fixed top-0 left-0 h-full w-[260px] z-[70] flex flex-col animate-slide-right"
            style={{ background: "var(--cream)", borderRight: "1px solid var(--line)" }}
          >
            {/* Mobile Logo */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--line)" }}>
              <Image
                src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
                alt="Burnt Toast"
                width={90}
                height={30}
                className="h-7 w-auto object-contain"
                style={{ width: "auto" }}
                unoptimized
              />
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full hover:bg-[var(--cream-deep)]">
                <X size={18} stroke="var(--ink)" />
              </button>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                    style={{
                      background: active ? "var(--ink)" : "transparent",
                      color: active ? "var(--cream)" : "var(--ash)",
                      textDecoration: "none",
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 12,
                      letterSpacing: 1.5, fontWeight: active ? 600 : 500,
                      textTransform: "uppercase",
                    }}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Bottom */}
            <div className="px-3 pb-6 space-y-3" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
              <Link
                href="/chat"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all"
                style={{ background: "var(--sage)", color: "var(--ink)", textDecoration: "none" }}
              >
                <MessageCircle size={18} strokeWidth={1.5} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase" }}>
                  Ask Toastie
                </span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
