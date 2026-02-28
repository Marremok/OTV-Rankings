"use client";

import { Tv, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EpisodeSearchResult } from "@/lib/validations/search";
import { CommandItem } from "@/components/ui/command";

interface EpisodeSearchItemProps {
  episode: EpisodeSearchResult;
  onSelect?: () => void;
}

export function EpisodeSearchItem({ episode, onSelect }: EpisodeSearchItemProps) {
  const router = useRouter();

  const handleSelect = () => {
    onSelect?.();
    if (episode.slug) {
      router.push(`/episodes/${episode.slug}`);
    }
  };

  const badge =
    episode.order != null
      ? `S${episode.order}E${episode.episodeNumber}`
      : `Ep. ${episode.episodeNumber}`;

  return (
    <CommandItem
      value={episode.title}
      onSelect={handleSelect}
      className="flex items-center gap-3 px-3 py-2"
    >
      <div className="flex h-10 w-7 items-center justify-center rounded bg-muted shrink-0">
        <Tv className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="font-medium truncate">{episode.title}</span>
        <span className="text-xs text-muted-foreground truncate">
          {badge}{episode.seriesTitle ? ` · ${episode.seriesTitle}` : ""}
        </span>
      </div>
      {episode.score > 0 && (
        <div className="flex items-center gap-1 text-sm shrink-0">
          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          <span>{episode.score.toFixed(1)}</span>
        </div>
      )}
    </CommandItem>
  );
}
