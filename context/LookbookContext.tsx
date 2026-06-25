"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { LookbookItem, LookbookCollection } from "@/types/lookbook";

const STORAGE_KEY = "toastieLookbook";
const COLLECTIONS_KEY = "toastieLookbookCollections";
const MAX_ITEMS = 200;

interface LookbookContextValue {
  items: LookbookItem[];
  collections: LookbookCollection[];
  isLoaded: boolean;
  addItem: (item: LookbookItem) => void;
  updateItem: (id: string, updates: Partial<LookbookItem>) => void;
  deleteItem: (id: string) => void;
  toggleLike: (id: string) => void;
  addToCollection: (itemId: string, collectionId: string) => void;
  removeFromCollection: (itemId: string, collectionId: string) => void;
  createCollection: (name: string, description?: string) => LookbookCollection;
  deleteCollection: (id: string) => void;
  getCollectionItems: (collectionId: string) => LookbookItem[];
  getLiked: () => LookbookItem[];
}

const LookbookContext = createContext<LookbookContextValue | null>(null);

export function LookbookProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [collections, setCollections] = useState<LookbookCollection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const colRaw = localStorage.getItem(COLLECTIONS_KEY);
      if (colRaw) setCollections(JSON.parse(colRaw));
    } catch {}
    setIsLoaded(true);
  }, []);

  const persistItems = useCallback((next: LookbookItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const persistCollections = useCallback((next: LookbookCollection[]) => {
    setCollections(next);
    try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addItem = useCallback((item: LookbookItem) => {
    setItems(prev => {
      const next = [item, ...prev].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<LookbookItem>) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...updates } : i);
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

  const toggleLike = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, liked: !i.liked } : i);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const addToCollection = useCallback((itemId: string, collectionId: string) => {
    setItems(prev => {
      const next = prev.map(i =>
        i.id === itemId && !i.collectionIds.includes(collectionId)
          ? { ...i, collectionIds: [...i.collectionIds, collectionId] }
          : i
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setCollections(prev => {
      const next = prev.map(c => c.id === collectionId ? { ...c, itemCount: c.itemCount + 1, updatedAt: Date.now() } : c);
      try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFromCollection = useCallback((itemId: string, collectionId: string) => {
    setItems(prev => {
      const next = prev.map(i =>
        i.id === itemId
          ? { ...i, collectionIds: i.collectionIds.filter(c => c !== collectionId) }
          : i
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setCollections(prev => {
      const next = prev.map(c => c.id === collectionId ? { ...c, itemCount: Math.max(0, c.itemCount - 1), updatedAt: Date.now() } : c);
      try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const createCollection = useCallback((name: string, description?: string): LookbookCollection => {
    const col: LookbookCollection = {
      id: crypto.randomUUID(),
      name,
      description,
      itemCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCollections(prev => {
      const next = [col, ...prev];
      try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return col;
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.map(i => ({ ...i, collectionIds: i.collectionIds.filter(c => c !== id) }));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setCollections(prev => {
      const next = prev.filter(c => c.id !== id);
      try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getCollectionItems = useCallback((collectionId: string) => {
    return items.filter(i => i.collectionIds.includes(collectionId));
  }, [items]);

  const getLiked = useCallback(() => items.filter(i => i.liked), [items]);

  return (
    <LookbookContext.Provider value={{
      items, collections, isLoaded,
      addItem, updateItem, deleteItem, toggleLike,
      addToCollection, removeFromCollection,
      createCollection, deleteCollection,
      getCollectionItems, getLiked,
    }}>
      {children}
    </LookbookContext.Provider>
  );
}

export function useLookbook() {
  const ctx = useContext(LookbookContext);
  if (!ctx) throw new Error("useLookbook must be used inside <LookbookProvider>");
  return ctx;
}
