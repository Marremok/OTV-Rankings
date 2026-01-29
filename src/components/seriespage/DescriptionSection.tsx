"use client";

import { Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DescriptionSectionProps {
  title: string;
  description?: string | null;
  score: number;
  ranking?: number;
}

/**
 * DescriptionSection - Series overview with rating card and description
 * Clean typography with modern glass-morphism rating card
 */
export function DescriptionSection({ title, description, score, ranking }: DescriptionSectionProps) {
  const scoreColor = score >= 9.0
    ? "text-emerald-400"
    : score >= 7.0
    ? "text-primary"
    : "text-zinc-300";

  const barColor = score >= 9.0
    ? "bg-emerald-400"
    : score >= 7.0
    ? "bg-primary"
    : "bg-zinc-500";

  return (
    <section className="relative py-24 px-6">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb),0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Rating Card */}
          <div className="lg:col-span-4">
            <div className="relative group">
              {/* Card glow effect on hover */}
              <div className="absolute -inset-1 bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 text-center overflow-hidden">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-primary/10 to-transparent rounded-bl-full" />

                {/* Rating header */}
                <div className="relative flex items-center justify-center gap-2 mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                    OTV Rating
                  </span>
                </div>

                {/* Score display */}
                <div className="relative mb-2">
                  <span className={cn(
                    "text-7xl font-black tabular-nums tracking-tight",
                    scoreColor
                  )}>
                    {score.toFixed(2)}
                  </span>
                </div>
                <div className="text-zinc-500 text-lg font-medium mb-8">/ 10</div>

                {/* Score progress bar */}
                <div className="relative h-3 bg-zinc-800/80 rounded-full overflow-hidden mb-6">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      barColor
                    )}
                    style={{ width: `${score * 10}%` }}
                  />
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>

                {/* Ranking badge */}
                {ranking && ranking > 0 && (
                  <div className="flex items-center justify-center gap-2 text-zinc-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Ranked #{ranking} overall
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {/* Section label */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 max-w-15 bg-linear-to-r from-primary to-transparent" />
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
                About the Series
              </h2>
            </div>

            {/* Title echo for context */}
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
              {title}
            </h3>

            {/* Description text */}
            <p className="text-lg md:text-xl leading-relaxed text-zinc-400 font-light">
              {description || "No description available for this series yet. Check back later for updates."}
            </p>

            {/* Decorative element */}
            <div className="mt-10 flex items-center gap-3">
              <div className="w-12 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full" />
              <div className="w-6 h-1 bg-primary/30 rounded-full" />
              <div className="w-3 h-1 bg-primary/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
