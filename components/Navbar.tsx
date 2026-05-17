"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import clsx from "clsx";

const links = [
  { href: "/",         label: "Home" },
  { href: "/chat",     label: "Ask Toastie" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart",     label: "Cart" },
];

/* Hide on pages that have their own header */
const HIDE_ON = ["/chat"];

export default function Navbar() {
  const pathname  = usePathname();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Don't render on chat or product detail pages */
  if (HIDE_ON.some((p) => pathname === p) || pathname.startsWith("/product/")) {
    return null;
  }

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white border-b border-gray-200 py-3 shadow-sm"
          : "bg-white py-4"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://burnt-toast.com/cdn/shop/files/Logo-8_1.png"
            alt="Burnt Toast"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            style={{ width: "auto" }}
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "text-sm font-medium tracking-wider uppercase transition-colors duration-200",
                  pathname === href
                    ? "text-gray-900 border-b-2 border-gray-900 pb-0.5"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-gray-400 tracking-wide mr-2">
            Made by Nikita
          </span>

          <Link href="/wishlist" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Heart size={20} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : "text-gray-800"} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingBag size={20} className="text-gray-800" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {mobileOpen
              ? <X size={20} className="text-gray-800" />
              : <Menu size={20} className="text-gray-800" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-4 animate-slide-up">
          <ul className="flex flex-col items-center gap-4">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "text-sm font-medium tracking-widest uppercase",
                    pathname === href ? "text-gray-900 font-bold" : "text-gray-500"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
