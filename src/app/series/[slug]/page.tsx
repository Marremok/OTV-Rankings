"use client";

import { useGetSeriesBySlug } from "@/hooks/use-series";
import { useParams, notFound } from "next/navigation";
import {
  HeroSection,
  DescriptionSection,
  RadarChartSection,
  RateYourselfSection,
} from "@/components/seriespage";

/**
 * SeriesPage - Dynamic series detail page
 * Displays hero, description, rating breakdown, and user rating UI
 */
export default function SeriesPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: series, isLoading, error } = useGetSeriesBySlug(slug);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm">Loading series...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !series) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Cinematic hero with series title and key info */}
      <HeroSection series={series} />

      {/* Section divider */}
      <SectionDivider />

      {/* Series description and OTV rating */}
      <DescriptionSection
        title={series.title}
        description={series.description}
        score={series.score}
        ranking={series.ranking}
      />

      {/* Section divider */}
      <SectionDivider />

      {/* Rating breakdown with radar chart */}
      <RadarChartSection />

      {/* Section divider */}
      <SectionDivider />

      {/* User rating interface */}
      <RateYourselfSection seriesId={series.id} />

      {/* Footer spacing */}
      <div className="h-24" />
    </div>
  );
}

/**
 * SectionDivider - Elegant gradient divider between sections
 */
function SectionDivider() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="h-px bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
    </div>
  );
}
