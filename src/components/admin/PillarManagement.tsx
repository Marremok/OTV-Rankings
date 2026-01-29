"use client"
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, Layers, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { useCreatePillar, useGetAllPillars } from "@/hooks/use-pillars"
import { mediaType } from "@/generated/prisma/enums"
import { QuestionList, AddQuestionDialog } from "./QuestionManagement"

// Pillar template type with questions
interface PillarWithQuestions {
  id: string
  type: string
  mediaType: string
  icon: string | null
  description: string | null
  weight: number
  questions: {
    id: string
    title: string
    description: string | null
    weight: number
  }[]
}

// Media type labels for display
const MEDIA_TYPE_LABELS: Record<string, string> = {
  SERIES: "TV Series",
  CHARACTER: "Character",
  EPISODE: "Episode",
  SEASON: "Season",
}

function PillarManagement() {
  const { data: pillars, isLoading, error, refetch } = useGetAllPillars()
  const createPillar = useCreatePillar()

  // Dialog state
  const [pillarDialogOpen, setPillarDialogOpen] = useState(false)
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(null)

  // Expanded pillar state (to show/hide questions)
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set())

  // Pillar form state
  const [type, setType] = useState("")
  const [selectedMediaType, setSelectedMediaType] = useState<string>("")
  const [icon, setIcon] = useState("")
  const [description, setDescription] = useState("")
  const [weight, setWeight] = useState("1.0")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Toggle pillar expansion
  const togglePillarExpansion = (pillarId: string) => {
    setExpandedPillars((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(pillarId)) {
        newSet.delete(pillarId)
      } else {
        newSet.add(pillarId)
      }
      return newSet
    })
  }

  // Validate pillar form
  const validatePillarForm = () => {
    const errors: Record<string, string> = {}

    if (!type.trim()) {
      errors.type = "Pillar type is required"
    }
    if (!selectedMediaType) {
      errors.mediaType = "Please select a media type"
    }
    if (weight) {
      const w = parseFloat(weight)
      if (isNaN(w) || w < 0 || w > 10) {
        errors.weight = "Weight must be between 0 and 10"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle pillar form submission
  const handlePillarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePillarForm()) return

    try {
      await createPillar.mutateAsync({
        type: type.trim(),
        mediaType: selectedMediaType as mediaType,
        icon: icon.trim() || null,
        description: description.trim() || null,
        weight: parseFloat(weight) || 1.0,
      })

      resetPillarForm()
      setPillarDialogOpen(false)
    } catch (error: any) {
      setFormErrors({ submit: error.message || "Failed to create pillar" })
    }
  }

  // Reset pillar form
  const resetPillarForm = () => {
    setType("")
    setSelectedMediaType("")
    setIcon("")
    setDescription("")
    setWeight("1.0")
    setFormErrors({})
  }

  // Open add question dialog for a specific pillar
  const openAddQuestionDialog = (pillarId: string) => {
    setSelectedPillarId(pillarId)
    setQuestionDialogOpen(true)
  }

  return (
    <>
      <Card className="mb-12">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-6 text-primary" />
              Pillar Templates
            </CardTitle>
            <CardDescription className="mt-2">
              Manage rating pillar templates for different media types
            </CardDescription>
          </div>
          <Button
            onClick={() => setPillarDialogOpen(true)}
            className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          >
            <PlusIcon className="mr-1 size-4" />
            Add Pillar
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="size-12 mx-auto mb-4 animate-spin opacity-50" />
              <p>Loading pillars...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load pillars. Please try again.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : !pillars || pillars.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="size-12 mx-auto mb-4 opacity-20" />
              <p>No pillar templates created yet. Click "Add Pillar" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-150 overflow-y-auto pr-2">
              {(pillars as PillarWithQuestions[]).map((pillar) => (
                <div
                  key={pillar.id}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  {/* Pillar header */}
                  <div
                    className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => togglePillarExpansion(pillar.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-10 rounded-md bg-primary/10 text-primary font-medium">
                        {pillar.icon || pillar.type.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground capitalize">
                          {pillar.type}
                        </h3>
                        {pillar.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {pillar.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                        {MEDIA_TYPE_LABELS[pillar.mediaType] || pillar.mediaType}
                      </span>
                      <div className="text-muted-foreground">
                        Weight: <span className="font-medium text-foreground">{pillar.weight}</span>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">{pillar.questions?.length || 0}</span> questions
                      </div>
                      {expandedPillars.has(pillar.id) ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded section with questions */}
                  {expandedPillars.has(pillar.id) && (
                    <QuestionList
                      questions={pillar.questions || []}
                      pillarId={pillar.id}
                      onAddQuestion={openAddQuestionDialog}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Pillar Dialog */}
      <Dialog open={pillarDialogOpen} onOpenChange={setPillarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Pillar Template</DialogTitle>
            <DialogDescription>
              Create a rating pillar template for a specific media type
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePillarSubmit} className="space-y-4">
            {/* Type field (required) */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Pillar Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., Writing, Directing, Acting"
                className={formErrors.type ? "border-destructive" : ""}
              />
              {formErrors.type && (
                <p className="text-sm text-destructive">{formErrors.type}</p>
              )}
            </div>

            {/* Media type selection (required) */}
            <div className="space-y-2">
              <Label htmlFor="mediaType">
                Media Type <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
                <SelectTrigger className={formErrors.mediaType ? "border-destructive" : ""}>
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
              {formErrors.mediaType && (
                <p className="text-sm text-destructive">{formErrors.mediaType}</p>
              )}
            </div>

            {/* Icon field (optional) */}
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g., emoji or short text"
              />
            </div>

            {/* Description field (optional) */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this pillar"
                rows={2}
              />
            </div>

            {/* Weight field */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={formErrors.weight ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                How much this pillar affects the overall score (0-10)
              </p>
              {formErrors.weight && (
                <p className="text-sm text-destructive">{formErrors.weight}</p>
              )}
            </div>

            {/* Submit error */}
            {formErrors.submit && (
              <p className="text-sm text-destructive">{formErrors.submit}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPillarDialogOpen(false)}
                disabled={createPillar.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPillar.isPending}>
                {createPillar.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Pillar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <AddQuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        pillarId={selectedPillarId}
      />
    </>
  )
}

export default PillarManagement
