"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { X, Plus, Loader2 } from "lucide-react"
import { useCreateSeries } from "@/hooks/use-series"

export interface Series {
  id: string
  title: string
  description: string | null
  releaseYear: number | null
  imageUrl: string | null
  wideImageUrl: string | null
  slug: string | null
  genre: string[]
  seasons: number | null
  score: number
}

interface AddSeriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSeries: (series: Series) => void
}

export function AddSeriesDialog({
  open,
  onOpenChange,
  onAddSeries,
}: AddSeriesDialogProps) {
  const createSeries = useCreateSeries()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [releaseYear, setReleaseYear] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [wideImageUrl, setWideImageUrl] = useState("") // Bred bild för hero-sektion
  const [slug, setSlug] = useState("")
  const [genre, setGenre] = useState<string[]>([])
  const [genreInput, setGenreInput] = useState("")
  const [seasons, setSeasons] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(autoSlug)
    }
  }, [title, slug])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (releaseYear) {
      const year = parseInt(releaseYear)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        newErrors.releaseYear = `Year must be between 1900 and ${currentYear + 1}`
      }
    }

    if (seasons) {
      const seasonNum = parseInt(seasons)
      if (isNaN(seasonNum) || seasonNum < 1) {
        newErrors.seasons = "Seasons must be at least 1"
      }
    }

    if (imageUrl && imageUrl.trim()) {
      try {
        new URL(imageUrl)
      } catch {
        newErrors.imageUrl = "Please enter a valid URL"
      }
    }

    // Validera wideImageUrl om den finns
    if (wideImageUrl && wideImageUrl.trim()) {
      try {
        new URL(wideImageUrl)
      } catch {
        newErrors.wideImageUrl = "Please enter a valid URL"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddGenre = () => {
    if (genreInput.trim() && !genre.includes(genreInput.trim())) {
      setGenre([...genre, genreInput.trim()])
      setGenreInput("")
    }
  }

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenre(genre.filter((g) => g !== genreToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Use the server action via TanStack mutation
      const newSeries = await createSeries.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        imageUrl: imageUrl.trim() || null,
        wideImageUrl: wideImageUrl.trim() || null,
        slug: slug.trim() || null,
        genre,
        seasons: seasons ? parseInt(seasons) : null,
      })

      onAddSeries(newSeries as Series)
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create series:", error)
      setErrors({ submit: error.message || "Failed to create series. Please try again." })
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setReleaseYear("")
    setImageUrl("")
    setWideImageUrl("")
    setSlug("")
    setGenre([])
    setGenreInput("")
    setSeasons("")
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New TV Series</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new series to your collection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter series title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Release Year */}
            <div className="space-y-2">
              <Label htmlFor="releaseYear" className="text-sm font-medium">
                Release Year
              </Label>
              <Input
                id="releaseYear"
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="2024"
                className={errors.releaseYear ? "border-destructive" : ""}
              />
              {errors.releaseYear && (
                <p className="text-sm text-destructive">{errors.releaseYear}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">
                Slug
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-title"
              />
            </div>

            {/* Seasons */}
            <div className="space-y-2">
              <Label htmlFor="seasons" className="text-sm font-medium">
                Seasons
              </Label>
              <Input
                id="seasons"
                type="number"
                value={seasons}
                onChange={(e) => setSeasons(e.target.value)}
                placeholder="1"
                className={errors.seasons ? "border-destructive" : ""}
              />
              {errors.seasons && (
                <p className="text-sm text-destructive">{errors.seasons}</p>
              )}
            </div>
          </div>

          {/* Image URL (Poster) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Poster Image URL
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className={errors.imageUrl ? "border-destructive" : ""}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">{errors.imageUrl}</p>
            )}
          </div>

          {/* Wide Image URL (Hero) - Ny bild för bred visning på seriesidan */}
          <div className="space-y-2">
            <Label htmlFor="wideImageUrl" className="text-sm font-medium">
              Wide Image URL (Hero)
            </Label>
            <Input
              id="wideImageUrl"
              value={wideImageUrl}
              onChange={(e) => setWideImageUrl(e.target.value)}
              placeholder="https://example.com/wide-image.jpg"
              className={errors.wideImageUrl ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Bred bild som visas högst upp på seriesidan (t.ex. 16:9 format)
            </p>
            {errors.wideImageUrl && (
              <p className="text-sm text-destructive">{errors.wideImageUrl}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter series description..."
              rows={4}
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre" className="text-sm font-medium">
              Genres
            </Label>
            <div className="flex gap-2">
              <Input
                id="genre"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddGenre()
                  }
                }}
                placeholder="Add a genre"
              />
              <Button
                type="button"
                onClick={handleAddGenre}
                variant="secondary"
                size="icon"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {genre.map((g) => (
                  <Badge
                    key={g}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(g)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createSeries.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSeries.isPending}>
              {createSeries.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Series"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
