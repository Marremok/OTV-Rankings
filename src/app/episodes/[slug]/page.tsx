"use client";

import { useParams, notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useGetEpisodeBySlug } from "@/hooks/use-episodes";
import {
  EpisodeHero,
  EpisodeDescriptionSection,
  EpisodeRatingSummary,
  EpisodePillarsSection,
} from "@/components/episodespage";

export default function EpisodePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: episode, isLoading, error } = useGetEpisodeBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !episode) {
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
        <EpisodeHero
          title={episode.title}
          episodeNumber={episode.episodeNumber}
          heroImageUrl={episode.heroImageUrl}
          season={episode.season}
        />
        <EpisodeDescriptionSection
          title={episode.title}
          description={episode.description}
          score={episode.score}
          ranking={episode.ranking > 0 ? episode.ranking : undefined}
        />
        <EpisodeRatingSummary slug={slug} />
        <EpisodePillarsSection episodeId={episode.id} />
      </div>
    </div>
  );
}
