"use client";

import { Layers, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SeasonSearchResult } from "@/lib/validations/search";
import { CommandItem } from "@/components/ui/command";

interface SeasonSearchItemProps {
  season: SeasonSearchResult;
  onSelect?: () => void;
}

export function SeasonSearchItem({ season, onSelect }: SeasonSearchItemProps) {
  const router = useRouter();

  const handleSelect = () => {
    onSelect?.();
    if (season.slug) {
      router.push(`/seasons/${season.slug}`);
    }
  };

  const label = season.title
    ? `Season ${season.order}: ${season.title}`
    : `Season ${season.order}`;

  return (
    <CommandItem
      value={label}
      onSelect={handleSelect}
      className="flex items-center gap-3 px-3 py-2"
    >
      {season.posterUrl ? (
        <img
          src={season.posterUrl}
          alt={label}
          className="h-10 w-7 rounded object-cover shrink-0"
        />
      ) : (
        <div className="flex h-10 w-7 items-center justify-center rounded bg-muted shrink-0">
          <Layers className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="font-medium truncate">{label}</span>
        {season.seriesTitle && (
          <span className="text-xs text-muted-foreground truncate">{season.seriesTitle}</span>
        )}
      </div>
      {season.score > 0 && (
        <div className="flex items-center gap-1 text-sm shrink-0">
          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
          <span>{season.score.toFixed(1)}</span>
        </div>
      )}
    </CommandItem>
  );
}
