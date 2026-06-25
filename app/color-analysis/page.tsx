"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Sparkles, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { useColorAnalysis } from "@/context/ColorAnalysisContext";
import type { ColorAnalysisResult } from "@/types/colorAnalysis";
import UploadScreen from "@/components/color-analysis/UploadScreen";
import AnalysisLoading from "@/components/color-analysis/AnalysisLoading";
import ResultsView from "@/components/color-analysis/ResultsView";
import { downloadPdf } from "@/components/color-analysis/PdfExport";

type Stage = "intro" | "upload" | "analyzing" | "results" | "history";

export default function ColorAnalysisPage() {
  const { history, currentAnalysis, addAnalysis, setCurrentAnalysis, deleteAnalysis, isLoaded } = useColorAnalysis();

  const [stage, setStage] = useState<Stage>("intro");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ColorAnalysisResult | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const handleImageReady = useCallback(async (base64: string, mime: string, thumb: string) => {
    setThumbnail(thumb);
    setIsValidating(true);
    setValidationError(null);

    try {
      const valRes = await fetch("/api/color-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", image: base64, mime }),
      });

      if (!valRes.ok) {
        const err = await valRes.json().catch(() => ({ error: "Validation failed" }));
        setValidationError(err.error || "Could not validate image.");
        setIsValidating(false);
        return;
      }

      const validation = await valRes.json();
      if (!validation.valid) {
        setValidationError(validation.issues?.join(" ") || "This image isn't suitable for color analysis. Please try another photo.");
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
      setStage("analyzing");
      setAnalysisError(null);

      const anaRes = await fetch("/api/color-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", image: base64, mime }),
      });

      if (!anaRes.ok) {
        if (anaRes.status === 504 || anaRes.status === 408) {
          setAnalysisError("The analysis took too long. Please try again with a smaller or clearer photo.");
        } else {
          const err = await anaRes.json().catch(() => ({ error: "Analysis failed" }));
          setAnalysisError(err.error || "Something went wrong. Please try again.");
        }
        setStage("upload");
        return;
      }

      const result: ColorAnalysisResult = await anaRes.json();
      result.image_thumbnail = thumb;
      addAnalysis(result);
      setCurrentResult(result);
      setStage("results");
    } catch (err) {
      setValidationError("Network error — please check your connection and try again.");
      setIsValidating(false);
      setStage("upload");
    }
  }, [addAnalysis]);

  const startNew = () => {
    setCurrentResult(null);
    setValidationError(null);
    setAnalysisError(null);
    setThumbnail(null);
    setStage("upload");
  };

  const viewFromHistory = (id: string) => {
    const found = history.find((r) => r.id === id);
    if (found) {
      setCurrentResult(found);
      setCurrentAnalysis(id);
      setStage("results");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: "var(--line)", borderTopColor: "var(--sage-deep)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6" style={{ background: "var(--cream)" }}>
      <div className="max-w-2xl mx-auto">

        {/* Nav bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: 1 }}
          >
            <ArrowLeft size={16} />
            BACK
          </Link>
          {history.length > 0 && stage !== "history" && (
            <button
              onClick={() => setStage("history")}
              className="flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: 1 }}
            >
              <History size={16} />
              HISTORY ({history.length})
            </button>
          )}
        </div>

        {/* Intro screen */}
        {stage === "intro" && (
          <div className="text-center space-y-8">
            <div>
              <div className="flex justify-center mb-4">
                <div className="rounded-full p-5" style={{ background: "var(--cream-soft)", border: "1px solid var(--line)" }}>
                  <Sparkles size={36} style={{ color: "var(--sage-deep)" }} />
                </div>
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--ink)", lineHeight: 1.2 }}>
                Personal Color Analysis
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--ash)", marginTop: 12, maxWidth: 420, margin: "12px auto 0" }}>
                Discover which colors make you glow. Upload a selfie and our AI stylist will analyze your natural coloring to find your perfect palette.
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              {[
                { step: "1", label: "Upload a clear selfie in natural light" },
                { step: "2", label: "AI analyzes your skin, eyes, and hair" },
                { step: "3", label: "Get your personalized color palette & styling tips" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-4 text-left">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 32, height: 32, background: "var(--sage)", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)", fontWeight: 600 }}
                  >
                    {s.step}
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ink)" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStage("upload")}
              className="rounded-xl px-8 py-3.5 transition-all hover:scale-[1.02]"
              style={{
                background: "var(--ink)",
                color: "var(--cream)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: 2,
              }}
            >
              GET STARTED
            </button>

            {history.length > 0 && currentAnalysis && (
              <div>
                <button
                  onClick={() => {
                    setCurrentResult(currentAnalysis);
                    setStage("results");
                  }}
                  className="transition-opacity hover:opacity-70"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--sage-deep)", letterSpacing: 1 }}
                >
                  VIEW LATEST RESULT →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload screen */}
        {stage === "upload" && (
          <div>
            <div className="text-center mb-8">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ink)" }}>
                Upload your photo
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ash)", marginTop: 4 }}>
                A well-lit selfie gives the best results
              </p>
            </div>
            <UploadScreen
              onImageReady={handleImageReady}
              isValidating={isValidating}
              validationError={validationError || analysisError}
            />
          </div>
        )}

        {/* Analyzing */}
        {stage === "analyzing" && <AnalysisLoading />}

        {/* Results */}
        {stage === "results" && currentResult && (
          <ResultsView
            result={currentResult}
            onNewAnalysis={startNew}
            onDownloadPdf={() => downloadPdf(currentResult)}
          />
        )}

        {/* History */}
        {stage === "history" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ink)" }}>
                Analysis History
              </h2>
              <button
                onClick={() => setStage("intro")}
                className="transition-opacity hover:opacity-70"
                style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash)", letterSpacing: 1 }}
              >
                BACK
              </button>
            </div>

            {history.length === 0 ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--ash)", textAlign: "center", padding: "48px 0" }}>
                No analyses yet. Start your first one!
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-colors hover:bg-[var(--cream-soft)]"
                    style={{ border: "1px solid var(--line)" }}
                    onClick={() => viewFromHistory(r.id)}
                  >
                    {r.image_thumbnail && (
                      <img
                        src={r.image_thumbnail}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                        style={{ border: "1px solid var(--line)" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)" }}>
                        {r.season.primary}
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 0.5 }}>
                        {new Date(r.created_at).toLocaleDateString()} · {r.undertone.undertone} undertone · {r.contrast.contrast} contrast
                      </p>
                    </div>
                    {/* Preview swatches */}
                    <div className="hidden sm:flex gap-1">
                      {r.best_colors.slice(0, 4).map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: c.hex, border: "1px solid var(--line)" }} />
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnalysis(r.id);
                      }}
                      className="p-2 rounded-full transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={14} style={{ color: "#dc2626" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={startNew}
                className="rounded-xl px-8 py-3 transition-all"
                style={{
                  background: "var(--ink)",
                  color: "var(--cream)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: 1,
                }}
              >
                NEW ANALYSIS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
