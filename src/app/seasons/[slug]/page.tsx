"use client";

import { useParams, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useGetSeasonBySlug } from "@/hooks/use-seasons";
import {
  SeasonHero,
  SeasonDescriptionSection,
  SeasonRatingSummary,
  SeasonPillarsSection,
  SeasonEpisodeList,
} from "@/components/seasonspage";

export default function SeasonPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: season, isLoading, error } = useGetSeasonBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !season) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-200 h-200 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-150 h-150 rounded-full bg-primary/3 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px]" />
      </div>

      <div className="relative">
        <SeasonHero
          order={season.order}
          title={season.title}
          heroImageUrl={season.heroImageUrl}
        />
        <SeasonDescriptionSection
          title={season.title ?? `Season ${season.order}`}
          description={season.description}
          score={season.score}
          ranking={season.ranking > 0 ? season.ranking : undefined}
        />
        <SeasonRatingSummary slug={slug} />
        <SeasonPillarsSection seasonId={season.id} />
        <SeasonEpisodeList episodes={season.episodes} seasonOrder={season.order} />
      </div>
    </div>
  );
}
