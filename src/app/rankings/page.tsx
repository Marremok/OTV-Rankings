"use client"

import RankingSection from '@/components/rankings/RankingSection'
import { Clapperboard, Star, Tv, User, Sparkles } from 'lucide-react'

export default function RankingsPage() {
  return (
    <div className="relative min-h-screen bg-background px-4 md:px-0">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-[80px] md:blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-5 md:py-12">
        <header className="relative mb-12 md:mb-16 pt-4 md:pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground mb-3 uppercase">
                Our <span className="text-primary italic">Rankings</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Explore our community driven rankings across TV-Series, Characters and soon to be Episodes and Seasons. 
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3 pb-2">
              <div className="w-24 h-px bg-linear-to-r from-transparent to-primary/30" />
              <Sparkles className="w-4 h-4 text-primary/40" />
            </div>
          </div>
          <div className="mt-6 md:mt-8 h-px w-full bg-linear-to-r from-primary/20 via-primary/5 to-transparent" />
        </header>

        {/* Reduced gap for mobile, larger for desktop */}
        <div className="grid grid-cols-1 md:gap-2">
          <RankingSection title="TV Series" icon={Tv} slug="tv-series" rankingType="series" />
          <RankingSection title="Characters" icon={User} slug="characters" rankingType="characters" />
          <RankingSection title="Seasons" icon={Clapperboard} slug="seasons" rankingType="seasons" />
          <RankingSection title="Episodes" icon={Star} slug="episodes" rankingType="episodes" />
        </div>
      </div>
    </div>
  )
}