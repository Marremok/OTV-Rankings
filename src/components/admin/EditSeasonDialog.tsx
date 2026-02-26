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
import { useEditSeason } from "@/hooks/use-seasons"
import { useGetAllSeries } from "@/hooks/use-series"
import type { SeasonData } from "./AddSeasonDialog"

interface EditSeasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  season: SeasonData | null
  onSuccess: () => void
}

export function EditSeasonDialog({ open, onOpenChange, season, onSuccess }: EditSeasonDialogProps) {
  const editSeason = useEditSeason()
  const { data: seriesList, isLoading: isLoadingSeries } = useGetAllSeries()

  const [seriesId, setSeriesId] = useState("")
  const [seasonNumber, setSeasonNumber] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [posterUrl, setPosterUrl] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when season changes
  useEffect(() => {
    if (season) {
      setSeriesId(season.seriesId)
      setSeasonNumber(String(season.seasonNumber))
      setName(season.name || "")
      setSlug(season.slug || "")
      setDescription(season.description || "")
      setPosterUrl(season.posterUrl || "")
      setHeroImageUrl(season.heroImageUrl || "")
      setErrors({})
    }
  }, [season])

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
    if (!season || !validateForm()) return

    try {
      await editSeason.mutateAsync({
        id: season.id,
        seriesId,
        seasonNumber: parseInt(seasonNumber),
        name: name.trim() || null,
        slug: slug.trim() || null,
        description: description.trim() || null,
        posterUrl: posterUrl.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to update season:", error)
      setErrors({ submit: error.message || "Failed to update season. Please try again." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Season</DialogTitle>
          <DialogDescription>Update this season's information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
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

            <div className="space-y-2">
              <Label htmlFor="edit-seasonNumber" className="text-sm font-medium">
                Season Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-seasonNumber"
                type="number"
                min={1}
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                className={errors.seasonNumber ? "border-destructive" : ""}
              />
              {errors.seasonNumber && <p className="text-sm text-destructive">{errors.seasonNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-season-name" className="text-sm font-medium">Name</Label>
              <Input
                id="edit-season-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Beginning"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-season-slug" className="text-sm font-medium">Slug</Label>
              <Input
                id="edit-season-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={errors.slug ? "border-destructive" : ""}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-season-posterUrl" className="text-sm font-medium">Poster Image URL</Label>
            <Input
              id="edit-season-posterUrl"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/poster.jpg"
              className={errors.posterUrl ? "border-destructive" : ""}
            />
            {errors.posterUrl && <p className="text-sm text-destructive">{errors.posterUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-season-heroImageUrl" className="text-sm font-medium">Hero Image URL</Label>
            <Input
              id="edit-season-heroImageUrl"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/hero.jpg"
              className={errors.heroImageUrl ? "border-destructive" : ""}
            />
            {errors.heroImageUrl && <p className="text-sm text-destructive">{errors.heroImageUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-season-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="edit-season-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter season description..."
              rows={4}
            />
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={editSeason.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={editSeason.isPending}>
              {editSeason.isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
