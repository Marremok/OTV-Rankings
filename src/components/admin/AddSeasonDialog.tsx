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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useCreateSeason } from "@/hooks/use-seasons"
import { useGetAllSeries } from "@/hooks/use-series"

export interface SeasonData {
  id: string
  seasonNumber: number
  name: string | null
  slug: string | null
  description: string | null
  posterUrl: string | null
  heroImageUrl: string | null
  ranking: number
  score: number
  seriesId: string
}

interface AddSeasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSeason: (season: SeasonData) => void
}

export function AddSeasonDialog({ open, onOpenChange, onAddSeason }: AddSeasonDialogProps) {
  const createSeason = useCreateSeason()
  const { data: seriesList, isLoading: isLoadingSeries } = useGetAllSeries()

  const [seriesId, setSeriesId] = useState("")
  const [seasonNumber, setSeasonNumber] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [posterUrl, setPosterUrl] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate slug from name or season number
  useEffect(() => {
    if (!slug) {
      const base = name.trim() || (seasonNumber ? `Season ${seasonNumber}` : "")
      if (base) {
        setSlug(base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
      }
    }
  }, [name, seasonNumber, slug])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!seriesId) newErrors.seriesId = "Series is required"

    const num = parseInt(seasonNumber)
    if (!seasonNumber || isNaN(num) || num < 1) {
      newErrors.seasonNumber = "Season number must be a positive integer"
    }

    if (slug && !/^[a-z0-9-]+$/.test(slug.trim())) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (posterUrl.trim()) {
      try { new URL(posterUrl) } catch { newErrors.posterUrl = "Please enter a valid URL" }
    }

    if (heroImageUrl.trim()) {
      try { new URL(heroImageUrl) } catch { newErrors.heroImageUrl = "Please enter a valid URL" }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const newSeason = await createSeason.mutateAsync({
        seriesId,
        seasonNumber: parseInt(seasonNumber),
        name: name.trim() || null,
        slug: slug.trim() || null,
        description: description.trim() || null,
        posterUrl: posterUrl.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
      })

      onAddSeason(newSeason as SeasonData)
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create season:", error)
      setErrors({ submit: error.message || "Failed to create season. Please try again." })
    }
  }

  const resetForm = () => {
    setSeriesId("")
    setSeasonNumber("")
    setName("")
    setSlug("")
    setDescription("")
    setPosterUrl("")
    setHeroImageUrl("")
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Season</DialogTitle>
          <DialogDescription>Add a new season to a TV series</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Series */}
            <div className="space-y-2">
              <Label htmlFor="series" className="text-sm font-medium">
                Series <span className="text-destructive">*</span>
              </Label>
              <Select value={seriesId} onValueChange={setSeriesId}>
                <SelectTrigger className={errors.seriesId ? "border-destructive" : ""}>
                  <SelectValue placeholder={isLoadingSeries ? "Loading series..." : "Select a series"} />
                </SelectTrigger>
                <SelectContent>
                  {seriesList?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.seriesId && <p className="text-sm text-destructive">{errors.seriesId}</p>}
            </div>

            {/* Season Number */}
            <div className="space-y-2">
              <Label htmlFor="seasonNumber" className="text-sm font-medium">
                Season Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="seasonNumber"
                type="number"
                min={1}
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                placeholder="e.g. 1"
                className={errors.seasonNumber ? "border-destructive" : ""}
              />
              {errors.seasonNumber && <p className="text-sm text-destructive">{errors.seasonNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="season-name" className="text-sm font-medium">Name</Label>
              <Input
                id="season-name"
                value={name}
                onChange={(e) => { setName(e.target.value); setSlug("") }}
                placeholder="e.g. The Beginning"
              />
              <p className="text-xs text-muted-foreground">Optional subtitle for this season</p>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="season-slug" className="text-sm font-medium">Slug</Label>
              <Input
                id="season-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated"
                className={errors.slug ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                URL identifier (e.g. <span className="font-mono">season-1</span>)
              </p>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>
          </div>

          {/* Poster URL */}
          <div className="space-y-2">
            <Label htmlFor="season-posterUrl" className="text-sm font-medium">Poster Image URL</Label>
            <Input
              id="season-posterUrl"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/season-poster.jpg"
              className={errors.posterUrl ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">Season poster image (recommended 2:3 aspect ratio)</p>
            {errors.posterUrl && <p className="text-sm text-destructive">{errors.posterUrl}</p>}
          </div>

          {/* Hero Image URL */}
          <div className="space-y-2">
            <Label htmlFor="season-heroImageUrl" className="text-sm font-medium">Hero Image URL</Label>
            <Input
              id="season-heroImageUrl"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/season-hero.jpg"
              className={errors.heroImageUrl ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">Wide banner image for the season detail page</p>
            {errors.heroImageUrl && <p className="text-sm text-destructive">{errors.heroImageUrl}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="season-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="season-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter season description..."
              rows={4}
            />
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createSeason.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSeason.isPending}>
              {createSeason.isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Adding...</>
              ) : "Add Season"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
