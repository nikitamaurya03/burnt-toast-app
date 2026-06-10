"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

/* ── Types ────────────────────────────────────────────────────── */
export interface ToastieUser {
  name: string;
  onboardingCompleted: boolean;
  styleIdentity: string;
  colorPersonality: string;
  stylingDirection: string;
  preferredStyles: string[];
  favoriteColors: string[];
  skinTone: string;
  bodyShape: string;
  stylingNeeds: string[];
  tags: string[];
  createdAt: number;
}

interface ToastieUserContextValue {
  user: ToastieUser | null;
  isLoaded: boolean;               // true once localStorage has been read
  setUser: (u: ToastieUser) => void;
  updateUser: (patch: Partial<ToastieUser>) => void;
  clearUser: () => void;
}

const STORAGE_KEY = "toastieUser";

const ToastieUserContext = createContext<ToastieUserContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────────── */
export function ToastieUserProvider({ children }: { children: ReactNode }) {
  const [user, _setUser] = useState<ToastieUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  /* Persist helper */
  const persist = useCallback((u: ToastieUser | null) => {
    _setUser(u);
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch { /* quota / private browsing */ }
  }, []);

  const setUser = useCallback(
    (u: ToastieUser) => persist(u),
    [persist],
  );

  const updateUser = useCallback(
    (patch: Partial<ToastieUser>) => {
      _setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch { /* ignore */ }
        return next;
      });
    },
    [],
  );

  const clearUser = useCallback(() => persist(null), [persist]);

  return (
    <ToastieUserContext.Provider value={{ user, isLoaded, setUser, updateUser, clearUser }}>
      {children}
    </ToastieUserContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────────────── */
export function useToastieUser() {
  const ctx = useContext(ToastieUserContext);
  if (!ctx) throw new Error("useToastieUser must be used inside <ToastieUserProvider>");
  return ctx;
}
