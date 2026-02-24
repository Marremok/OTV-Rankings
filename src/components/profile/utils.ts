// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return new Date(date).toLocaleDateString("en-US", options ?? defaultOptions);
}

/**
 * Get user initials from name or email
 */
export function getUserInitials(name?: string | null, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

/**
 * Get color class based on score
 */
export function getScoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-primary";
  if (score >= 5) return "text-yellow-400";
  return "text-zinc-400";
}
