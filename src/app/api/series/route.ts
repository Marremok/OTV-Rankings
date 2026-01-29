import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error("Failed to fetch series:", error)
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      description,
      releaseYear,
      imageUrl,
      wideImageUrl,
      slug,
      genre,
      seasons,
    } = body

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    if (slug) {
      const existingSeries = await prisma.series.findUnique({
        where: { slug },
      })
      if (existingSeries) {
        return NextResponse.json(
          { error: "A series with this slug already exists" },
          { status: 400 }
        )
      }
    }

    const series = await prisma.series.create({
      data: {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description?.trim() || null,
        releaseYear: releaseYear ? parseInt(String(releaseYear)) : null,
        imageUrl: imageUrl?.trim() || null,
        wideImageUrl: wideImageUrl?.trim() || null,
        slug: slug?.trim() || null,
        genre: genre || [],
        seasons: seasons ? parseInt(String(seasons)) : null,
        score: 0, // Initial score - will be computed later by the system
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.error("Failed to create series:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create series"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
