"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================
// IMAGE UPLOAD TYPES
// ============================================

export interface UploadProgress {
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  progress: number; // 0-100
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

// File size limits
const MAX_FILE_SIZE_PROFILE = 5 * 1024 * 1024; // 5MB for profile picture
const MAX_FILE_SIZE_HERO = 15 * 1024 * 1024; // 15MB for hero banner (larger images)

// ============================================
// COMPONENT: Upload Progress Indicator
// ============================================

interface UploadProgressIndicatorProps {
  uploadProgress: UploadProgress;
}

function UploadProgressIndicator({ uploadProgress }: UploadProgressIndicatorProps) {
  const { status, progress, message } = uploadProgress;

  if (status === "idle") return null;

  return (
    <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
      <div className="flex items-center gap-3">
        {status === "uploading" || status === "processing" ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : status === "complete" ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
        <div className="flex-1">
          <p className="text-sm text-zinc-300">
            {message ||
              (status === "uploading"
                ? "Uploading..."
                : status === "processing"
                  ? "Processing..."
                  : status === "complete"
                    ? "Upload complete!"
                    : "Upload failed")}
          </p>
          {(status === "uploading" || status === "processing") && (
            <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <span className="text-sm text-zinc-500">{progress}%</span>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Image Upload Dialog
// ============================================

export function ImageUploadDialog({
  isOpen,
  onClose,
  onUpload,
  title,
  aspectRatio = "square",
  isLoading = false,
}: ImageUploadDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: "idle",
    progress: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine max file size based on aspect ratio
  const maxFileSize = aspectRatio === "wide" ? MAX_FILE_SIZE_HERO : MAX_FILE_SIZE_PROFILE;
  const maxFileSizeMB = maxFileSize / (1024 * 1024);

  /**
   * Handle file selection from device
   * Currently creates a base64 data URL for preview
   * TODO: In the future, this will upload to cloud storage (S3, Cloudinary, etc.)
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadProgress({
          status: "error",
          progress: 0,
          message: "Please select an image file",
        });
        return;
      }

      // Validate file size based on image type
      if (file.size > maxFileSize) {
        setUploadProgress({
          status: "error",
          progress: 0,
          message: `File size must be less than ${maxFileSizeMB}MB`,
        });
        return;
      }

      setSelectedFile(file);
      setUploadProgress({ status: "idle", progress: 0 });

      // Create preview using FileReader
      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress({ status: "processing", progress: 10, message: "Reading file..." });
      };
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 50) + 10;
          setUploadProgress({ status: "processing", progress, message: "Processing image..." });
        }
      };
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setUploadProgress({ status: "idle", progress: 0 });
      };
      reader.onerror = () => {
        setUploadProgress({
          status: "error",
          progress: 0,
          message: "Failed to read file",
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  /**
   * Handle URL input submission
   * Validates and loads the image from URL
   */
  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      setUploadProgress({ status: "processing", progress: 30, message: "Loading image..." });

      // Create an image element to validate the URL
      const img = new Image();
      img.onload = () => {
        setPreviewUrl(urlInput.trim());
        setSelectedFile(null);
        setUploadProgress({ status: "idle", progress: 0 });
      };
      img.onerror = () => {
        setUploadProgress({
          status: "error",
          progress: 0,
          message: "Invalid image URL or failed to load",
        });
      };
      img.src = urlInput.trim();
    }
  }, [urlInput]);

  /**
   * Handle confirm/save action
   * Currently saves the base64 or URL directly
   *
   * TODO: FUTURE FILE UPLOAD IMPLEMENTATION
   * When implementing real file upload to storage:
   * 1. Check if selectedFile exists (file was uploaded from device)
   * 2. If yes, call the upload API endpoint:
   *    ```
   *    const formData = new FormData();
   *    formData.append('file', selectedFile);
   *    formData.append('type', aspectRatio); // 'square' for profile, 'wide' for hero
   *
   *    setUploadProgress({ status: 'uploading', progress: 0 });
   *
   *    const response = await fetch('/api/upload/image', {
   *      method: 'POST',
   *      body: formData,
   *      // For progress tracking, use XMLHttpRequest or a library like axios
   *    });
   *
   *    const { url } = await response.json();
   *    onUpload(url); // Pass the cloud storage URL
   *    ```
   * 3. If no file (URL was used), just pass the URL directly
   * 4. Consider adding image optimization/resizing on the server
   * 5. Add proper error handling for upload failures
   */
  const handleConfirm = useCallback(async () => {
    if (!previewUrl) return;

    // Simulate upload progress for UX (remove when implementing real upload)
    if (selectedFile) {
      setUploadProgress({ status: "uploading", progress: 0, message: "Preparing upload..." });

      // Simulate progress steps
      const steps = [20, 40, 60, 80, 100];
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress({
          status: step < 100 ? "uploading" : "processing",
          progress: step,
          message: step < 100 ? "Uploading..." : "Finalizing...",
        });
      }
    }

    // Pass the preview URL (base64 or external URL)
    // TODO: Replace previewUrl with the actual cloud storage URL when implementing real upload
    onUpload(previewUrl);
    handleClose();
  }, [previewUrl, selectedFile, onUpload]);

  /**
   * Reset and close dialog
   */
  const handleClose = useCallback(() => {
    setPreviewUrl(null);
    setUrlInput("");
    setSelectedFile(null);
    setUploadProgress({ status: "idle", progress: 0 });
    onClose();
  }, [onClose]);

  /**
   * Clear current preview/selection
   */
  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadProgress({ status: "idle", progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog - wider for hero banners */}
      <div
        className={cn(
          "relative z-10 w-full mx-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl",
          aspectRatio === "wide" ? "max-w-2xl" : "max-w-md"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Preview Area - larger for hero banners */}
        <div
          className={cn(
            "relative mb-6 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/50 overflow-hidden",
            aspectRatio === "wide"
              ? "w-full min-h-50 aspect-video" // Taller hero banner preview (16:9)
              : "aspect-square max-w-50 mx-auto"
          )}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
              <ImageIcon className="w-12 h-12 mb-2" />
              <p className="text-sm">No image selected</p>
              <p className="text-xs text-zinc-600 mt-1">
                {aspectRatio === "wide" ? "Recommended: 1920x1080px (16:9)" : "Recommended: 400x400px"}
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        <UploadProgressIndicator uploadProgress={uploadProgress} />

        {/* Upload Options */}
        <div className="space-y-4 mt-4">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress.status === "uploading" || uploadProgress.status === "processing"}
            >
              <Upload className="w-4 h-4" />
              Upload from Device
            </Button>
            <p className="text-xs text-zinc-600 mt-1 text-center">
              Max file size: {maxFileSizeMB}MB • JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-500">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste image URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={uploadProgress.status === "uploading" || uploadProgress.status === "processing"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || uploadProgress.status === "uploading" || uploadProgress.status === "processing"}
            >
              Load
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={!previewUrl || isLoading || uploadProgress.status === "uploading"}
          >
            {isLoading || uploadProgress.status === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress.status === "uploading" ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save Image"
            )}
          </Button>
        </div>

        {/* Future implementation note */}
        {/*
          TODO: When implementing cloud storage upload:
          1. Create API route at /api/upload/image
          2. Use multer or similar for file handling
          3. Upload to S3/Cloudinary/similar
          4. Return the public URL
          5. Update this component to use real upload progress
        */}
      </div>
    </div>
  );
}
