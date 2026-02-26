"use client"

import Link from "next/link"
import { Tv, User, Layers, Film } from "lucide-react"
import {
  useGetTop10Series,
  useGetTop10Characters,
  useGetTop10Seasons,
  useGetTop10Episodes,
} from "@/hooks/use-rankings"
import { cn } from "@/lib/utils"

interface HeroBoxProps {
  title: string
  href: string
  imageUrl?: string | null
  fallbackIcon: React.ElementType
}

function HeroBox({ title, href, imageUrl, fallbackIcon: Icon }: HeroBoxProps) {
  return (
    <Link
      href={href}
      className="group relative h-56 sm:h-72 overflow-hidden rounded-2xl block"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <Icon className="w-16 h-16 text-zinc-700" />
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 transition-colors group-hover:bg-black/45" />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Centered text */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <h3 className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight leading-tight drop-shadow-lg">
          {title}
        </h3>
      </div>
    </Link>
  )
}

export default function RankedPreview() {
  const { data: series = [] } = useGetTop10Series()
  const { data: characters = [] } = useGetTop10Characters()
  const { data: seasons = [] } = useGetTop10Seasons()
  const { data: episodes = [] } = useGetTop10Episodes()

  const seriesHero = series[0]?.imageUrl
  const charHero = (characters[0] as any)?.heroUrl ?? characters[0]?.posterUrl
  const seasonHero = (seasons[0] as any)?.heroImageUrl ?? (seasons[0] as any)?.posterUrl
  const episodeHero = (episodes[0] as any)?.heroImageUrl

  return (
    <section className={cn("py-20 px-6 border-t border-border/30")}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-1">
            Community Rankings
          </p>
          <h2 className="text-2xl font-bold text-foreground">Top Ranked</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HeroBox
            title="Top 100 Ranked Shows"
            href="/rankings/tv-series"
            imageUrl={seriesHero}
            fallbackIcon={Tv}
          />
          <HeroBox
            title="Top 100 Ranked Characters"
            href="/rankings/characters"
            imageUrl={charHero}
            fallbackIcon={User}
          />
          <HeroBox
            title="Top 100 Ranked Seasons"
            href="/rankings/seasons"
            imageUrl={seasonHero}
            fallbackIcon={Layers}
          />
          <HeroBox
            title="Top 100 Ranked Episodes"
            href="/rankings/episodes"
            imageUrl={episodeHero}
            fallbackIcon={Film}
          />
        </div>
      </div>
    </section>
  )
}
