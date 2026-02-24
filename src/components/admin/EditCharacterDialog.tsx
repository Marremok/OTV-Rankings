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
import { useEditCharacter } from "@/hooks/use-characters"
import { useGetAllSeries } from "@/hooks/use-series"

export interface CharacterData {
  id: string
  name: string
  slug: string | null
  actorName: string | null
  description: string | null
  posterUrl: string | null
  ranking: number
  seriesId: string
  series?: {
    id: string
    title: string
    slug: string | null
  }
}

interface EditCharacterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character: CharacterData | null
  onSuccess: () => void
}

export function EditCharacterDialog({
  open,
  onOpenChange,
  character,
  onSuccess,
}: EditCharacterDialogProps) {
  const editCharacter = useEditCharacter()
  const { data: seriesList, isLoading: isLoadingSeries } = useGetAllSeries()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [actorName, setActorName] = useState("")
  const [description, setDescription] = useState("")
  const [posterUrl, setPosterUrl] = useState("")
  const [seriesId, setSeriesId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when character data changes
  useEffect(() => {
    if (character) {
      setName(character.name || "")
      setSlug(character.slug || "")
      setActorName(character.actorName || "")
      setDescription(character.description || "")
      setPosterUrl(character.posterUrl || "")
      setSeriesId(character.seriesId || "")
      setErrors({})
    }
  }, [character])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!seriesId) {
      newErrors.seriesId = "Series is required"
    }

    if (slug && !/^[a-z0-9-]+$/.test(slug.trim())) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (posterUrl && posterUrl.trim()) {
      try {
        new URL(posterUrl)
      } catch {
        newErrors.posterUrl = "Please enter a valid URL"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!character || !validateForm()) return

    try {
      await editCharacter.mutateAsync({
        id: character.id,
        name: name.trim(),
        slug: slug.trim() || null,
        actorName: actorName.trim() || null,
        description: description.trim() || null,
        posterUrl: posterUrl.trim() || null,
        seriesId,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to update character:", error)
      setErrors({ submit: error.message || "Failed to update character. Please try again." })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Character</DialogTitle>
          <DialogDescription>
            Update character information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Series Selection */}
            <div className="space-y-2">
              <Label htmlFor="edit-series" className="text-sm font-medium">
                Series <span className="text-destructive">*</span>
              </Label>
              <Select value={seriesId} onValueChange={setSeriesId}>
                <SelectTrigger className={errors.seriesId ? "border-destructive" : ""}>
                  <SelectValue placeholder={isLoadingSeries ? "Loading series..." : "Select a series"} />
                </SelectTrigger>
                <SelectContent>
                  {seriesList?.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.seriesId && (
                <p className="text-sm text-destructive">{errors.seriesId}</p>
              )}
            </div>
          </div>

          {/* Slug + Actor Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-slug" className="text-sm font-medium">
                Slug
              </Label>
              <Input
                id="edit-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-name"
                className={errors.slug ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier (e.g. <span className="font-mono">walter-white</span>)
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-actorName" className="text-sm font-medium">
                Actor / Actress
              </Label>
              <Input
                id="edit-actorName"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="e.g. Bryan Cranston"
              />
              <p className="text-xs text-muted-foreground">
                The real-life actor who portrays this character
              </p>
            </div>
          </div>

          {/* Poster URL */}
          <div className="space-y-2">
            <Label htmlFor="edit-posterUrl" className="text-sm font-medium">
              Poster Image URL
            </Label>
            <Input
              id="edit-posterUrl"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://example.com/character-image.jpg"
              className={errors.posterUrl ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Character portrait image (recommended 2:3 aspect ratio)
            </p>
            {errors.posterUrl && (
              <p className="text-sm text-destructive">{errors.posterUrl}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter character description..."
              rows={4}
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={editCharacter.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editCharacter.isPending}>
              {editCharacter.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
