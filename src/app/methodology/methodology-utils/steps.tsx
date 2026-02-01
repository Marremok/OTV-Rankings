"use client";

import { ArrowRight, ArrowDown, Layers, ClipboardCheck, Calculator, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// STEP DATA (Static - represents the process flow)
// ============================================

export const METHODOLOGY_STEPS = [
  {
    id: 1,
    title: "Select a Pillar",
    description:
      "Choose one of the core pillars to evaluate. Each pillar focuses on a specific aspect e.g. writing, production.",
    icon: Layers,
    color: "from-violet-500 to-indigo-600",
  },
  {
    id: 2,
    title: "Answer Questions",
    description:
      "Rate specific questions within each pillar on a 1-10 scale. Questions are weighted based on importance.",
    icon: ClipboardCheck,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    title: "Weighted Calculation",
    description:
      "Your answers are combined using a weighted formula to calculate an accurate pillar score.",
    icon: Calculator,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    title: "Final OTV Score",
    description:
      "All pillar scores are aggregated into one comprehensive OTV Score that reflects the show's quality.",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
  },
];

// ============================================
// TYPES
// ============================================

export interface StepCardProps {
  step: (typeof METHODOLOGY_STEPS)[0];
  index: number;
  isActive: boolean;
  onHover: (id: number | null) => void;
}

// ============================================
// COMPONENT: Step Card
// ============================================

export function StepCard({ step, index, isActive, onHover }: StepCardProps) {
  const Icon = step.icon;

  return (
    <div
      className="relative group"
      onMouseEnter={() => onHover(step.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Connection line to next step */}
      {index < METHODOLOGY_STEPS.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-14 w-16 -translate-y-1/2 z-0">
          <ArrowRight
            className={cn(
              "w-6 h-6 mx-auto transition-all duration-500",
              isActive ? "text-primary" : "text-zinc-700"
            )}
          />
        </div>
      )}

      {/* Mobile connector */}
      {index < METHODOLOGY_STEPS.length - 1 && (
        <div className="lg:hidden flex justify-center my-4">
          <ArrowDown
            className={cn(
              "w-6 h-6 transition-all duration-500",
              isActive ? "text-primary" : "text-zinc-700"
            )}
          />
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 transition-all duration-500",
          "border bg-zinc-900/60 backdrop-blur-md",
          isActive
            ? "border-zinc-600/80 scale-[1.02] shadow-2xl shadow-black/50"
            : "border-zinc-800/60 hover:border-zinc-700/60"
        )}
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
            step.color,
            isActive ? "opacity-10" : "opacity-0 group-hover:opacity-5"
          )}
        />

        {/* Step number badge */}
        <div
          className={cn(
            "absolute -top-1 -right-1 w-10 h-10 p-4 rounded-full flex items-center justify-center",
            "font-black text-lg border-2 transition-all duration-500",
            isActive
              ? "bg-primary text-primary-foreground border-primary/50"
              : "bg-zinc-800 text-zinc-400 border-zinc-700"
          )}
        >
          {step.id}
        </div>

        {/* Icon */}
        <div
          className={cn(
            "relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-500",
            "bg-zinc-800/80",
            isActive && "scale-110"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-xl blur-lg transition-all duration-500",
              `bg-gradient-to-br ${step.color}`,
              isActive ? "opacity-50" : "opacity-0"
            )}
          />
          <Icon
            className={cn(
              "relative w-7 h-7 transition-all duration-500",
              isActive ? "text-white" : "text-zinc-400"
            )}
          />
        </div>

        {/* Content */}
        <h3
          className={cn(
            "text-xl font-bold mb-2 transition-colors duration-300",
            isActive ? "text-white" : "text-zinc-200"
          )}
        >
          {step.title}
        </h3>
        <p
          className={cn(
            "text-sm leading-relaxed transition-colors duration-300",
            isActive ? "text-zinc-300" : "text-zinc-500"
          )}
        >
          {step.description}
        </p>

        {/* Bottom accent line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1 transition-all duration-500",
            `bg-gradient-to-r ${step.color}`,
            isActive ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}
