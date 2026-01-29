"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Pen,
  Film,
  Users,
  Sparkles,
  Music,
  Star,
  ChevronRight,
  LucideIcon,
  AlertCircle,
  Clapperboard,
  Camera,
  Palette,
  Heart,
  Brain,
  Lightbulb,
  MessageSquare,
  Zap,
  Check,
  Loader2,
} from "lucide-react";
import { QuizQuestion } from "./QuizQuestion";
import { useGetPillarsByType, useCreateRatingPillar, useGetUserRatingPillars } from "@/hooks/use-pillars";
import { useSession } from "@/lib/auth-client";
import { mediaType } from "@/generated/prisma/enums";

// ============================================
// TYPE DEFINITIONS
// ============================================

// Question with weight for score calculation
export interface QuestionWithWeight {
  id: string;
  title: string;
  description?: string;
  weight: number;
}

// UI Pillar type for rendering (transformed from DB)
export interface Pillar {
  id: string;
  name: string;
  type: string; // Original type for mapping
  icon: LucideIcon;
  description: string;
  color: string;
  questions: QuestionWithWeight[];
}

// Answer entry for tracking quiz responses
interface QuizAnswer {
  questionId: string;
  score: number;
  weight: number;
}

// Props for the section component
interface RateYourselfSectionProps {
  /** The media type to fetch pillars for (defaults to SERIES) */
  mediaTypeFilter?: mediaType;
  /** The series ID for saving ratings */
  seriesId: string;
}

// ============================================
// ICON & COLOR MAPPINGS
// ============================================

const PILLAR_ICON_MAP: Record<string, LucideIcon> = {
  writing: Pen,
  directing: Film,
  acting: Users,
  visuals: Sparkles,
  sound: Music,
  cinematography: Camera,
  production: Clapperboard,
  design: Palette,
  emotion: Heart,
  story: Brain,
  creativity: Lightbulb,
  dialogue: MessageSquare,
  pacing: Zap,
};

const PILLAR_COLOR_MAP: Record<string, string> = {
  writing: "from-violet-500 to-purple-600",
  directing: "from-blue-500 to-cyan-500",
  acting: "from-amber-500 to-orange-500",
  visuals: "from-emerald-500 to-teal-500",
  sound: "from-pink-500 to-rose-500",
  cinematography: "from-sky-500 to-blue-600",
  production: "from-indigo-500 to-violet-600",
  design: "from-fuchsia-500 to-pink-600",
  emotion: "from-red-500 to-rose-600",
  story: "from-cyan-500 to-teal-600",
  creativity: "from-yellow-500 to-amber-600",
  dialogue: "from-lime-500 to-green-600",
  pacing: "from-orange-500 to-red-600",
};

const DEFAULT_ICON = Star;
const DEFAULT_COLOR = "from-zinc-500 to-zinc-600";

function getPillarIcon(type: string): LucideIcon {
  return PILLAR_ICON_MAP[type.toLowerCase()] || DEFAULT_ICON;
}

function getPillarColor(type: string): string {
  return PILLAR_COLOR_MAP[type.toLowerCase()] || DEFAULT_COLOR;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// SCORE CALCULATION
// ============================================

/**
 * Calculate weighted average score from quiz answers
 * Formula: (sum of score * weight) / (sum of weights)
 */
function calculateWeightedScore(answers: QuizAnswer[]): number {
  if (answers.length === 0) return 0;

  const weightedSum = answers.reduce((sum, a) => sum + a.score * a.weight, 0);
  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);

  if (totalWeight === 0) return 0;

  // Round to 1 decimal place
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

// ============================================
// PILLAR CARD COMPONENT
// ============================================

interface PillarCardProps {
  pillar: Pillar;
  index: number;
  onSelect: (pillar: Pillar) => void;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  existingScore?: number; // User's existing rating for this pillar
}

function PillarCard({ pillar, index, onSelect, isHovered, onHover, existingScore }: PillarCardProps) {
  const Icon = pillar.icon;
  const hasExistingRating = existingScore !== undefined;

  return (
    <div
      className={cn(
        "group relative cursor-pointer",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => onHover(pillar.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(pillar)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-500 ease-out",
          "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
          isHovered
            ? "scale-[1.02] border-zinc-700/80 bg-zinc-900/70 shadow-2xl"
            : "hover:border-zinc-700/60"
        )}
      >
        {/* Gradient background overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500",
            pillar.color,
            isHovered ? "opacity-10" : "group-hover:opacity-5"
          )}
        />

        {/* Animated glow effect */}
        <div
          className={cn(
            "absolute -inset-px rounded-2xl transition-opacity duration-500",
            `bg-linear-to-r ${pillar.color}`,
            isHovered ? "opacity-20 blur-xl" : "opacity-0"
          )}
        />

        {/* Content */}
        <div className="relative p-6">
          {/* Top row - Icon and badge */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                "relative p-3.5 rounded-2xl transition-all duration-500",
                "bg-zinc-800/80 group-hover:bg-zinc-800",
                isHovered && "scale-110"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl blur-md transition-opacity duration-500",
                  `bg-linear-to-br ${pillar.color}`,
                  isHovered ? "opacity-40" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "relative h-6 w-6 transition-all duration-500",
                  isHovered ? "text-white scale-110" : "text-zinc-400 group-hover:text-zinc-300"
                )}
              />
            </div>

            {/* Show existing score or question count */}
            {hasExistingRating ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="w-3 h-3" />
                <span className="text-sm font-bold tabular-nums">{existingScore.toFixed(1)}</span>
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-500",
                  "bg-zinc-800/60 text-zinc-500",
                  isHovered && "bg-zinc-800 text-zinc-300"
                )}
              >
                <span className="text-xs font-medium tabular-nums">
                  {pillar.questions.length}
                </span>
                <span className="text-xs">
                  {pillar.questions.length === 1 ? "question" : "questions"}
                </span>
              </div>
            )}
          </div>

          {/* Pillar name */}
          <h3
            className={cn(
              "text-xl font-bold transition-colors duration-300",
              isHovered ? "text-white" : "text-zinc-200 group-hover:text-white"
            )}
          >
            {pillar.name}
          </h3>

          {/* Description - shows on hover */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              isHovered ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
            )}
          >
            <p className="text-sm text-zinc-400 leading-relaxed">
              {pillar.description}
            </p>
          </div>

          {/* Rate button - shows on hover */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-500 ease-out",
              isHovered ? "max-h-20 opacity-100 mt-5" : "max-h-0 opacity-0 mt-0"
            )}
          >
            <button
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl",
                "font-semibold text-white transition-all duration-300",
                `bg-linear-to-r ${pillar.color}`,
                "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                "shadow-lg"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pillar);
              }}
            >
              <Star className="w-4 h-4" />
              <span>{hasExistingRating ? "Update Rating" : "Rate Yourself"}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500",
            `bg-linear-to-r ${pillar.color}`,
            isHovered ? "opacity-60" : "opacity-0"
          )}
        />
      </div>
    </div>
  );
}

// ============================================
// LOADING & ERROR STATES
// ============================================

function PillarCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-zinc-800/20 to-transparent" />
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/60" />
          <div className="w-24 h-7 rounded-full bg-zinc-800/60" />
        </div>
        <div className="w-32 h-6 rounded bg-zinc-800/60" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">Unable to load pillars</h3>
      <p className="text-sm text-zinc-500 max-w-md">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-zinc-800/60 mb-4">
        <Star className="w-8 h-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">No rating categories yet</h3>
      <p className="text-sm text-zinc-500 max-w-md">
        Rating categories haven&apos;t been set up for this media type yet.
        Check back later!
      </p>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <Star className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">Sign in to rate</h3>
      <p className="text-sm text-zinc-500 max-w-md">
        Create an account or sign in to submit your ratings and track your opinions.
      </p>
    </div>
  );
}

// ============================================
// QUIZ STATE TYPES
// ============================================

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

export function RateYourselfSection({ mediaTypeFilter = mediaType.SERIES, seriesId }: RateYourselfSectionProps) {
  // Auth state
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch pillars from database
  const { data: dbPillars, isLoading: isLoadingPillars, error: pillarsError } = useGetPillarsByType(mediaTypeFilter);

  // Fetch user's existing ratings
  const { data: userRatings, isLoading: isLoadingRatings } = useGetUserRatingPillars(userId, seriesId);

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
      icon: getPillarIcon(dbPillar.type),
      description: dbPillar.description || `Rate the ${dbPillar.type} aspects`,
      color: getPillarColor(dbPillar.type),
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

  // Start quiz for a pillar (reset score to 0)
  const handlePillarSelect = useCallback((pillar: Pillar) => {
    if (pillar.questions.length === 0) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setQuizState({
        mode: "quiz",
        pillar,
        questionIndex: 0,
        answers: [], // Start with empty answers, score picker will be at 0
      });
      setIsTransitioning(false);
    }, 400);
  }, []);

  // Handle next question - save current score, then move to next with reset to 0
  const handleNextQuestion = useCallback((score: number) => {
    if (quizState.mode !== "quiz") return;

    const currentQuestion = quizState.pillar.questions[quizState.questionIndex];
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      score,
      weight: currentQuestion.weight,
    };

    // Add answer to the list (or update if going back and forth)
    const updatedAnswers = [...quizState.answers];
    updatedAnswers[quizState.questionIndex] = newAnswer;

    if (quizState.questionIndex < quizState.pillar.questions.length - 1) {
      setQuizState({
        ...quizState,
        questionIndex: quizState.questionIndex + 1,
        answers: updatedAnswers,
      });
    }
  }, [quizState]);

  // Handle previous question
  const handlePreviousQuestion = useCallback(() => {
    if (quizState.mode !== "quiz") return;

    if (quizState.questionIndex > 0) {
      setQuizState({
        ...quizState,
        questionIndex: quizState.questionIndex - 1,
      });
    } else {
      // Go back to selection
      setIsTransitioning(true);
      setTimeout(() => {
        setQuizState({ mode: "selection" });
        setIsTransitioning(false);
      }, 300);
    }
  }, [quizState]);

  // Handle quiz completion - calculate weighted score and submit
  const handleQuizComplete = useCallback(async (score: number) => {
    if (quizState.mode !== "quiz" || !userId) return;

    const currentQuestion = quizState.pillar.questions[quizState.questionIndex];
    const finalAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      score,
      weight: currentQuestion.weight,
    };

    // Build final answers array
    const finalAnswers = [...quizState.answers];
    finalAnswers[quizState.questionIndex] = finalAnswer;

    // Calculate weighted average score
    const weightedScore = calculateWeightedScore(finalAnswers);

    console.log("Quiz completed!", {
      pillarId: quizState.pillar.id,
      pillarName: quizState.pillar.name,
      answers: finalAnswers,
      weightedScore,
    });

    // Submit to backend
    try {
      await createRatingMutation.mutateAsync({
        userId,
        seriesId,
        pillarId: quizState.pillar.id,
        finalScore: weightedScore,
      });

      // Return to selection on success
      setIsTransitioning(true);
      setTimeout(() => {
        setQuizState({ mode: "selection" });
        setIsTransitioning(false);
      }, 400);
    } catch (error) {
      console.error("Failed to save rating:", error);
      // Could show error toast here
    }
  }, [quizState, userId, seriesId, createRatingMutation]);

  // Render content based on state
  const renderContent = () => {
    const isLoading = isLoadingPillars || isLoadingRatings;

    // Loading state
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <PillarCardSkeleton key={i} index={i} />
          ))}
        </div>
      );
    }

    // Error state
    if (pillarsError) {
      return <ErrorState message={pillarsError.message || "Failed to load rating categories"} />;
    }

    // Empty state
    if (pillarsWithQuestions.length === 0) {
      return <EmptyState />;
    }

    // Not signed in
    if (!userId && quizState.mode === "selection") {
      // Show pillars but with sign-in prompt overlay or message
      // For now, just show the pillars without rating ability
    }

    // Quiz mode
    if (quizState.mode === "quiz") {
      // Get existing answer for current question (for going back)
      const existingAnswer = quizState.answers[quizState.questionIndex];

      return (
        <QuizQuestion
          question={quizState.pillar.questions[quizState.questionIndex]}
          questionIndex={quizState.questionIndex}
          totalQuestions={quizState.pillar.questions.length}
          pillarName={quizState.pillar.name}
          pillarIcon={<quizState.pillar.icon className="w-4 h-4 text-zinc-400" />}
          initialValue={existingAnswer?.score ?? 0} // Reset to 0 for new questions
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pillarsWithQuestions.map((pillar, index) => (
          <PillarCard
            key={pillar.id}
            pillar={pillar}
            index={index}
            onSelect={userId ? handlePillarSelect : () => {}}
            isHovered={hoveredPillar === pillar.id}
            onHover={setHoveredPillar}
            existingScore={userRatingsMap.get(pillar.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
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
            "text-center mb-14 transition-all duration-500",
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
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setQuizState({ mode: "selection" });
                  setIsTransitioning(false);
                }, 300);
              }}
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
