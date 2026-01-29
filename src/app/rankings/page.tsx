"use client"

import RankingSection from '@/components/rankings/RankingSection'
import { Clapperboard, Star, Tv, User } from 'lucide-react'

function page() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Rankings</h1>
        <p className="text-muted-foreground max-w-lg">
          Explore our community-driven rankings across TV series, characters, seasons, and episodes.
        </p>
      </div>
      <div className="flex-col">
        <RankingSection title="TV-Series" icon={Tv} slug="tv-series" rankingType="series" />
        <RankingSection title="Characters" icon={User} slug="characters" rankingType="characters" />
        <RankingSection title="Seasons" icon={Clapperboard} slug="seasons" rankingType="seasons" />
        <RankingSection title="Episodes" icon={Star} slug="episodes" rankingType="episodes" />
      </div>
    </div>
  )
}

export default page
