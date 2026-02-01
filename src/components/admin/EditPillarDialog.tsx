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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useEditPillar } from "@/hooks/use-pillars"
import { mediaType } from "@/generated/prisma/enums"

// Media type labels for display
const MEDIA_TYPE_LABELS: Record<string, string> = {
  SERIES: "TV Series",
  CHARACTER: "Character",
  EPISODE: "Episode",
  SEASON: "Season",
}

export interface PillarData {
  id: string
  type: string
  mediaType: string
  icon: string | null
  description: string | null
  weight: number
}

interface EditPillarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pillar: PillarData | null
  onSuccess?: () => void
}

export function EditPillarDialog({
  open,
  onOpenChange,
  pillar,
  onSuccess,
}: EditPillarDialogProps) {
  const editPillar = useEditPillar()

  // Form state
  const [type, setType] = useState("")
  const [selectedMediaType, setSelectedMediaType] = useState<string>("")
  const [icon, setIcon] = useState("")
  const [description, setDescription] = useState("")
  const [weight, setWeight] = useState("1.0")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when pillar changes
  useEffect(() => {
    if (pillar) {
      setType(pillar.type)
      setSelectedMediaType(pillar.mediaType)
      setIcon(pillar.icon || "")
      setDescription(pillar.description || "")
      setWeight(pillar.weight.toString())
      setErrors({})
    }
  }, [pillar])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!type.trim()) {
      newErrors.type = "Pillar type is required"
    }
    if (!selectedMediaType) {
      newErrors.mediaType = "Please select a media type"
    }
    if (weight) {
      const w = parseFloat(weight)
      if (isNaN(w) || w < 0 || w > 10) {
        newErrors.weight = "Weight must be between 0 and 10"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !pillar) return

    try {
      await editPillar.mutateAsync({
        id: pillar.id,
        type: type.trim(),
        mediaType: selectedMediaType as mediaType,
        icon: icon.trim() || null,
        description: description.trim() || null,
        weight: parseFloat(weight) || 1.0,
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to update pillar" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pillar Template</DialogTitle>
          <DialogDescription>
            Update the pillar template details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type field (required) */}
          <div className="space-y-2">
            <Label htmlFor="edit-type">
              Pillar Type <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Writing, Directing, Acting"
              className={errors.type ? "border-destructive" : ""}
            />
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Media type selection (required) */}
          <div className="space-y-2">
            <Label htmlFor="edit-mediaType">
              Media Type <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
              <SelectTrigger className={errors.mediaType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEDIA_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mediaType && (
              <p className="text-sm text-destructive">{errors.mediaType}</p>
            )}
          </div>

          {/* Icon field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-icon">Icon (optional)</Label>
            <Input
              id="edit-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g., emoji or short text"
            />
          </div>

          {/* Description field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this pillar"
              rows={2}
            />
          </div>

          {/* Weight field */}
          <div className="space-y-2">
            <Label htmlFor="edit-weight">Weight</Label>
            <Input
              id="edit-weight"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={errors.weight ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              How much this pillar affects the overall score (0-10)
            </p>
            {errors.weight && (
              <p className="text-sm text-destructive">{errors.weight}</p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <p className="text-sm text-destructive">{errors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={editPillar.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editPillar.isPending}>
              {editPillar.isPending ? (
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
