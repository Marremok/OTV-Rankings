"use client";

import { cn } from "@/lib/utils";
import { getPillarIcon, getPillarColor } from "@/components/seriespage/pillar-utils";

// ============================================
// TYPES
// ============================================

export interface PillarData {
  id: string;
  type: string;
  description: string | null;
  weight: number;
  questions: { id: string }[];
}

export interface PillarShowcaseProps {
  pillar: PillarData;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

// ============================================
// COMPONENT: Pillar Showcase
// ============================================

export function PillarShowcase({ pillar, index, isHovered, onHover }: PillarShowcaseProps) {
  // Get icon and color from pillar-utils based on pillar type
  const Icon = getPillarIcon(pillar.type);
  const color = getPillarColor(pillar.type);

  // Capitalize pillar type for display
  const pillarName = pillar.type.charAt(0).toUpperCase() + pillar.type.slice(1);

  return (
    <div
      className={cn(
        "relative group cursor-pointer",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => onHover(pillar.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Outer glow */}
      <div
        className={cn(
          "absolute -inset-1 rounded-2xl blur-xl transition-all duration-700",
          `bg-gradient-to-r ${color}`,
          isHovered ? "opacity-30" : "opacity-0"
        )}
      />

      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl p-5 transition-all duration-500",
          "border bg-zinc-900/70 backdrop-blur-md",
          isHovered
            ? "border-zinc-600/80 scale-[1.03] shadow-xl shadow-black/40"
            : "border-zinc-800/60 hover:border-zinc-700/60"
        )}
      >
        {/* Gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
            color,
            isHovered ? "opacity-10" : "opacity-0"
          )}
        />

        {/* Content */}
        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "shrink-0 p-3 rounded-xl transition-all duration-500",
              "bg-zinc-800/80",
              isHovered && "scale-110"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-xl blur-lg transition-all duration-500",
                `bg-gradient-to-br ${color}`,
                isHovered ? "opacity-40" : "opacity-0"
              )}
            />
            <Icon
              className={cn(
                "relative w-6 h-6 transition-colors duration-500",
                isHovered ? "text-white" : "text-zinc-400"
              )}
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={cn(
                  "font-bold transition-colors duration-300",
                  isHovered ? "text-white" : "text-zinc-200"
                )}
              >
                {pillarName}
              </h4>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  "bg-zinc-800 text-amber-400/80 border border-zinc-700/50"
                )}
              >
                {pillar.weight.toFixed(1)}×
              </span>
            </div>
            <p
              className={cn(
                "text-sm leading-relaxed transition-colors duration-300",
                isHovered ? "text-zinc-300" : "text-zinc-500"
              )}
            >
              {pillar.description || `Evaluates the ${pillar.type} aspects of the series.`}
            </p>
            {/* Question count */}
            <p className="text-xs text-zinc-600 mt-2">
              {pillar.questions.length} question{pillar.questions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Left accent */}
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 w-1 transition-all duration-500",
            `bg-gradient-to-b ${color}`,
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Pillar Skeleton
// ============================================

export function PillarSkeleton({ index }: { index: number }) {
  return (
    <div
      className={cn(
        "relative rounded-xl p-5 border border-zinc-800/60 bg-zinc-900/40",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/60 animate-pulse" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-24 bg-zinc-800/60 rounded animate-pulse" />
            <div className="h-5 w-10 bg-zinc-800/60 rounded-full animate-pulse" />
          </div>
          <div className="h-4 w-full bg-zinc-800/60 rounded animate-pulse mb-1" />
          <div className="h-4 w-3/4 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
