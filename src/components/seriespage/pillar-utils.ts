import {
  Pen,
  Film,
  Users,
  Sparkles,
  Music,
  Star,
  LucideIcon,
  Clapperboard,
  Camera,
  Palette,
  Heart,
  Brain,
  Lightbulb,
  MessageSquare,
  Zap,
} from "lucide-react";

// ============================================
// TYPE DEFINITIONS
// ============================================

/** Question with weight for score calculation */
export interface QuestionWithWeight {
  id: string;
  title: string;
  description?: string;
  weight: number;
}

/** UI Pillar type for rendering (transformed from DB) */
export interface Pillar {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  description: string;
  color: string;
  weight: number; // Pillar weight from database
  questions: QuestionWithWeight[];
}

/** Answer entry for tracking quiz responses */
export interface QuizAnswer {
  questionId: string;
  score: number;
  weight: number;
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
  characters: "from-amber-500 to-orange-500",
  production: "from-emerald-500 to-teal-500",
  overallexperience: "from-pink-500 to-rose-500",
  cinematography: "from-sky-500 to-blue-600",
  design: "from-fuchsia-500 to-pink-600",
  emotion: "from-red-500 to-rose-600",
  story: "from-cyan-500 to-teal-600",
  creativity: "from-yellow-500 to-amber-600",
  dialogue: "from-lime-500 to-green-600",
  pacing: "from-orange-500 to-red-600",
};

const DEFAULT_ICON = Star;
const DEFAULT_COLOR = "from-zinc-500 to-zinc-600";

export function getPillarIcon(type: string): LucideIcon {
  return PILLAR_ICON_MAP[type.toLowerCase()] || DEFAULT_ICON;
}

export function getPillarColor(type: string): string {
  return PILLAR_COLOR_MAP[type.toLowerCase()] || DEFAULT_COLOR;
}

// ============================================
// SCORE UTILITIES
// ============================================

/** Get color scheme based on score value */
export function getScoreColor(score: number) {
  if (score >= 9) return { bg: "bg-emerald-500", text: "text-emerald-400", ring: "ring-emerald-500/30" };
  if (score >= 7) return { bg: "bg-primary", text: "text-primary", ring: "ring-primary/30" };
  if (score >= 5) return { bg: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/30" };
  return { bg: "bg-zinc-500", text: "text-zinc-400", ring: "ring-zinc-500/30" };
}

/**
 * Calculate weighted average score from quiz answers
 * Formula: (sum of score * weight) / (sum of weights)
 */
export function calculateWeightedScore(answers: QuizAnswer[]): number {
  if (answers.length === 0) return 0;

  const weightedSum = answers.reduce((sum, a) => sum + a.score * a.weight, 0);
  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);

  if (totalWeight === 0) return 0;

  // Round to 1 decimal place
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

// ============================================
// STRING UTILITIES
// ============================================

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
