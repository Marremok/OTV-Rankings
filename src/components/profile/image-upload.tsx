"use client";

import { useState, useCallback } from "react";
import { X, ImageIcon, Loader2, CheckCircle2, AlertCircle, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// ============================================
// TYPES
// ============================================

export interface UploadProgress {
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  message?: string;
}

export interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
  title: string;
  aspectRatio?: "square" | "wide";
  isLoading?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function ImageUploadDialog({
  isOpen,
  onClose,
  onUpload,
  title,
  aspectRatio = "square",
  isLoading = false,
}: ImageUploadDialogProps) {
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const endpoint: keyof OurFileRouter = aspectRatio === "wide" ? "profileBanner" : "profileImage";

  const handleClose = useCallback(() => {
    setUrlInput("");
    setPreviewUrl(null);
    setUrlError(null);
    setUploadState("idle");
    setUploadError(null);
    onClose();
  }, [onClose]);

  const handleUrlLoad = useCallback(() => {
    const url = urlInput.trim();
    if (!url) return;
    setUrlError(null);

    const img = new Image();
    img.onload = () => setPreviewUrl(url);
    img.onerror = () => setUrlError("Could not load image from that URL");
    img.src = url;
  }, [urlInput]);

  const handleUrlSave = useCallback(() => {
    if (!previewUrl) return;
    onUpload(previewUrl);
    handleClose();
  }, [previewUrl, onUpload, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div
        className={cn(
          "relative z-10 w-full mx-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl",
          aspectRatio === "wide" ? "max-w-2xl" : "max-w-md"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* UploadThing dropzone */}
        <div className="mb-5">
          {uploadState === "done" ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-emerald-700/40 bg-emerald-900/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-400">Upload complete!</p>
            </div>
          ) : (
            <UploadDropzone
              endpoint={endpoint}
              onUploadBegin={() => {
                setUploadState("uploading");
                setUploadError(null);
              }}
              onClientUploadComplete={(res) => {
                const url = res[0]?.url;
                if (url) {
                  setUploadState("done");
                  onUpload(url);
                  // Close after brief success flash
                  setTimeout(handleClose, 800);
                }
              }}
              onUploadError={(error) => {
                setUploadState("error");
                setUploadError(error.message || "Upload failed");
              }}
              appearance={{
                container: cn(
                  "border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-800/40 transition-colors hover:border-zinc-500",
                  aspectRatio === "wide" ? "min-h-[10rem]" : "min-h-[8rem]"
                ),
                label: "text-zinc-400 text-sm",
                allowedContent: "text-zinc-600 text-xs",
                button: "bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium",
                uploadIcon: "text-zinc-600",
              }}
            />
          )}

          {uploadState === "error" && uploadError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-500 flex items-center gap-1.5">
            <Link className="w-3 h-3" /> or paste a URL
          </span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* URL input */}
        {previewUrl ? (
          <div className="space-y-3">
            <div
              className={cn(
                "relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800",
                aspectRatio === "wide" ? "aspect-video w-full" : "aspect-square max-w-[12rem] mx-auto"
              )}
            >
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPreviewUrl(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUrlSave} disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Use This Image"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()}
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button variant="outline" size="sm" onClick={handleUrlLoad} disabled={!urlInput.trim()}>
                Load
              </Button>
            </div>
            {urlError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {urlError}
              </p>
            )}
            <p className="text-xs text-zinc-600">
              {aspectRatio === "wide"
                ? "Recommended: 1920×1080px (16:9)"
                : "Recommended: 400×400px (square)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
