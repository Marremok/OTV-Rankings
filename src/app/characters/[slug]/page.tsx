"use client"

import { useGetCharacterBySlug } from "@/hooks/use-characters"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  CharacterHeader,
  CharacterDescription,
  CharacterRatingSummary,
  CharacterPillarsSection,
} from "@/components/characterspage"

export default function CharacterDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: character, isLoading, isError } = useGetCharacterBySlug(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !character) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-lg text-muted-foreground">Character not found</p>
        <Link href="/rankings/characters" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="size-4" />
          Back to Characters
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-200 h-200 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-150 h-150 rounded-full bg-primary/3 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      <div className="relative">
        <CharacterHeader
          name={character.name}
          posterUrl={character.posterUrl}
          ranking={character.ranking > 0 ? character.ranking : undefined}
          actorName={character.actorName}
          series={character.series}
        />
        <CharacterDescription
          name={character.name}
          description={character.description}
        />
        <CharacterRatingSummary slug={slug} />
        <CharacterPillarsSection characterId={character.id} />
      </div>
    </div>
  )
}
