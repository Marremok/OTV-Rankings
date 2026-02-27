"use client"

import { useState } from "react"
import { Loader2, X, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadButton } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

interface AdminImageUploadProps {
  label: string
  endpoint: "contentPoster" | "contentHero"
  value: string | null
  onChange: (url: string | null) => void
  hint?: string
  aspectRatio?: "portrait" | "wide"
}

export function AdminImageUpload({
  label,
  endpoint,
  value,
  onChange,
  hint,
  aspectRatio = "portrait",
}: AdminImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [replacing, setReplacing] = useState(false)

  function handleUploadComplete(res: { url: string }[]) {
    const url = res[0]?.url
    if (url) {
      onChange(url)
      setUploadError(null)
      setReplacing(false)
    }
    setIsUploading(false)
  }

  function handleUploadError(error: Error) {
    setUploadError(error.message || "Upload failed")
    setIsUploading(false)
  }

  const previewClass = cn(
    "relative w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800",
    aspectRatio === "wide" ? "aspect-video" : "aspect-[2/3] max-w-[10rem]"
  )

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {value && !replacing ? (
        // Filled state — show preview + Replace / Remove buttons
        <div className="space-y-2">
          <div className={previewClass}>
            <img src={value} alt={label} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => { setReplacing(true); setUploadError(null) }}
            >
              <Upload className="size-3" />
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-zinc-500 hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <X className="size-3" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        // Empty state or replace mode — show upload button
        <div className="space-y-1.5">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 transition-colors hover:border-zinc-500",
              aspectRatio === "wide" ? "aspect-video w-full" : "aspect-[2/3] max-w-[10rem]",
              isUploading && "border-primary/50 bg-primary/5"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-primary">
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs">Uploading…</span>
              </div>
            ) : (
              <UploadButton
                endpoint={endpoint}
                onUploadBegin={() => { setIsUploading(true); setUploadError(null) }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                appearance={{
                  container: "flex flex-col items-center gap-2 p-4",
                  button: "bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium h-8 px-3 rounded-md",
                  allowedContent: "text-zinc-600 text-[11px]",
                }}
              />
            )}
          </div>

          {replacing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-500"
              onClick={() => { setReplacing(false); setUploadError(null) }}
            >
              Cancel
            </Button>
          )}
        </div>
      )}

      {uploadError && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="size-3 shrink-0" />
          {uploadError}
        </p>
      )}

      {hint && !uploadError && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
