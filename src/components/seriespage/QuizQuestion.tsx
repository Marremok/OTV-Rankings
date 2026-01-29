"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Check, HelpCircle, Loader2 } from "lucide-react";
import ScorePicker from "./ScorePicker";

export interface Question {
  id: string;
  title: string;
  description?: string;
}

interface QuizQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  pillarName: string;
  pillarIcon?: React.ReactNode;
  initialValue?: number;
  onNext?: (value: number) => void;
  onPrevious?: () => void;
  onComplete?: (value: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
}



// ============================================
// QUIZ QUESTION COMPONENT
// ============================================

/**
 * QuizQuestion - Premium question-by-question rating UI
 */
export function QuizQuestion({
  question,
  questionIndex,
  totalQuestions,
  pillarName,
  pillarIcon,
  initialValue = 0,
  onNext,
  onPrevious,
  onComplete,
  isFirst = false,
  isLast = false,
  isSubmitting = false,
}: QuizQuestionProps) {
  const [value, setValue] = useState(initialValue);
  const [isExiting, setIsExiting] = useState(false);

  // Reset value when question changes (via initialValue prop)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, questionIndex]);

  const handleNext = () => {
    if (isSubmitting) return;

    if (isLast && onComplete) {
      setIsExiting(true);
      setTimeout(() => onComplete(value), 300);
    } else if (onNext) {
      setIsExiting(true);
      setTimeout(() => onNext(value), 300);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      setIsExiting(true);
      setTimeout(() => onPrevious(), 300);
    }
  };


return (
  <div
    className={cn(
      "relative w-full max-w-6xl mx-auto px-4",
      "animate-in fade-in slide-in-from-bottom-4 duration-500",
      isExiting && "animate-out fade-out duration-300"
    )}
  >
    {/* Kortet med en mer subtil, professionell finish */}
    <div className="relative bg-[#09090b] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden min-h-112.5 flex flex-col">
      
      {/* 1. Header: Allt på en rad för att spara vertikal yta */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-900 bg-zinc-900/20">
        <div className="flex items-center gap-4">
          {pillarIcon && (
            <div className="p-1.5 bg-zinc-800/50 rounded-lg text-zinc-400">
              {pillarIcon}
            </div>
          )}
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
            {pillarName}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === questionIndex ? "w-8 bg-white" : "w-2 bg-zinc-800"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-zinc-600">
            {questionIndex + 1} OF {totalQuestions}
          </span>
        </div>
      </div>

      {/* 2. Content: Centrerat men brett */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 md:px-20 text-center">
        
        {/* Titel: Stor men kompakt radavstånd */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-zinc-100 tracking-tight leading-[1.1] mb-6 max-w-4xl">
          {question.title}
        </h2>

        {/* Beskrivning: En diskret, bred "info-bar" istället för ett stort kort */}
        {question.description && (
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 mb-10 max-w-3xl">
            <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0" />
            <p className="text-zinc-400 text-sm md:text-base font-light text-left leading-snug">
              {question.description}
            </p>
          </div>
        )}

        {/* Interaction Area: Score Picker */}
        <div className="w-full max-w-4xl">
          <ScorePicker value={value} onChange={setValue} />
        </div>
      </div>

      {/* 3. Footer: Ren och "fixed" i botten */}
      <div className="px-8 py-6 border-t border-zinc-900 flex items-center justify-between bg-black/20">
        <button
          onClick={handlePrevious}
          disabled={isFirst}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900",
            "disabled:opacity-0 disabled:pointer-events-none" // Gömmer istället för att bara disa för renare look
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className={cn(
            "group flex items-center gap-2 px-10 py-3.5 rounded-xl font-bold text-sm tracking-tight transition-all",
            "bg-zinc-100 text-zinc-950 hover:bg-white active:scale-[0.97]",
            "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
            "disabled:opacity-70 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isLast ? (
            <>
              <span>Submit Ratings</span>
              <Check className="w-4 h-4 transition-transform group-hover:scale-110" />
            </>
          ) : (
            <>
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
}

export default QuizQuestion;
