"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

import type { ColorAnalysisResult, ColorAnalysisHistory } from "@/types/colorAnalysis";

/* ── Constants ────────────────────────────────────────────────── */
const STORAGE_KEY = "toastieColorAnalysis";
const MAX_HISTORY = 10;

/* ── Context value interface ──────────────────────────────────── */
interface ColorAnalysisContextValue {
  history: ColorAnalysisResult[];
  currentAnalysis: ColorAnalysisResult | null;
  isLoaded: boolean;
  addAnalysis: (result: ColorAnalysisResult) => void;
  setCurrentAnalysis: (id: string) => void;
  deleteAnalysis: (id: string) => void;
  clearAll: () => void;
}

const ColorAnalysisContext = createContext<ColorAnalysisContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────────── */
export function ColorAnalysisProvider({ children }: { children: ReactNode }) {
  const [history, _setHistory] = useState<ColorAnalysisResult[]>([]);
  const [currentAnalysis, _setCurrentAnalysis] = useState<ColorAnalysisResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ColorAnalysisHistory = JSON.parse(raw);
        const analyses = parsed.analyses ?? [];
        _setHistory(analyses);
        if (analyses.length > 0) {
          _setCurrentAnalysis(analyses[0]);
        }
      }
    } catch { /* ignore */ }
    setIsLoaded(true);
  }, []);

  /* Persist helper */
  const persist = useCallback((analyses: ColorAnalysisResult[]) => {
    _setHistory(analyses);
    try {
      const data: ColorAnalysisHistory = { analyses };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* quota / private browsing */ }
  }, []);

  /* addAnalysis — prepend, cap at MAX_HISTORY, set as current */
  const addAnalysis = useCallback(
    (result: ColorAnalysisResult) => {
      _setHistory((prev) => {
        const next = [result, ...prev].slice(0, MAX_HISTORY);
        try {
          const data: ColorAnalysisHistory = { analyses: next };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch { /* ignore */ }
        return next;
      });
      _setCurrentAnalysis(result);
    },
    [],
  );

  /* setCurrentAnalysis — find by id in history */
  const setCurrentAnalysis = useCallback(
    (id: string) => {
      _setHistory((prev) => {
        const found = prev.find((r) => r.id === id) ?? null;
        _setCurrentAnalysis(found);
        return prev;
      });
    },
    [],
  );

  /* deleteAnalysis — remove by id; if it was current, set to newest remaining */
  const deleteAnalysis = useCallback(
    (id: string) => {
      _setHistory((prev) => {
        const next = prev.filter((r) => r.id !== id);
        persist(next);
        _setCurrentAnalysis((cur) => {
          if (cur?.id === id) {
            return next.length > 0 ? next[0] : null;
          }
          return cur;
        });
        return next;
      });
    },
    [persist],
  );

  /* clearAll — remove everything */
  const clearAll = useCallback(() => {
    persist([]);
    _setCurrentAnalysis(null);
  }, [persist]);

  return (
    <ColorAnalysisContext.Provider
      value={{
        history,
        currentAnalysis,
        isLoaded,
        addAnalysis,
        setCurrentAnalysis,
        deleteAnalysis,
        clearAll,
      }}
    >
      {children}
    </ColorAnalysisContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────────────── */
export function useColorAnalysis() {
  const ctx = useContext(ColorAnalysisContext);
  if (!ctx) throw new Error("useColorAnalysis must be used inside <ColorAnalysisProvider>");
  return ctx;
}
