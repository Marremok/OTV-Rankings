"use client";

// Re-exports the shared PillarCard components for use within the characters page.
// This keeps the characterspage folder self-contained and makes future character-specific
// overrides easy to add here without touching the seriespage components.
export { PillarCard, PillarCardSkeleton } from "@/components/seriespage/PillarCard";
