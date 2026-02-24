"use client"

import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

const FLOATING_POSTERS = [
  { id: 1, src: "https://upload.wikimedia.org/wikipedia/en/1/1c/Better_Call_Saul_season_1.jpg", alt: "Better Call Saul", position: "top-[5%] left-[2%] md:top-[8%] md:left-[5%]", size: "w-16 h-24 md:w-28 md:h-40", delay: "0s", duration: "6s" },
  { id: 2, src: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p7894124_b_v8_ab.jpg", alt: "TV Series 2", position: "top-[10%] right-[2%] md:top-[15%] md:right-[8%]", size: "w-14 h-20 md:w-24 md:h-36", delay: "1s", duration: "7s" },
  { id: 3, src: "https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 3", position: "top-[40%] left-[-2%] md:top-[45%] md:left-[3%]", size: "w-12 h-18 md:w-20 md:h-28", delay: "0.5s", duration: "5.5s" },
  { id: 4, src: "https://m.media-amazon.com/images/M/MV5BMTNhMDJmNmYtNDQ5OS00ODdlLWE0ZDAtZTgyYTIwNDY3OTU3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 4", position: "top-[30%] right-[-2%] md:top-[35%] md:right-[4%]", size: "w-14 h-22 md:w-22 md:h-32", delay: "1.5s", duration: "6.5s" },
  { id: 5, src: "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 5", position: "bottom-[15%] left-[2%] md:bottom-[25%] md:left-[8%]", size: "w-16 h-24 md:w-26 md:h-38", delay: "2s", duration: "7.5s" },
  { id: 6, src: "https://serializd-tmdb-images.b-cdn.net/t/p/w500/sCgzLaVlFy8KxtxRPvt1V5MNTDb.jpg", alt: "TV Series 6", position: "bottom-[10%] right-[2%] md:bottom-[20%] md:right-[6%]", size: "w-14 h-22 md:w-24 md:h-34", delay: "0.8s", duration: "6.2s" },
]

function FloatingPoster({ src, alt, position, size, delay, duration }: any) {
  return (
    <div
      className={`absolute ${position} ${size} pointer-events-none opacity-40 md:opacity-85`}
      style={{ animation: `float ${duration} ease-in-out infinite`, animationDelay: delay }}
    >
      <div className="relative w-full h-full rounded-lg md:rounded-xl overflow-hidden shadow-xl border border-white/10">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-16 md:pt-0">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      {/* Background Orbs - Simplified for Mobile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[100px] opacity-40" />
      </div>

      {/* Floating posters */}
      <div className="absolute inset-0 overflow-hidden select-none">
        {FLOATING_POSTERS.map((p) => (
          <FloatingPoster key={p.id} {...p} />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[1.1]">
          OTV <span className="text-primary italic">RANKINGS</span>
        </h1>

        <div className="flex items-center justify-center gap-3 md:gap-4 mb-8">
          <div className="h-px w-8 md:w-16 bg-primary/30" />
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary/40" />
          <div className="h-px w-8 md:w-16 bg-primary/30" />
        </div>

        <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
          Dive into structured ratings for TV series and characters. 
          Every score is backed by our communities deep analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/rankings" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-12 md:h-14 px-10 text-base font-bold shadow-xl shadow-primary/10">
              Browse Rankings
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/methodology" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full h-12 md:h-14 px-8 text-base font-medium border border-white/5">
              Our Methodology
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}