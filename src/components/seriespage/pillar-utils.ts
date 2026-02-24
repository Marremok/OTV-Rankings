import { Star, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

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
// COLOR PALETTE
// ============================================

// Used for deterministic per-pillar color assignment.
const PILLAR_COLOR_PALETTE: string[] = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-red-500 to-rose-600",
  "from-cyan-500 to-teal-600",
  "from-yellow-500 to-amber-600",
  "from-lime-500 to-green-600",
  "from-orange-500 to-red-600",
  "from-indigo-500 to-violet-600",
  "from-teal-500 to-green-500",
  "from-rose-500 to-pink-500",
  "from-green-500 to-emerald-600",
];

/** Deterministic hash: same string always maps to the same color. */
function hashType(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// ============================================
// ICON LOOKUP
// ============================================

/**
 * Resolves a Lucide icon by the exact PascalCase name stored in the DB icon field
 * (e.g. "UserStar", "Crown", "Flame").
 * Falls back to Star if the name doesn't match any export.
 *
 * Lucide-react icons are forwardRef objects (typeof === "object"), so we check
 * for the "$$typeof" property that every React exotic component carries.
 */
export function getPillarIcon(iconName: string): LucideIcon {
  if (!iconName) return Star;

  const candidate = (LucideIcons as Record<string, unknown>)[iconName];

  // Lucide icons are exotic React components: objects with $$typeof + render
  if (candidate != null && typeof candidate === "object" && "$$typeof" in (candidate as object)) {
    return candidate as LucideIcon;
  }

  // Also accept plain function components (older lucide-react versions)
  if (typeof candidate === "function") {
    return candidate as LucideIcon;
  }

  return Star;
}

// ============================================
// COLOR UTILITY
// ============================================

/**
 * Returns a deterministic gradient color for a pillar based on its type string.
 * Same type always produces the same color; all colors are vivid (no gray fallback).
 */
export function getPillarColor(type: string): string {
  return PILLAR_COLOR_PALETTE[hashType(type.toLowerCase()) % PILLAR_COLOR_PALETTE.length];
}

// ============================================
// SCORE UTILITIES
// ============================================

/** Get color scheme based on score value */
export function getScoreColor(score: number) {
  if (score >= 9.9) return { bg: "bg-blue-500",    bgSubtle: "bg-blue-500/10",    text: "text-blue-400",    ring: "ring-blue-500/30",    neon: "bg-blue-500 text-blue-500" };
  if (score >= 9.7) return { bg: "bg-sky-400",     bgSubtle: "bg-sky-400/10",     text: "text-sky-300",     ring: "ring-sky-400/30",     neon: "bg-sky-400 text-sky-400" };
  if (score >= 9)   return { bg: "bg-emerald-500", bgSubtle: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30", neon: "bg-emerald-500 text-emerald-500" };
  if (score >= 7)   return { bg: "bg-primary",     bgSubtle: "bg-primary/10",     text: "text-primary",     ring: "ring-primary/30",     neon: "bg-primary text-primary" };
  if (score >= 5)   return { bg: "bg-yellow-500",  bgSubtle: "bg-yellow-500/10",  text: "text-yellow-400",  ring: "ring-yellow-500/30",  neon: "bg-yellow-500 text-yellow-500" };
  return             { bg: "bg-zinc-500",           bgSubtle: "bg-zinc-800",       text: "text-zinc-400",    ring: "ring-zinc-500/30",    neon: "bg-zinc-500 text-zinc-500" };
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

  // Round to 2 decimal places
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

// ============================================
// STRING UTILITIES
// ============================================

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
