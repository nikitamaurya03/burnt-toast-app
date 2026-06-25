"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { WardrobeItem, WardrobeAnalytics } from "@/types/wardrobe";

const STORAGE_KEY = "toastieWardrobe";
const MAX_ITEMS = 200;

interface WardrobeContextValue {
  items: WardrobeItem[];
  isLoaded: boolean;
  addItem: (item: WardrobeItem) => void;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => void;
  deleteItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  incrementWear: (id: string) => void;
  getAnalytics: () => WardrobeAnalytics;
  getByCategory: (cat: string) => WardrobeItem[];
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: WardrobeItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addItem = useCallback((item: WardrobeItem) => {
    setItems(prev => {
      const next = [item, ...prev].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<WardrobeItem>) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: Date.now() } : i);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    updateItem(id, { favorite: !items.find(i => i.id === id)?.favorite });
  }, [items, updateItem]);

  const incrementWear = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (item) updateItem(id, { wearCount: item.wearCount + 1 });
  }, [items, updateItem]);

  const getByCategory = useCallback((cat: string) => {
    return items.filter(i => i.category === cat && i.currentStatus === "active");
  }, [items]);

  const getAnalytics = useCallback((): WardrobeAnalytics => {
    const active = items.filter(i => i.currentStatus === "active");
    const catDist: Record<string, number> = {};
    const colorDist: Record<string, number> = {};
    let totalValue = 0;
    let totalCPW = 0;
    let cpwCount = 0;

    active.forEach(i => {
      catDist[i.category] = (catDist[i.category] || 0) + 1;
      colorDist[i.color] = (colorDist[i.color] || 0) + 1;
      if (i.purchasePrice) totalValue += i.purchasePrice;
      if (i.purchasePrice && i.wearCount > 0) {
        totalCPW += i.purchasePrice / i.wearCount;
        cpwCount++;
      }
    });

    const sorted = [...active].sort((a, b) => b.wearCount - a.wearCount);

    return {
      totalItems: active.length,
      totalValue,
      categoryDistribution: catDist,
      colorDistribution: colorDist,
      mostWorn: sorted.slice(0, 5),
      unused: active.filter(i => i.wearCount === 0),
      favoriteCount: active.filter(i => i.favorite).length,
      avgCostPerWear: cpwCount > 0 ? Math.round(totalCPW / cpwCount) : 0,
    };
  }, [items]);

  return (
    <WardrobeContext.Provider value={{ items, isLoaded, addItem, updateItem, deleteItem, toggleFavorite, incrementWear, getAnalytics, getByCategory }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used inside <WardrobeProvider>");
  return ctx;
}
