"use client";

import Link from "next/link";
import { Tv, ImageIcon, Star } from "lucide-react";

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  slug?: string | null;
  heroImageUrl?: string | null;
  score: number;
}

interface SeasonEpisodeListProps {
  episodes: Episode[];
  seasonOrder: number;
}

export function SeasonEpisodeList({ episodes, seasonOrder }: SeasonEpisodeListProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 pb-16">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-100">
        <Tv className="h-5 w-5 text-primary" />
        Episodes
        <span className="text-sm font-normal text-zinc-400">({episodes.length})</span>
      </h2>

      {episodes.length === 0 ? (
        <p className="text-zinc-500 text-sm">No episodes added yet.</p>
      ) : (
        <div className="space-y-2">
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              href={episode.slug ? `/episodes/${episode.slug}` : "#"}
              className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-600 hover:bg-zinc-800/50 transition-colors"
            >
              {episode.heroImageUrl ? (
                <img
                  src={episode.heroImageUrl}
                  alt={episode.title}
                  className="h-12 w-20 rounded object-cover shrink-0"
                />
              ) : (
                <div className="flex h-12 w-20 items-center justify-center rounded bg-zinc-800 shrink-0">
                  <ImageIcon className="h-5 w-5 text-zinc-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-zinc-100">{episode.title}</p>
                <p className="text-xs text-zinc-400">
                  S{seasonOrder}E{episode.episodeNumber}
                </p>
              </div>

              {episode.score > 0 && (
                <div className="flex items-center gap-1 text-sm shrink-0">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-zinc-300">{episode.score.toFixed(1)}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
