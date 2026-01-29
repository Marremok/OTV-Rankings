"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { PlusIcon, Loader2, HelpCircle } from "lucide-react"
import { useCreateQuestion } from "@/hooks/use-pillars"

// Question type
export interface Question {
  id: string
  title: string
  description: string | null
  weight: number
}

interface QuestionListProps {
  questions: Question[]
  pillarId: string
  onAddQuestion: (pillarId: string) => void
}

export function QuestionList({ questions, pillarId, onAddQuestion }: QuestionListProps) {
  return (
    <div className="border-t border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">Questions</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onAddQuestion(pillarId)
          }}
        >
          <PlusIcon className="mr-1 size-3" />
          Add Question
        </Button>
      </div>

      {questions && questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-center gap-3 p-3 rounded-md bg-background border border-border"
            >
              <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{question.title}</p>
                {question.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {question.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Weight: {question.weight}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <HelpCircle className="size-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No questions yet. Add questions to define rating criteria.</p>
        </div>
      )}
    </div>
  )
}

interface AddQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pillarId: string | null
}

export function AddQuestionDialog({ open, onOpenChange, pillarId }: AddQuestionDialogProps) {
  const createQuestion = useCreateQuestion()

  // Question form state
  const [questionTitle, setQuestionTitle] = useState("")
  const [questionDescription, setQuestionDescription] = useState("")
  const [questionWeight, setQuestionWeight] = useState("1.0")
  const [questionFormErrors, setQuestionFormErrors] = useState<Record<string, string>>({})

  // Validate question form
  const validateQuestionForm = () => {
    const errors: Record<string, string> = {}

    if (!questionTitle.trim()) {
      errors.title = "Question title is required"
    }
    if (questionWeight) {
      const w = parseFloat(questionWeight)
      if (isNaN(w) || w < 0 || w > 10) {
        errors.weight = "Weight must be between 0 and 10"
      }
    }

    setQuestionFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Reset question form
  const resetQuestionForm = () => {
    setQuestionTitle("")
    setQuestionDescription("")
    setQuestionWeight("1.0")
    setQuestionFormErrors({})
  }

  // Handle question form submission
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateQuestionForm() || !pillarId) return

    try {
      await createQuestion.mutateAsync({
        title: questionTitle.trim(),
        description: questionDescription.trim() || null,
        weight: parseFloat(questionWeight) || 1.0,
        pillarId: pillarId,
      })

      resetQuestionForm()
      onOpenChange(false)
    } catch (error: any) {
      setQuestionFormErrors({ submit: error.message || "Failed to create question" })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) resetQuestionForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
          <DialogDescription>
            Add a question to define rating criteria for this pillar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleQuestionSubmit} className="space-y-4">
          {/* Title field (required) */}
          <div className="space-y-2">
            <Label htmlFor="questionTitle">
              Question Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="questionTitle"
              value={questionTitle}
              onChange={(e) => setQuestionTitle(e.target.value)}
              placeholder="e.g., How well-developed are the characters?"
              className={questionFormErrors.title ? "border-destructive" : ""}
            />
            {questionFormErrors.title && (
              <p className="text-sm text-destructive">{questionFormErrors.title}</p>
            )}
          </div>

          {/* Description field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="questionDescription">Description (optional)</Label>
            <Textarea
              id="questionDescription"
              value={questionDescription}
              onChange={(e) => setQuestionDescription(e.target.value)}
              placeholder="Additional context for this question"
              rows={2}
            />
          </div>

          {/* Weight field */}
          <div className="space-y-2">
            <Label htmlFor="questionWeight">Weight</Label>
            <Input
              id="questionWeight"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={questionWeight}
              onChange={(e) => setQuestionWeight(e.target.value)}
              className={questionFormErrors.weight ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              How much this question affects the pillar score (0-10)
            </p>
            {questionFormErrors.weight && (
              <p className="text-sm text-destructive">{questionFormErrors.weight}</p>
            )}
          </div>

          {/* Submit error */}
          {questionFormErrors.submit && (
            <p className="text-sm text-destructive">{questionFormErrors.submit}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createQuestion.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createQuestion.isPending}>
              {createQuestion.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Question"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
