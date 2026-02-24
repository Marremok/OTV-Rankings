"use client"
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, HelpCircle } from "lucide-react";



// ============================================
// SCORE PICKER COMPONENT
// ============================================

interface ScorePickerProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * ScorePicker - Simple two-row score selection (0.0 to 10.0)
 * Row 1: Whole number (0-10)
 * Row 2: Decimal (0-9)
 */
export default function ScorePicker({ value, onChange }: ScorePickerProps) {
  const wholeNumber = Math.floor(value);
  const decimal = Math.round((value - wholeNumber) * 10);

  // Get color based on value
  const getColor = () => {
    if (value >= 9) return { bg: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/40" };
    if (value >= 7) return { bg: "bg-primary", text: "text-primary", glow: "shadow-primary/40" };
    if (value >= 5) return { bg: "bg-yellow-500", text: "text-yellow-400", glow: "shadow-yellow-500/40" };
    return { bg: "bg-zinc-500", text: "text-zinc-400", glow: "shadow-zinc-500/40" };
  };

  const colors = getColor();

  // Set whole number
  const setWhole = (num: number) => {
    // If setting to 10, decimal must be 0
    const newDecimal = num === 10 ? 0 : decimal;
    onChange(num + newDecimal / 10);
  };

  // Set decimal
  const setDecimal = (dec: number) => {
    // Can't go above 10.0
    if (wholeNumber === 10 && dec > 0) return;
    onChange(wholeNumber + dec / 10);
  };

  // Get score label
  const getScoreLabel = () => {
    if (value >= 9.5) return "Masterpiece";
    if (value >= 9) return "Exceptional";
    if (value >= 8) return "Excellent";
    if (value >= 7) return "Great";
    if (value >= 6) return "Good";
    if (value >= 5) return "Average";
    if (value >= 4) return "Below Average";
    if (value >= 3) return "Poor";
    if (value >= 2) return "Bad";
    return "Terrible";
  };

  return (
    <div className="space-y-6">
      {/* Score display */}
      <div className="text-center">
        <div className="inline-flex items-baseline gap-0.5">
          <span className={cn("text-7xl md:text-8xl font-black tabular-nums transition-colors duration-200", colors.text)}>
            {wholeNumber}
          </span>
          <span className={cn("text-5xl md:text-6xl font-bold", colors.text)}>.</span>
          <span className={cn("text-5xl md:text-6xl font-bold tabular-nums transition-colors duration-200", colors.text)}>
            {decimal}
          </span>
        </div>
        <div className={cn("text-sm font-medium mt-2 transition-colors duration-200", colors.text, "opacity-70")}>
          {getScoreLabel()}
        </div>
      </div>

      {/* Whole number row */}
      <div className="space-y-2">
        <div className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Score
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => setWhole(num)}
              className={cn(
                "w-10 h-10 rounded-xl font-bold text-base tabular-nums transition-all duration-150",
                "hover:scale-105 active:scale-95",
                wholeNumber === num
                  ? cn("text-white shadow-lg", colors.bg, colors.glow)
                  : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Decimal row */}
      <div className="space-y-2">
        <div className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Decimal
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((dec) => {
            const isDisabled = wholeNumber === 10 && dec > 0;
            return (
              <button
                key={dec}
                onClick={() => setDecimal(dec)}
                disabled={isDisabled}
                className={cn(
                  "w-10 h-10 rounded-xl font-bold text-base tabular-nums transition-all duration-150",
                  "hover:scale-105 active:scale-95",
                  "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
                  decimal === dec && !isDisabled
                    ? cn("text-white shadow-lg", colors.bg, colors.glow)
                    : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                )}
              >
                .{dec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scale reference */}
      <div className="hidden sm:flex justify-between px-6 pt-2 text-[10px] text-zinc-600 uppercase tracking-wider">
        <span>Terrible</span>
        <span>Average</span>
        <span>Great</span>
        <span>Masterpiece</span>
      </div>
    </div>
  );
}