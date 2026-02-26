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
import { useCreateEpisode } from "@/hooks/use-episodes"
import { useGetAllSeasons } from "@/hooks/use-seasons"

export interface EpisodeData {
  id: string
  episodeNumber: number
  title: string
  slug: string | null
  description: string | null
  heroImageUrl: string | null
  ranking: number
  score: number
  seasonId: string
  seriesId: string | null
  season?: {
    id: string
    seasonNumber: number
    name: string | null
    series: { id: string; title: string; slug: string | null }
  }
}

interface AddEpisodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEpisode: (episode: EpisodeData) => void
}

export function AddEpisodeDialog({ open, onOpenChange, onAddEpisode }: AddEpisodeDialogProps) {
  const createEpisode = useCreateEpisode()
  const { data: seasonsList, isLoading: isLoadingSeasons } = useGetAllSeasons()

  const [seasonId, setSeasonId] = useState("")
  const [episodeNumber, setEpisodeNumber] = useState("")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    }
  }, [title, slug])

  // Derive seriesId from selected season
  const selectedSeason = seasonsList?.find((s) => s.id === seasonId)
  const derivedSeriesId = selectedSeason?.seriesId || ""

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!seasonId) newErrors.seasonId = "Season is required"

    const num = parseInt(episodeNumber)
    if (!episodeNumber || isNaN(num) || num < 1) {
      newErrors.episodeNumber = "Episode number must be a positive integer"
    }

    if (!title.trim()) newErrors.title = "Title is required"

    if (slug && !/^[a-z0-9-]+$/.test(slug.trim())) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
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
      const newEpisode = await createEpisode.mutateAsync({
        seasonId,
        seriesId: derivedSeriesId,
        episodeNumber: parseInt(episodeNumber),
        title: title.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
      })

      onAddEpisode(newEpisode as EpisodeData)
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to create episode:", error)
      setErrors({ submit: error.message || "Failed to create episode. Please try again." })
    }
  }

  const resetForm = () => {
    setSeasonId("")
    setEpisodeNumber("")
    setTitle("")
    setSlug("")
    setDescription("")
    setHeroImageUrl("")
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Episode</DialogTitle>
          <DialogDescription>Add a new episode to a season</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Season <span className="text-destructive">*</span>
            </Label>
            <Select value={seasonId} onValueChange={setSeasonId}>
              <SelectTrigger className={errors.seasonId ? "border-destructive" : ""}>
                <SelectValue placeholder={isLoadingSeasons ? "Loading seasons..." : "Select a season"} />
              </SelectTrigger>
              <SelectContent>
                {seasonsList?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {(s as any).series?.title} — Season {s.seasonNumber}{s.name ? `: ${s.name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.seasonId && <p className="text-sm text-destructive">{errors.seasonId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="episodeNumber" className="text-sm font-medium">
                Episode Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="episodeNumber"
                type="number"
                min={1}
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                placeholder="e.g. 1"
                className={errors.episodeNumber ? "border-destructive" : ""}
              />
              {errors.episodeNumber && <p className="text-sm text-destructive">{errors.episodeNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="episode-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="episode-title"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setSlug("") }}
                placeholder="Episode title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-slug" className="text-sm font-medium">Slug</Label>
            <Input
              id="episode-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated-from-title"
              className={errors.slug ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              URL identifier (e.g. <span className="font-mono">pilot</span>)
            </p>
            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-heroImageUrl" className="text-sm font-medium">Hero Image URL</Label>
            <Input
              id="episode-heroImageUrl"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/episode-still.jpg"
              className={errors.heroImageUrl ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">Widescreen still or promo image for this episode</p>
            {errors.heroImageUrl && <p className="text-sm text-destructive">{errors.heroImageUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="episode-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Episode synopsis..."
              rows={4}
            />
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createEpisode.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEpisode.isPending}>
              {createEpisode.isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Adding...</>
              ) : "Add Episode"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
