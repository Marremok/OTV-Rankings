"use client";

import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCharacterPillarScores } from "@/hooks/use-pillars";
import { getPillarIcon, getScoreColor, capitalize } from "@/components/seriespage";

interface CharacterRatingSummaryProps {
  slug: string;
}

export function CharacterRatingSummary({ slug }: CharacterRatingSummaryProps) {
  const { data, isLoading } = useGetCharacterPillarScores(slug);

  const pillarEntries = data?.pillarScores ? Object.entries(data.pillarScores) : [];

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (pillarEntries.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-primary/50" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Scores</span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-primary/50" />
          </div>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800/50">
              <BarChart3 className="h-10 w-10 text-zinc-600" />
            </div>
            <p className="text-zinc-500 max-w-md text-center text-sm">
              No community ratings yet. Rate this character below to be the first!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px w-12 bg-linear-to-r from-transparent to-primary/50" />
          <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Scores</span>
          <div className="h-px w-12 bg-linear-to-l from-transparent to-primary/50" />
        </div>

        {/* Score cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillarEntries.map(([type, pillarData], index) => {
            const Icon = getPillarIcon(type);
            const colors = getScoreColor(pillarData.avgScore);

            return (
              <div
                key={type}
                className={cn(
                  "group relative bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6",
                  "hover:border-zinc-700/60 transition-all duration-300",
                  "animate-in fade-in slide-in-from-bottom-4 duration-500"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-primary/8 to-transparent rounded-bl-full" />

                <div className="relative">
                  {/* Header: icon + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-zinc-800/80 rounded-xl">
                      <Icon className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <span className="font-semibold text-zinc-300 text-sm">{capitalize(type)}</span>
                  </div>

                  {/* Score */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={cn("text-4xl font-black tabular-nums", colors.text)}>
                      {pillarData.avgScore.toFixed(2)}
                    </span>
                    <span className="text-zinc-600 text-sm">/ 10</span>
                  </div>

                  {/* Rater count */}
                  <p className="text-xs text-zinc-600 mb-4">
                    {pillarData.raterCount} {pillarData.raterCount === 1 ? "rating" : "ratings"}
                  </p>

                  {/* Progress bar */}
                  <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700 ease-out", colors.bg)}
                      style={{ width: `${pillarData.avgScore * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall score footer */}
        {data?.overallScore != null && data.overallScore > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
            <span className="text-zinc-400 font-medium">Overall Score</span>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-black tabular-nums", getScoreColor(data.overallScore).text)}>
                {data.overallScore.toFixed(2)}
              </span>
              <span className="text-zinc-600">/ 10</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
