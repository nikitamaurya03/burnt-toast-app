"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Camera, X, AlertCircle, CheckCircle } from "lucide-react";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface UploadScreenProps {
  onImageReady: (base64: string, mime: string, thumbnail: string) => void;
  isValidating: boolean;
  validationError: string | null;
}

export default function UploadScreen({ onImageReady, isValidating, validationError }: UploadScreenProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError("Image is too large. Maximum size is 15 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);

      const base64 = dataUrl.split(",")[1];
      const thumbCanvas = document.createElement("canvas");
      const img = new Image();
      img.onload = () => {
        const s = 200;
        const scale = Math.min(s / img.width, s / img.height);
        thumbCanvas.width = img.width * scale;
        thumbCanvas.height = img.height * scale;
        const ctx = thumbCanvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.6);
        onImageReady(base64, file.type, thumbnail);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [onImageReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearPreview = () => {
    setPreview(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayError = fileError || validationError;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Tips */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: "var(--cream-soft)", border: "1px solid var(--line)" }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            color: "var(--ink)",
            marginBottom: 12,
          }}
        >
          Tips for the best analysis
        </p>
        <ul className="space-y-2">
          {[
            "Natural daylight works best — avoid harsh flash or warm indoor lamps",
            "Face the camera directly, or at a slight angle",
            "Remove sunglasses; light makeup is fine, but heavy filters will affect results",
            "Pull hair back slightly so we can see your skin tone around the hairline",
          ].map((tip, i) => (
            <li
              key={i}
              className="flex items-start gap-2"
              style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ash)" }}
            >
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--sage)" }} />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Upload zone */}
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl cursor-pointer transition-all duration-200"
          style={{
            border: `2px dashed ${dragActive ? "var(--sage)" : "var(--line)"}`,
            background: dragActive ? "var(--cream-soft)" : "transparent",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
          />
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-full p-4"
              style={{ background: "var(--cream-deep)" }}
            >
              <Upload size={28} style={{ color: "var(--sage-deep)" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)" }}>
                Upload your selfie
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1, marginTop: 4 }}>
                DRAG & DROP OR CLICK TO BROWSE
              </p>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--ash)" }}>
              JPEG, PNG, WebP — max 15 MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
            <img src={preview} alt="Your selfie" className="w-full max-h-[400px] object-contain" style={{ background: "var(--cream-soft)" }} />
          </div>
          {!isValidating && (
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 rounded-full p-2 transition-colors"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              <X size={16} />
            </button>
          )}
          {isValidating && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(250,245,235,0.8)" }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2" style={{ borderColor: "var(--line)", borderTopColor: "var(--sage-deep)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ash)", letterSpacing: 1 }}>
                  CHECKING IMAGE QUALITY...
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {displayError && (
        <div
          className="flex items-start gap-2 mt-4 rounded-lg px-4 py-3"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#dc2626" }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#991b1b" }}>
            {displayError}
          </p>
        </div>
      )}
    </div>
  );
}
