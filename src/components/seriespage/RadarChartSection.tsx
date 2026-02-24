"use client";

import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { RadarChart, PillarData } from "./RadarChart";
import { useState, useEffect } from "react";
import { SeriesPillarScores } from "@/lib/actions/scoring";
import { getPillarIcon, capitalize, getScoreColor } from "./pillar-utils";

interface PillarCardProps {
  pillar: PillarData;
  index: number;
}

/**
 * PillarCard - Individual pillar score display with progress bar
 */
function PillarCard({ pillar, index }: PillarCardProps) {
  const Icon = pillar.icon;
  const colors = getScoreColor(pillar.score);

  return (
    <div
      className={cn(
        "group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-5",
        "hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-300",
        "animate-in fade-in slide-in-from-right-4 duration-500"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon container with linear border */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/30 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-2.5 bg-zinc-800/80 rounded-xl group-hover:bg-zinc-800 transition-colors">
                <Icon className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors duration-300" />
              </div>
            </div>
            <div>
              <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors block">
                {pillar.name}
              </span>
            </div>
          </div>

          {/* Score badge */}
          <div className={cn(
            "px-3 py-1 rounded-lg font-bold text-lg tabular-nums transition-all duration-300",
            colors.bgSubtle, colors.text
          )}>
            {pillar.score.toFixed(2)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-zinc-800/80 rounded-full overflow-hidden">
          {/* Background shimmer */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {/* Progress fill */}
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", colors.bg)}
            style={{ width: `${pillar.score * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state when no ratings exist yet
 */
function EmptyRatingsState() {
  return (
    <section className="relative py-12 px-4 md:py-24 md:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-primary/50" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
              Analysis
            </span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-primary/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Rating Breakdown
          </h2>
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <BarChart3 className="h-12 w-12 text-zinc-600" />
            </div>
            <p className="text-zinc-500 max-w-md">
              No ratings yet. Be the first to rate this series and contribute to the breakdown!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface RadarChartSectionProps {
  pillarScores?: SeriesPillarScores | null;
  overallScore?: number;
}

/**
 * RadarChartSection - Rating breakdown with pentagon chart and pillar list
 * Features striking visuals, glow effects, and smooth animations
 */
export function RadarChartSection({ pillarScores, overallScore = 0 }: RadarChartSectionProps) {
  const [chartSize, setChartSize] = useState(340);

  useEffect(() => {
    const update = () => setChartSize(window.innerWidth < 640 ? 280 : 340);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Convert pillarScores to PillarData array for the chart
  const pillarData: PillarData[] = pillarScores
    ? Object.entries(pillarScores).map(([type, data]) => ({
        name: capitalize(type),
        score: data.avgScore,
        icon: getPillarIcon(type),
        raterCount: data.raterCount,
      }))
    : [];

  // Calculate total unique raters (approximate - max of any pillar's count)
  const totalRaters = pillarData.length > 0
    ? Math.max(...pillarData.map(p => p.raterCount ?? 0))
    : 0;

  // Show empty state if no ratings
  if (pillarData.length === 0) {
    return <EmptyRatingsState />;
  }

  // Calculate average from pillar scores (or use provided overall score)
  const averageScore = overallScore ||
    (pillarData.length > 0
      ? pillarData.reduce((acc, p) => acc + p.score, 0) / pillarData.length
      : 0);

  return (
    <section className="relative py-12 px-4 md:py-24 md:px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient from center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_60%)]" />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-zinc-950 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-zinc-950 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-8 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-primary/50" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
              Analysis
            </span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-primary/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Rating Breakdown
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Detailed scoring across {pillarData.length} rating {pillarData.length === 1 ? 'pillar' : 'pillars'}
            {totalRaters > 0 && (
              <span className="block mt-1 text-zinc-600">
                {`${totalRaters >= 1000 ? Math.floor(totalRaters / 1000) + 'k' : totalRaters} ${
                    totalRaters === 1 ? 'community rating' : 'community ratings'
                }`}
              </span>
            )}
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Radar Chart Container */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-100 h-100 border border-zinc-800/30 rounded-full" />
                <div className="absolute w-112.5 h-112.5 border border-zinc-800/20 rounded-full" />
              </div>

              {/* Chart */}
              <div className="relative z-10">
                <RadarChart pillars={pillarData} size={chartSize} />
              </div>

              {/* Center score display */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
                <div className="text-4xl font-black text-white tabular-nums">
                  {averageScore.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                  Average
                </div>
              </div>
            </div>
          </div>

          {/* Pillar List */}
          <div className="space-y-4">
            {/* List header */}
            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Pillar
              </span>
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                Score
              </span>
            </div>

            {/* Pillar cards */}
            {pillarData.map((pillar, index) => (
              <PillarCard key={pillar.name} pillar={pillar} index={index} />
            ))}

            {/* Summary footer */}
            <div className="mt-8 pt-6 border-t border-zinc-800/50">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Overall Score</span>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-black tabular-nums", getScoreColor(averageScore).text)}>
                    {averageScore.toFixed(2)}
                  </span>
                  <span className="text-zinc-600">/ 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
