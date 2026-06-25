import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastieUserProvider } from "@/context/ToastieUserContext";
import { ColorAnalysisProvider } from "@/context/ColorAnalysisContext";
import { WardrobeProvider } from "@/context/WardrobeContext";
import { LookbookProvider } from "@/context/LookbookContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Burnt Toast — AI Style Companion",
  description:
    "Shop Burnt Toast with Toastie, your AI style companion. Real looks for real moments — casual, college, nights out & more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased" style={{ background: "var(--cream)", color: "var(--ink)" }}>
        <ToastieUserProvider>
          <ColorAnalysisProvider>
            <WardrobeProvider>
              <LookbookProvider>
                <CartProvider>
                  <WishlistProvider>
                    <Navbar />
                    <main className="md:ml-[220px]">{children}</main>
                  </WishlistProvider>
                </CartProvider>
              </LookbookProvider>
            </WardrobeProvider>
          </ColorAnalysisProvider>
        </ToastieUserProvider>
      </body>
    </html>
  );
}
