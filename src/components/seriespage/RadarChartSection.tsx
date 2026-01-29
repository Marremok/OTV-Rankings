"use client";

import { cn } from "@/lib/utils";
import { Pen, Film, Users, Sparkles, Music, LucideIcon } from "lucide-react";
import { RadarChart, PillarData } from "./RadarChart";

// Placeholder pillar data - will be replaced with real data
const PILLAR_DATA: PillarData[] = [
  { name: "Writing", score: 10, icon: Pen },
  { name: "Directing", score: 9.7, icon: Film },
  { name: "Production", score: 9.5, icon: Users },
  { name: "Characters", score: 9.2, icon: Sparkles },
  { name: "Overall", score: 9.7, icon: Music },
];

interface PillarCardProps {
  pillar: PillarData;
  index: number;
}

/**
 * PillarCard - Individual pillar score display with progress bar
 */
function PillarCard({ pillar, index }: PillarCardProps) {
  const Icon = pillar.icon;
  const isHighScore = pillar.score >= 9.0;
  const isMidScore = pillar.score >= 7.0;

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
            <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors">
              {pillar.name}
            </span>
          </div>

          {/* Score badge */}
          <div className={cn(
            "px-3 py-1 rounded-lg font-bold text-lg tabular-nums transition-all duration-300",
            isHighScore
              ? "bg-emerald-500/10 text-emerald-400"
              : isMidScore
              ? "bg-primary/10 text-primary"
              : "bg-zinc-800 text-zinc-400"
          )}>
            {pillar.score.toFixed(1)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-zinc-800/80 rounded-full overflow-hidden">
          {/* Background shimmer */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          {/* Progress fill */}
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isHighScore
                ? "bg-linear-to-r from-emerald-500 to-emerald-400"
                : isMidScore
                ? "bg-linear-to-r from-primary/80 to-primary"
                : "bg-linear-to-r from-zinc-600 to-zinc-500"
            )}
            style={{ width: `${pillar.score * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * RadarChartSection - Rating breakdown with pentagon chart and pillar list
 * Features striking visuals, glow effects, and smooth animations
 */
export function RadarChartSection() {
  const averageScore = PILLAR_DATA.reduce((acc, p) => acc + p.score, 0) / PILLAR_DATA.length;

  return (
    <section className="relative py-24 px-6 overflow-hidden">
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
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            Detailed scoring across the five core pillars of quality
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
                <RadarChart pillars={PILLAR_DATA} size={340} />
              </div>

              {/* Center score display */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none">
                <div className="text-4xl font-black text-white tabular-nums">
                  {averageScore.toFixed(1)}
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
            {PILLAR_DATA.map((pillar, index) => (
              <PillarCard key={pillar.name} pillar={pillar} index={index} />
            ))}

            {/* Summary footer */}
            <div className="mt-8 pt-6 border-t border-zinc-800/50">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Overall Score</span>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-3xl font-black tabular-nums",
                    averageScore >= 9.0 ? "text-emerald-400" : averageScore >= 7.0 ? "text-primary" : "text-zinc-300"
                  )}>
                    {averageScore.toFixed(1)}
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
