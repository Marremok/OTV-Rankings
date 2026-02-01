"use client";

import { useState } from "react";
import { Tv, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RecentRating, PillarBreakdown, HighestRating } from "@/lib/actions/user";
import { getPillarIcon, getPillarColor } from "@/components/seriespage/pillar-utils";
import { capitalize, getScoreColor, formatDate } from "./utils";

// ============================================
// COMPONENT: Stats Card
// ============================================

export interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  delay?: number;
  isLoading?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = "text-primary",
  delay = 0,
  isLoading = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative group p-5 rounded-xl transition-all duration-500",
        "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
        "hover:border-zinc-700/60 hover:bg-zinc-900/60",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className={cn("w-6 h-6", color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-500 mb-1">{label}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-zinc-800/60 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
          {subtext && <p className="text-xs text-zinc-600 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Recent Rating Card
// ============================================

export interface RecentRatingCardProps {
  rating: RecentRating;
  index: number;
}

export function RecentRatingCard({ rating, index }: RecentRatingCardProps) {
  const scoreColor = getScoreColor(rating.score);
  const formattedDate = formatDate(rating.date);
  const pillarName = capitalize(rating.pillarType);

  return (
    <Link
      href={rating.seriesSlug ? `/series/${rating.seriesSlug}` : "#"}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-500",
        "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
        "hover:border-zinc-700/60 hover:bg-zinc-900/70 hover:scale-[1.01]",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-zinc-800">
        {rating.seriesImageUrl ? (
          <img
            src={rating.seriesImageUrl}
            alt={rating.seriesName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="w-5 h-5 text-zinc-600" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
          {rating.seriesName}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-500">{pillarName}</span>
          <span className="text-zinc-700">•</span>
          <span className="text-xs text-zinc-600">{formattedDate}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span className={cn("text-xl font-bold tabular-nums", scoreColor)}>
          {rating.score.toFixed(2)}
        </span>
        <p className="text-xs text-zinc-600">score</p>
      </div>

      <ChevronRight className="w-5 h-5 text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
    </Link>
  );
}

// ============================================
// COMPONENT: Pillar Breakdown Card
// ============================================

export interface PillarBreakdownCardProps {
  pillar: PillarBreakdown;
  index: number;
}

export function PillarBreakdownCard({ pillar, index }: PillarBreakdownCardProps) {
  const Icon = getPillarIcon(pillar.pillarType);
  const color = getPillarColor(pillar.pillarType);
  const [isHovered, setIsHovered] = useState(false);
  const pillarName = capitalize(pillar.pillarType);

  return (
    <div
      className={cn(
        "relative group p-4 rounded-xl transition-all duration-500",
        "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
        "hover:border-zinc-700/60 hover:bg-zinc-900/60",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-linear-to-br transition-opacity duration-500",
          color,
          isHovered ? "opacity-5" : "opacity-0"
        )}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500",
            "bg-zinc-800/80",
            isHovered && "scale-110"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5 transition-colors duration-300",
              isHovered ? "text-white" : "text-zinc-400"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-zinc-200 text-sm">{pillarName}</h4>
          <p className="text-xs text-zinc-500">{pillar.count} ratings</p>
        </div>

        <div className="text-right">
          <span className="text-lg font-bold text-primary tabular-nums">
            {pillar.avgScore.toFixed(2)}
          </span>
          <p className="text-xs text-zinc-600">avg</p>
        </div>
      </div>

      <div
        className={cn(
          "absolute top-0 bottom-0 left-0 w-1 rounded-l-xl transition-all duration-500",
          `bg-linear-to-b ${color}`,
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

// ============================================
// COMPONENT: Highest Rating Card
// ============================================

export interface HighestRatingCardProps {
  rating: HighestRating | null;
  isLoading?: boolean;
}

export function HighestRatingCard({ rating, isLoading = false }: HighestRatingCardProps) {
  const Icon = rating ? getPillarIcon(rating.pillarType) : Trophy;
  const color = rating ? getPillarColor(rating.pillarType) : "";

  if (isLoading) {
    return (
      <div className="relative p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 rounded-lg bg-zinc-800/60" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-zinc-800/60 rounded mb-2" />
            <div className="h-6 w-32 bg-zinc-800/60 rounded mb-2" />
            <div className="h-3 w-20 bg-zinc-800/60 rounded" />
          </div>
          <div className="text-right">
            <div className="h-8 w-14 bg-zinc-800/60 rounded mb-1" />
            <div className="h-3 w-10 bg-zinc-800/60 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="relative p-5 rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 text-center">
        <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">No ratings yet</p>
        <p className="text-xs text-zinc-600 mt-1">Rate series to see your highest rating</p>
      </div>
    );
  }

  const pillarName = capitalize(rating.pillarType);

  return (
    <Link
      href={rating.seriesSlug ? `/series/${rating.seriesSlug}` : "#"}
      className={cn(
        "group relative block p-5 rounded-xl transition-all duration-500",
        "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
        "hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:scale-[1.01]"
      )}
    >
      {/* linear accent */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-linear-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
          color
        )}
      />

      <div className="relative flex items-start gap-4">
        {/* Series poster */}
        <div className="shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-zinc-800">
          {rating.seriesImageUrl ? (
            <img
              src={rating.seriesImageUrl}
              alt={rating.seriesName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv className="w-6 h-6 text-zinc-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wide">
              Highest Rating
            </span>
          </div>
          <h3 className="font-bold text-foreground truncate group-hover:text-white transition-colors">
            {rating.seriesName}
          </h3>
          <p className="text-sm text-zinc-500">{pillarName}</p>
        </div>

        {/* Score */}
        <div className="shrink-0 text-right">
          <span className="text-2xl font-bold text-emerald-400 tabular-nums">
            {rating.score.toFixed(2)}
          </span>
          <p className="text-xs text-zinc-600">score</p>
        </div>
      </div>

      {/* Left accent bar */}
      <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-xl bg-linear-to-b from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  );
}

// ============================================
// COMPONENT: Loading Skeletons
// ============================================

export function RecentRatingSkeleton({ index }: { index: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "border border-zinc-800/60 bg-zinc-900/40",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="w-12 h-16 rounded-lg bg-zinc-800/60 animate-pulse" />
      <div className="flex-1">
        <div className="h-5 w-32 bg-zinc-800/60 rounded animate-pulse mb-2" />
        <div className="h-3 w-24 bg-zinc-800/60 rounded animate-pulse" />
      </div>
      <div className="text-right">
        <div className="h-7 w-12 bg-zinc-800/60 rounded animate-pulse mb-1" />
        <div className="h-3 w-8 bg-zinc-800/60 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function PillarBreakdownSkeleton({ index }: { index: number }) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-800/60 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-20 bg-zinc-800/60 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-zinc-800/60 rounded animate-pulse" />
        </div>
        <div className="text-right">
          <div className="h-6 w-10 bg-zinc-800/60 rounded animate-pulse mb-1" />
          <div className="h-3 w-6 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
