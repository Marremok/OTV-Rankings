"use client";

import { Film, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SeriesSearchResult } from "@/lib/validations/search";
import { CommandItem } from "@/components/ui/command";

interface SeriesSearchItemProps {
  series: SeriesSearchResult;
  onSelect?: () => void;
}

export function SeriesSearchItem({ series, onSelect }: SeriesSearchItemProps) {
  const router = useRouter();

  const handleSelect = () => {
    onSelect?.();
    if (series.slug) {
      router.push(`/series/${series.slug}`);
    }
  };

  return (
    <CommandItem
      value={series.title}
      onSelect={handleSelect}
      className="flex items-center gap-3 px-3 py-2"
    >
      {series.imageUrl ? (
        <img
          src={series.imageUrl}
          alt={series.title}
          className="h-10 w-7 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-7 items-center justify-center rounded bg-muted">
          <Film className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-medium">{series.title}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {series.releaseYear && <span>{series.releaseYear}</span>}
          {series.genre.length > 0 && (
            <span>{series.genre.slice(0, 2).join(", ")}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
        <span>{series.score.toFixed(1)}</span>
      </div>
    </CommandItem>
  );
}
