"use client";

import { useState } from "react";
import { Calculator, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// COMPONENT: Formula Section
// ============================================

export function FormulaSection() {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  return (
    <div className="relative py-16">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm mb-4">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Scoring Formula
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Weighted Average Calculation
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every score matters, but some questions and categories carry more weight to ensure
          accurate, meaningful ratings.
        </p>
      </div>

      {/* Formula visualization */}
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md p-8 md:p-12 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20" />

          {/* Formula */}
          <div className="relative text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-4 text-2xl md:text-4xl font-mono">
              {/* OTV Score */}
              <span
                className={cn(
                  "px-4 py-2 rounded-xl font-bold transition-all duration-300 cursor-pointer",
                  hoveredPart === "otv"
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-zinc-800/80 text-primary"
                )}
                onMouseEnter={() => setHoveredPart("otv")}
                onMouseLeave={() => setHoveredPart(null)}
              >
                OTV
              </span>

              <span className="text-zinc-600">=</span>

              {/* Fraction */}
              <div className="flex flex-col items-center gap-1">
                {/* Numerator */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer",
                    hoveredPart === "numerator"
                      ? "bg-emerald-500/20 text-emerald-400 scale-105"
                      : "bg-zinc-800/60 text-zinc-300"
                  )}
                  onMouseEnter={() => setHoveredPart("numerator")}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  <span className="text-lg md:text-2xl">Σ</span>
                  <span className="text-base md:text-xl">(Score × Weight)</span>
                </div>

                {/* Divider */}
                <div className="w-full h-0.5 bg-zinc-600" />

                {/* Denominator */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer",
                    hoveredPart === "denominator"
                      ? "bg-blue-500/20 text-blue-400 scale-105"
                      : "bg-zinc-800/60 text-zinc-300"
                  )}
                  onMouseEnter={() => setHoveredPart("denominator")}
                  onMouseLeave={() => setHoveredPart(null)}
                >
                  <span className="text-lg md:text-2xl">Σ</span>
                  <span className="text-base md:text-xl">Weights</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                  hoveredPart === "numerator" ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-500"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Weighted scores added up</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                  hoveredPart === "denominator" ? "bg-blue-500/10 text-blue-400" : "text-zinc-500"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Total of all weights</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                  hoveredPart === "otv" ? "bg-primary/10 text-primary" : "text-zinc-500"
                )}
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Final normalized score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example calculation */}
      <div className="mt-12 max-w-3xl mx-auto px-4">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6">
          <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Example Calculation
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Question 1 (Weight 2.0):</span>
              <span className="text-zinc-200 font-mono">8.0 × 2.0 = 16.0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Question 2 (Weight 1.5):</span>
              <span className="text-zinc-200 font-mono">7.0 × 1.5 = 10.5</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
              <span className="text-zinc-400">Question 3 (Weight 1.0):</span>
              <span className="text-zinc-200 font-mono">9.0 × 1.0 = 9.0</span>
            </div>
            <div className="flex items-center justify-between py-3 mt-2 bg-zinc-800/30 rounded-lg px-3">
              <span className="text-zinc-300 font-medium">Category Score:</span>
              <span className="text-primary font-mono font-bold">
                (16.0 + 10.5 + 9.0) / (2.0 + 1.5 + 1.0) = 7.89
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
