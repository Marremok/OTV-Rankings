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
import { useEditEpisode } from "@/hooks/use-episodes"
import { useGetAllSeasons } from "@/hooks/use-seasons"
import type { EpisodeData } from "./AddEpisodeDialog"

interface EditEpisodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  episode: EpisodeData | null
  onSuccess: () => void
}

export function EditEpisodeDialog({ open, onOpenChange, episode, onSuccess }: EditEpisodeDialogProps) {
  const editEpisode = useEditEpisode()
  const { data: seasonsList, isLoading: isLoadingSeasons } = useGetAllSeasons()

  const [seasonId, setSeasonId] = useState("")
  const [episodeNumber, setEpisodeNumber] = useState("")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (episode) {
      setSeasonId(episode.seasonId)
      setEpisodeNumber(String(episode.episodeNumber))
      setTitle(episode.title)
      setSlug(episode.slug || "")
      setDescription(episode.description || "")
      setHeroImageUrl(episode.heroImageUrl || "")
      setErrors({})
    }
  }, [episode])

  const selectedSeason = seasonsList?.find((s) => s.id === seasonId)
  const derivedSeriesId = selectedSeason?.seriesId || episode?.seriesId || ""

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
    if (!episode || !validateForm()) return

    try {
      await editEpisode.mutateAsync({
        id: episode.id,
        seasonId,
        seriesId: derivedSeriesId,
        episodeNumber: parseInt(episodeNumber),
        title: title.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        heroImageUrl: heroImageUrl.trim() || null,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to update episode:", error)
      setErrors({ submit: error.message || "Failed to update episode. Please try again." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Episode</DialogTitle>
          <DialogDescription>Update this episode's information</DialogDescription>
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
              <Label htmlFor="edit-episodeNumber" className="text-sm font-medium">
                Episode Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-episodeNumber"
                type="number"
                min={1}
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                className={errors.episodeNumber ? "border-destructive" : ""}
              />
              {errors.episodeNumber && <p className="text-sm text-destructive">{errors.episodeNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-episode-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-episode-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-episode-slug" className="text-sm font-medium">Slug</Label>
            <Input
              id="edit-episode-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={errors.slug ? "border-destructive" : ""}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-episode-heroImageUrl" className="text-sm font-medium">Hero Image URL</Label>
            <Input
              id="edit-episode-heroImageUrl"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/episode-still.jpg"
              className={errors.heroImageUrl ? "border-destructive" : ""}
            />
            {errors.heroImageUrl && <p className="text-sm text-destructive">{errors.heroImageUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-episode-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="edit-episode-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Episode synopsis..."
              rows={4}
            />
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={editEpisode.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={editEpisode.isPending}>
              {editEpisode.isPending ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
