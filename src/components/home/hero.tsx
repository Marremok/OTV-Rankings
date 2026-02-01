import { ArrowRight, BarChart3, ChartColumnStacked, Sparkles, Tv } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

// Floating poster configuration - easy to plug in images later
const FLOATING_POSTERS = [
  { id: 1, src: "https://upload.wikimedia.org/wikipedia/en/1/1c/Better_Call_Saul_season_1.jpg", alt: "TV Series 1", position: "top-[8%] left-[5%]", size: "w-28 h-40", delay: "0s", duration: "6s" },
  { id: 2, src: "https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p7894124_b_v8_ab.jpg", alt: "TV Series 2", position: "top-[15%] right-[8%]", size: "w-24 h-36", delay: "1s", duration: "7s" },
  { id: 3, src: "https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 3", position: "top-[45%] left-[3%]", size: "w-20 h-28", delay: "0.5s", duration: "5.5s" },
  { id: 4, src: "https://m.media-amazon.com/images/M/MV5BMTNhMDJmNmYtNDQ5OS00ODdlLWE0ZDAtZTgyYTIwNDY3OTU3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 4", position: "top-[35%] right-[4%]", size: "w-22 h-32", delay: "1.5s", duration: "6.5s" },
  { id: 5, src: "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 5", position: "bottom-[25%] left-[8%]", size: "w-26 h-38", delay: "2s", duration: "7.5s" },
  { id: 6, src: "https://serializd-tmdb-images.b-cdn.net/t/p/w500/sCgzLaVlFy8KxtxRPvt1V5MNTDb.jpg", alt: "TV Series 6", position: "bottom-[20%] right-[6%]", size: "w-24 h-34", delay: "0.8s", duration: "6.2s" },
  { id: 7, src: "https://m.media-amazon.com/images/M/MV5BYTY4YTVkY2QtMjRmOS00YzliLWIxOWQtMTdkOTVkN2UzODNmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", alt: "TV Series 7", position: "top-[60%] right-[12%]", size: "w-18 h-26", delay: "2.5s", duration: "5.8s" },
  { id: 8, src: "https://m.media-amazon.com/images/M/MV5BZmZhY2ViYzYtMTQ0NS00NDcyLWIxZTYtMGUyODE0NDA0NmNkXkEyXkFqcGc@._V1_.jpg", alt: "TV Series 8", position: "bottom-[35%] left-[12%]", size: "w-20 h-30", delay: "1.2s", duration: "6.8s" },
]

function FloatingPoster({
  src,
  alt,
  position,
  size,
  delay,
  duration
}: {
  src: string
  alt: string
  position: string
  size: string
  delay: string
  duration: string
}) {
  return (
    <div
      className={`absolute ${position} ${size} pointer-events-none`}
      style={{
        animation: `float ${duration} ease-in-out infinite`,
        animationDelay: delay,
      }}
    >
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-zinc-900/80 backdrop-blur-sm transition-transform duration-700 hover:scale-105">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          // Placeholder when no image is set
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 via-primary/5 to-zinc-900">
            <Tv className="w-8 h-8 text-primary/30" />
          </div>
        )}
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary/10" />
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* CSS for float animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(1deg);
          }
          50% {
            transform: translateY(-8px) rotate(-0.5deg);
          }
          75% {
            transform: translateY(-20px) rotate(0.5deg);
          }
        }
      `}</style>

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-muted to-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* GRADIENT ORBS */}
      <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-primary/10 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[150px]" />

      {/* FLOATING TV SERIES POSTERS */}
      <div className="absolute inset-0 overflow-hidden">
        {FLOATING_POSTERS.map((poster) => (
          <FloatingPoster
            key={poster.id}
            src={poster.src}
            alt={poster.alt}
            position={poster.position}
            size={poster.size}
            delay={poster.delay}
            duration={poster.duration}
          />
        ))}
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
