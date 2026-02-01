"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Star, ChevronRight, Check } from "lucide-react";
import { Pillar, getScoreColor } from "./pillar-utils";

// ============================================
// PILLAR CARD COMPONENT (Cinematic Full-Width Design)
// ============================================

interface PillarCardProps {
  pillar: Pillar;
  index: number;
  onSelect: (pillar: Pillar) => void;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  existingScore?: number;
  disabled?: boolean;
}

export function PillarCard({
  pillar,
  index,
  onSelect,
  isHovered,
  onHover,
  existingScore,
  disabled = false,
}: PillarCardProps) {
  const Icon = pillar.icon;
  const hasExistingRating = existingScore !== undefined;
  const scoreColors = hasExistingRating ? getScoreColor(existingScore) : null;

  // Use pillar weight directly from database
  const pillarWeight = pillar.weight.toFixed(1);

  return (
    <div
      className={cn(
        "group relative w-full",
        disabled ? "cursor-default" : "cursor-pointer",
        "animate-in fade-in slide-in-from-bottom-6 duration-700"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => onHover(pillar.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => !disabled && onSelect(pillar)}
    >
      {/* Outer glow effect on hover */}
      <div
        className={cn(
          "absolute -inset-1 rounded-3xl blur-xl transition-all duration-700 ease-out",
          `bg-linear-to-r ${pillar.color}`,
          isHovered ? "opacity-25 scale-105" : "opacity-0 scale-100"
        )}
      />

      {/* Main card container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-500 ease-out",
          "border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-md",
          isHovered
            ? "scale-[1.015] border-zinc-600/80 bg-zinc-900/90 shadow-2xl shadow-black/50"
            : "hover:border-zinc-700/60 hover:bg-zinc-900/70"
        )}
      >
        {/* Gradient background overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br opacity-0 transition-all duration-700",
            pillar.color,
            isHovered ? "opacity-8" : "group-hover:opacity-5"
          )}
        />

        {/* Corner accent highlights on hover */}
        <div
          className={cn(
            "absolute top-0 left-0 w-16 h-16 pointer-events-none transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className={cn("absolute top-0 left-0 w-8 h-px bg-linear-to-r", pillar.color)} />
          <div className={cn("absolute top-0 left-0 w-px h-8 bg-linear-to-b", pillar.color)} />
        </div>
        <div
          className={cn(
            "absolute bottom-0 right-0 w-16 h-16 pointer-events-none transition-opacity duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className={cn("absolute bottom-0 right-0 w-8 h-px bg-linear-to-l", pillar.color)} />
          <div className={cn("absolute bottom-0 right-0 w-px h-8 bg-linear-to-t", pillar.color)} />
        </div>

        {/* Content layout - horizontal on larger screens */}
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-5 sm:p-6">
          {/* Left section: Icon with glow */}
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Icon container */}
            <div
              className={cn(
                "relative shrink-0 p-4 rounded-2xl transition-all duration-500",
                "bg-zinc-800/80",
                isHovered && "scale-110 bg-zinc-800"
              )}
            >
              {/* Icon glow */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl blur-lg transition-all duration-500",
                  `bg-linear-to-br ${pillar.color}`,
                  isHovered ? "opacity-50" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "relative h-7 w-7 transition-all duration-500",
                  isHovered ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                )}
              />
            </div>

            {/* Title and weight (mobile layout) */}
            <div className="sm:hidden flex-1">
              <h3
                className={cn(
                  "text-xl font-bold transition-colors duration-300",
                  isHovered ? "text-white" : "text-zinc-200 group-hover:text-white"
                )}
              >
                {pillar.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Weight</span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums transition-colors",
                    isHovered ? "text-amber-300" : "text-amber-400/80"
                  )}
                >
                  {pillarWeight}×
                </span>
              </div>
            </div>
          </div>

          {/* Middle section: Title, description, metadata */}
          <div className="flex-1 min-w-0">
            {/* Title row (desktop) */}
            <div className="hidden sm:flex items-center gap-4 mb-2">
              <h3
                className={cn(
                  "text-2xl font-bold transition-colors duration-300 truncate",
                  isHovered ? "text-white" : "text-zinc-200 group-hover:text-white"
                )}
              >
                {pillar.name}
              </h3>

              {/* Weight badge */}
              <div
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-300",
                  "bg-zinc-800/70 border border-zinc-700/50",
                  isHovered && "bg-zinc-800 border-zinc-600/70"
                )}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-400">Weight</span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    isHovered ? "text-amber-300" : "text-amber-400/80"
                  )}
                >
                  {pillarWeight}×
                </span>
              </div>
            </div>

            {/* Description - expands on hover */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-out",
                isHovered ? "max-h-40" : "max-h-12"
              )}
            >
              <p
                className={cn(
                  "text-sm leading-relaxed transition-colors duration-300",
                  isHovered ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-400",
                  !isHovered && "line-clamp-2"
                )}
              >
                {pillar.description}
              </p>
            </div>

            {/* Question count */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                    `bg-linear-to-r ${pillar.color}`,
                    isHovered ? "opacity-100" : "opacity-50"
                  )}
                />
                <span className="tabular-nums">{pillar.questions.length}</span>
                <span>{pillar.questions.length === 1 ? "question" : "questions"}</span>
              </div>
            </div>
          </div>

          {/* Right section: Score display or Rate button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {hasExistingRating ? (
              /* Circular score badge */
              <div className="relative">
                {/* Outer ring glow */}
                <div
                  className={cn(
                    "absolute -inset-1.5 rounded-full blur-md transition-all duration-500",
                    scoreColors?.bg,
                    isHovered ? "opacity-40" : "opacity-20"
                  )}
                />

                {/* Score circle */}
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full",
                    "bg-zinc-900/90 backdrop-blur-sm",
                    "ring-2 transition-all duration-300",
                    scoreColors?.ring,
                    isHovered && "scale-105"
                  )}
                >
                  <div className="flex items-center gap-0.5">
                    <Check className={cn("w-3 h-3", scoreColors?.text)} />
                  </div>
                  <span
                    className={cn(
                      "text-xl sm:text-2xl font-black tabular-nums leading-none",
                      scoreColors?.text
                    )}
                  >
                    {existingScore.toFixed(2)}
                  </span>
                  <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
                    Rated
                  </span>
                </div>
              </div>
            ) : (
              /* Unrated indicator */
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full",
                  "bg-zinc-800/50 border-2 border-dashed border-zinc-700/50",
                  "transition-all duration-300",
                  isHovered && "border-zinc-600 bg-zinc-800/70"
                )}
              >
                <Star
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isHovered ? "text-zinc-400" : "text-zinc-600"
                  )}
                />
                <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-wider mt-1">
                  Unrated
                </span>
              </div>
            )}

            {/* Rate/Update button with hover animation */}
            <button
              disabled={disabled}
              className={cn(
                "group/btn relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl",
                "font-semibold text-sm transition-all duration-300",
                "border border-transparent overflow-hidden",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-zinc-800 text-zinc-300",
                // Button animations on button hover only
                "hover:scale-105 hover:shadow-lg hover:shadow-black/30",
                "active:scale-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onSelect(pillar);
              }}
            >
              {/* Button gradient background - appears on button hover */}
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  `bg-linear-to-r ${pillar.color}`,
                  "opacity-0 group-hover/btn:opacity-100"
                )}
              />
              {/* Button glow effect on hover */}
              <div
                className={cn(
                  "absolute -inset-1 rounded-xl blur-md transition-opacity duration-300",
                  `bg-linear-to-r ${pillar.color}`,
                  "opacity-0 group-hover/btn:opacity-40"
                )}
              />
              <span className="relative hidden sm:inline transition-colors duration-300 group-hover/btn:text-white">
                {hasExistingRating ? "Update" : "Rate"}
              </span>
              <ChevronRight
                className={cn(
                  "relative w-4 h-4 transition-all duration-300",
                  "group-hover/btn:translate-x-0.5 group-hover/btn:text-white"
                )}
              />
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500",
            `bg-linear-to-r ${pillar.color}`,
            isHovered ? "opacity-80" : "opacity-0"
          )}
        />

        {/* Left accent line */}
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 w-1 transition-all duration-500",
            `bg-linear-to-b ${pillar.color}`,
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}

// ============================================
// PILLAR CARD SKELETON
// ============================================

interface PillarCardSkeletonProps {
  index: number;
}

export function PillarCardSkeleton({ index }: PillarCardSkeletonProps) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-6 duration-700 w-full"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-zinc-800/20 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6">
          {/* Icon skeleton */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-15 h-15 rounded-2xl bg-zinc-800/60" />
            <div className="sm:hidden flex-1">
              <div className="w-32 h-6 rounded bg-zinc-800/60 mb-2" />
              <div className="w-20 h-4 rounded bg-zinc-800/60" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            <div className="hidden sm:flex items-center gap-4 mb-3">
              <div className="w-40 h-7 rounded bg-zinc-800/60" />
              <div className="w-24 h-6 rounded-full bg-zinc-800/60" />
            </div>
            <div className="w-full h-4 rounded bg-zinc-800/60 mb-2" />
            <div className="w-3/4 h-4 rounded bg-zinc-800/60 mb-3" />
            <div className="w-24 h-4 rounded bg-zinc-800/60" />
          </div>

          {/* Score/button skeleton */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800/60" />
            <div className="w-20 h-10 rounded-xl bg-zinc-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PillarCard;
