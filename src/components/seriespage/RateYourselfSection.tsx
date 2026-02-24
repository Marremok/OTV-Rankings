"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { QuizQuestion } from "./QuizQuestion";
import { PillarCard, PillarCardSkeleton } from "./PillarCard";
import { ErrorState, EmptyState } from "./RateYourselfStates";
import {
  Pillar,
  QuizAnswer,
  getPillarIcon,
  getPillarColor,
  calculateWeightedScore,
  capitalize,
  getScoreColor,
} from "./pillar-utils";
import { useGetPillarsByType, useCreateRatingPillar, useGetUserRatingPillars } from "@/hooks/use-pillars";
import { useSession } from "@/lib/auth-client";
import { mediaType } from "@/generated/prisma/enums";

// ============================================
// PROPS & STATE TYPES
// ============================================

interface RateYourselfSectionProps {
  mediaTypeFilter?: mediaType;
  seriesId: string;
}

type QuizState =
  | { mode: "selection" }
  | {
      mode: "quiz";
      pillar: Pillar;
      questionIndex: number;
      answers: QuizAnswer[];
    };

// ============================================
// MAIN COMPONENT
// ============================================

export function RateYourselfSection({
  mediaTypeFilter = mediaType.SERIES,
  seriesId,
}: RateYourselfSectionProps) {
  // Auth state
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch pillars from database
  const {
    data: dbPillars,
    isLoading: isLoadingPillars,
    error: pillarsError,
  } = useGetPillarsByType(mediaTypeFilter);

  // Fetch user's existing ratings
  const { data: userRatings, isLoading: isLoadingRatings } = useGetUserRatingPillars(
    userId,
    seriesId
  );

  // Mutation for saving ratings
  const createRatingMutation = useCreateRatingPillar();

  // Local UI state
  const [quizState, setQuizState] = useState<QuizState>({ mode: "selection" });
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Transform database pillars to UI format
  const pillars: Pillar[] = useMemo(() => {
    if (!dbPillars || dbPillars.length === 0) return [];

    return dbPillars.map((dbPillar) => ({
      id: dbPillar.id,
      name: capitalize(dbPillar.type),
      type: dbPillar.type,
      icon: getPillarIcon(dbPillar.icon || dbPillar.type),
      description: dbPillar.description || `Rate the ${dbPillar.type} aspects`,
      color: getPillarColor(dbPillar.type),
      weight: dbPillar.weight, // Use database weight directly
      questions: dbPillar.questions.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description || undefined,
        weight: q.weight,
      })),
    }));
  }, [dbPillars]);

  // Filter out pillars with no questions
  const pillarsWithQuestions = useMemo(() => {
    return pillars.filter((p) => p.questions.length > 0);
  }, [pillars]);

  // Map user ratings by pillar ID for quick lookup
  const userRatingsMap = useMemo(() => {
    if (!userRatings) return new Map<string, number>();
    return new Map(userRatings.map((r) => [r.pillarId, r.score]));
  }, [userRatings]);

  // Calculate user's weighted overall score across all rated pillars
  const userOverallScore = useMemo(() => {
    const ratedPillars = pillarsWithQuestions.filter(p => userRatingsMap.has(p.id));
    if (ratedPillars.length === 0) return null;
    const weightedSum = ratedPillars.reduce((sum, p) => sum + (userRatingsMap.get(p.id)! * p.weight), 0);
    const totalWeight = ratedPillars.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight === 0) return null;
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  }, [pillarsWithQuestions, userRatingsMap]);

  // Start quiz for a pillar
  const handlePillarSelect = useCallback((pillar: Pillar) => {
    if (pillar.questions.length === 0) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setQuizState({
        mode: "quiz",
        pillar,
        questionIndex: 0,
        answers: [],
      });
      setIsTransitioning(false);
    }, 400);
  }, []);

  // Handle next question
  const handleNextQuestion = useCallback(
    (score: number) => {
      if (quizState.mode !== "quiz") return;

      const currentQuestion = quizState.pillar.questions[quizState.questionIndex];
      const newAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        score,
        weight: currentQuestion.weight,
      };

      const updatedAnswers = [...quizState.answers];
      updatedAnswers[quizState.questionIndex] = newAnswer;

      if (quizState.questionIndex < quizState.pillar.questions.length - 1) {
        setQuizState({
          ...quizState,
          questionIndex: quizState.questionIndex + 1,
          answers: updatedAnswers,
        });
      }
    },
    [quizState]
  );

  // Handle previous question
  const handlePreviousQuestion = useCallback(() => {
    if (quizState.mode !== "quiz") return;

    if (quizState.questionIndex > 0) {
      setQuizState({
        ...quizState,
        questionIndex: quizState.questionIndex - 1,
      });
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setQuizState({ mode: "selection" });
        setIsTransitioning(false);
      }, 300);
    }
  }, [quizState]);

  // Handle quiz completion
  const handleQuizComplete = useCallback(
    async (score: number) => {
      if (quizState.mode !== "quiz" || !userId) return;

      const currentQuestion = quizState.pillar.questions[quizState.questionIndex];
      const finalAnswer: QuizAnswer = {
        questionId: currentQuestion.id,
        score,
        weight: currentQuestion.weight,
      };

      const finalAnswers = [...quizState.answers];
      finalAnswers[quizState.questionIndex] = finalAnswer;

      const weightedScore = calculateWeightedScore(finalAnswers);

      try {
        await createRatingMutation.mutateAsync({
          userId,
          seriesId,
          pillarId: quizState.pillar.id,
          finalScore: weightedScore,
        });

        // Show success toast with info about score updates
        toast.success("Rating saved!", {
          description: "Community scores update periodically.",
        });

        setIsTransitioning(true);
        setTimeout(() => {
          setQuizState({ mode: "selection" });
          setIsTransitioning(false);
        }, 400);
      } catch (error) {
        console.error("Failed to save rating:", error);
        toast.error("Failed to save rating", {
          description: "Please try again.",
        });
      }
    },
    [quizState, userId, seriesId, createRatingMutation]
  );

  // Back to selection handler
  const handleBackToSelection = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setQuizState({ mode: "selection" });
      setIsTransitioning(false);
    }, 300);
  }, []);

  // Render content based on state
  const renderContent = () => {
    const isLoading = isLoadingPillars || isLoadingRatings;

    if (isLoading) {
      return (
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <PillarCardSkeleton key={i} index={i} />
          ))}
        </div>
      );
    }

    if (pillarsError) {
      return <ErrorState message={pillarsError.message || "Failed to load rating categories"} />;
    }

    if (pillarsWithQuestions.length === 0) {
      return <EmptyState />;
    }

    // Quiz mode
    if (quizState.mode === "quiz") {
      const existingAnswer = quizState.answers[quizState.questionIndex];

      return (
        <QuizQuestion
          question={quizState.pillar.questions[quizState.questionIndex]}
          questionIndex={quizState.questionIndex}
          totalQuestions={quizState.pillar.questions.length}
          pillarName={quizState.pillar.name}
          pillarIcon={<quizState.pillar.icon className="w-4 h-4 text-zinc-400" />}
          initialValue={existingAnswer?.score ?? 0}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          onComplete={handleQuizComplete}
          isFirst={quizState.questionIndex === 0}
          isLast={quizState.questionIndex === quizState.pillar.questions.length - 1}
          isSubmitting={createRatingMutation.isPending}
        />
      );
    }

    // Selection mode - show pillar cards
    return (
      <div className="flex flex-col gap-4">
        {pillarsWithQuestions.map((pillar, index) => (
          <PillarCard
            key={pillar.id}
            pillar={pillar}
            index={index}
            onSelect={handlePillarSelect}
            isHovered={hoveredPillar === pillar.id}
            onHover={setHoveredPillar}
            existingScore={userRatingsMap.get(pillar.id)}
            disabled={!userId}
          />
        ))}

        {userOverallScore !== null && (
          <div className="mt-4 pt-6 border-t border-zinc-800/50">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">Your Overall Score</span>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-3xl font-black tabular-nums", getScoreColor(userOverallScore).text)}>
                  {userOverallScore.toFixed(2)}
                </span>
                <span className="text-zinc-600">/ 10</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="relative py-12 px-4 md:py-24 md:px-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div
          className={cn(
            "text-center mb-8 md:mb-14 transition-all duration-500",
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          <div className="inline-flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="h-px w-12 bg-linear-to-r from-transparent to-primary/50" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
              Your Opinion
            </span>
            <div className="h-px w-12 bg-linear-to-l from-transparent to-primary/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
            {quizState.mode === "selection" ? "Rate it Yourself" : quizState.pillar.name}
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            {quizState.mode === "selection"
              ? userId
                ? "Select a category to begin rating"
                : "Sign in to submit your ratings"
              : `Answer ${quizState.pillar.questions.length} questions to rate this pillar`}
          </p>
        </div>

        {/* Content area */}
        <div
          className={cn(
            "relative transition-all duration-500",
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          {renderContent()}
        </div>

        {/* Back to selection button (when in quiz mode) */}
        {quizState.mode === "quiz" && (
          <div className="mt-8 text-center animate-in fade-in duration-500 delay-300">
            <button
              onClick={handleBackToSelection}
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Choose different pillar</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default RateYourselfSection;
