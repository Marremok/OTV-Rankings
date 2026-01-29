import { ArrowRight, BarChart3, ChartColumnStacked, Film, Sparkles, Star, Trophy, Tv, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-muted to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* GRADIENT ORBS */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-primary/10 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[150px]" />

      {/* FLOATING DECORATIVE ICONS */}
      <div className="absolute top-[15%] left-[10%] text-primary/20 animate-bounce animation-duration-[3s]">
        <Tv className="w-10 h-10" />
      </div>
      <div className="absolute top-[20%] right-[12%] text-primary/15 animate-bounce animation-duration-[4s] [animation-delay:0.5s]">
        <Star className="w-8 h-8" />
      </div>
      <div className="absolute bottom-[25%] left-[8%] text-primary/15 animate-bounce animation-duration-[3.5s] [animation-delay:1s]">
        <Film className="w-9 h-9" />
      </div>
      <div className="absolute bottom-[20%] right-[10%] text-primary/20 animate-bounce animation-duration-[4.5s] [animation-delay:0.3s]">
        <Trophy className="w-10 h-10" />
      </div>
      <div className="absolute top-[40%] right-[5%] text-primary/10 animate-bounce animation-duration-[5s] [animation-delay:1.5s]">
        <BarChart3 className="w-7 h-7" />
      </div>
      <div className="absolute top-[35%] left-[5%] text-primary/10 animate-bounce animation-duration-[4s] [animation-delay:2s]">
        <Sparkles className="w-8 h-8" />
      </div>

      {/* DIAGONAL ACCENT LINES */}
      <div className="absolute top-0 left-1/3 w-px h-full bg-linear-to-b from-transparent via-primary/10 to-transparent rotate-12 origin-top" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-linear-to-b from-transparent via-primary/10 to-transparent -rotate-12 origin-top" />

      {/* CONTENT */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        {/* STATUS BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Structured TV Rankings &mdash; Live Now
          </span>
        </div>

        {/* HEADING */}
        <h1 className="text-6xl md:text-7xl lg:text-9xl font-black tracking-tighter text-foreground mb-2">
          OTV
          <span className="text-primary">-</span>
          Rankings
        </h1>

        {/* SUBHEADING */}
        <p className="text-lg md:text-xl font-medium text-primary/80 tracking-widest uppercase mb-6">
          Rate &bull; Rank &bull; Discover
        </p>

        {/* DIVIDER */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-px bg-linear-to-r from-transparent to-primary/40" />
          <Sparkles className="w-4 h-4 text-primary/50" />
          <div className="w-16 h-px bg-linear-to-l from-transparent to-primary/40" />
        </div>

        {/* DESCRIPTION */}
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-4">
          Comprehensive ratings across five pillars: <span className="text-foreground font-semibold">Writing</span>, <span className="text-foreground font-semibold">Directing</span>, <span className="text-foreground font-semibold">Production</span>, <span className="text-foreground font-semibold">Characters</span>, and <span className="text-foreground font-semibold">Overall Experience</span>.
        </p>
        <p className="text-base text-muted-foreground/70 max-w-2xl mx-auto mb-10">
          No more arbitrary scores. Every show gets a fair, structured breakdown so you can find your next obsession with confidence.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
          <Link href="/rankings">
            <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20">
              View Rankings
              <ArrowRight className="ml-1" />
            </Button>
          </Link>
          <Link href="/support-us">
            <Button variant="outline" size="lg" className="text-base px-8 py-6 border-primary/30 hover:bg-primary/10">
              Support Us
            </Button>
          </Link>
        </div>

        {/* STATS ROW */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-14">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Tv className="w-5 h-5" />
              <span className="text-2xl font-bold text-foreground">100+</span>
            </div>
            <span className="text-sm text-muted-foreground">Shows Ranked</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-primary">
              <ChartColumnStacked className="w-5 h-5" />
              <span className="text-2xl font-bold text-foreground">5</span>
            </div>
            <span className="text-sm text-muted-foreground">Rating Pillars</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="w-5 h-5" />
              <span className="text-2xl font-bold text-foreground">0</span>
            </div>
            <span className="text-sm text-muted-foreground">Arbitrary Scores</span>
          </div>
        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  )
}

export default Hero
