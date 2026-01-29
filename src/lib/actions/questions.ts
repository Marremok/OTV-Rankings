"use server"

import prisma from "../prisma"
import { revalidatePath } from "next/cache"

// ============================================
// QUESTION ACTIONS (Part of Pillar templates)
// ============================================

// Input type for creating a question
export interface CreateQuestionInput {
  title: string
  description?: string | null
  weight?: number
  pillarId: string
}

/**
 * Creates a new question for a pillar template
 */
export async function createQuestion(input: CreateQuestionInput) {
  try {
    // Validate required fields
    if (!input.title || !input.title.trim()) {
      throw new Error("Question title is required")
    }
    if (!input.pillarId) {
      throw new Error("Pillar ID is required")
    }

    // Validate weight if provided
    if (input.weight !== undefined && (input.weight < 0 || input.weight > 10)) {
      throw new Error("Weight must be between 0 and 10")
    }

    // Verify pillar exists
    const pillar = await prisma.pillar.findUnique({
      where: { id: input.pillarId },
    })

    if (!pillar) {
      throw new Error("Pillar not found")
    }

    const question = await prisma.question.create({
      data: {
        id: crypto.randomUUID(),
        title: input.title.trim(),
        description: input.description || null,
        weight: input.weight ?? 1.0,
        pillarId: input.pillarId,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin")

    return question
  } catch (error: any) {
    console.error("Error creating question:", error)

    // Re-throw validation errors
    if (
      error.message?.includes("required") ||
      error.message?.includes("must be") ||
      error.message?.includes("not found")
    ) {
      throw error
    }

    throw new Error("Failed to create question")
  }
}

/**
 * Fetches all questions for a specific pillar
 */
export async function getQuestionsByPillar(pillarId: string) {
  try {
    if (!pillarId) {
      throw new Error("Pillar ID is required")
    }

    const questions = await prisma.question.findMany({
      where: { pillarId },
      orderBy: { createdAt: "asc" },
    })

    return questions
  } catch (error) {
    console.error("Error fetching questions:", error)
    throw new Error("Failed to fetch questions")
  }
}

/**
 * Updates a question
 */
export async function updateQuestion(
  id: string,
  input: Partial<Omit<CreateQuestionInput, "pillarId">>
) {
  try {
    if (!id) {
      throw new Error("Question ID is required")
    }

    // Validate weight if provided
    if (input.weight !== undefined && (input.weight < 0 || input.weight > 10)) {
      throw new Error("Weight must be between 0 and 10")
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.weight !== undefined && { weight: input.weight }),
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin")

    return question
  } catch (error: any) {
    console.error("Error updating question:", error)

    if (error?.code === "P2025") {
      throw new Error("Question not found")
    }

    throw new Error("Failed to update question")
  }
}

/**
 * Deletes a question
 */
export async function deleteQuestion(id: string) {
  try {
    if (!id) {
      throw new Error("Question ID is required")
    }

    await prisma.question.delete({
      where: { id },
    })

    revalidatePath("/admin")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting question:", error)

    if (error?.code === "P2025") {
      throw new Error("Question not found")
    }

    throw new Error("Failed to delete question")
  }
}
