"use client";

import { ArrowLeft, User, Clapperboard } from "lucide-react";
import Link from "next/link";

interface CharacterHeaderProps {
  name: string;
  posterUrl?: string | null;
  ranking?: number;
  actorName?: string | null;
  series?: {
    title: string;
    slug?: string | null;
    imageUrl?: string | null;
    releaseYear?: number | null;
  } | null;
}

export function CharacterHeader({ name, posterUrl, ranking, actorName, series }: CharacterHeaderProps) {
  return (
    <section className="relative py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/rankings/characters"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft className="size-4" />
          Back to Characters
        </Link>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Portrait poster */}
          <div className="shrink-0 w-64 md:w-72">
            <div className="relative aspect-2/3 rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl shadow-black/40">
              {posterUrl ? (
                <img src={posterUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="size-24 text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Info: series breadcrumb, name, ranking badge, series card */}
          <div className="flex-1 space-y-6">
            {/* Series breadcrumb */}
            {series && (
              <Link
                href={series.slug ? `/series/${series.slug}` : "#"}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 hover:text-primary transition-colors"
              >
                {series.title}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              {name}
            </h1>

            {/* Ranking badge */}
            {ranking && ranking > 0 && (
              <div className="inline-block">
                <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-lg shadow-primary/25">
                  #{ranking} Ranked
                </span>
              </div>
            )}

            <div className="h-px w-24 bg-linear-to-r from-primary/60 to-transparent" />

            {/* Series card */}
            {series && (
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">From Series</p>
                <Link
                  href={series.slug ? `/series/${series.slug}` : "#"}
                  className="group inline-flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    {series.imageUrl ? (
                      <img src={series.imageUrl} alt={series.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <span className="text-zinc-600 text-xs">TV</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{series.title}</p>
                    {series.releaseYear && (
                      <p className="text-xs text-zinc-500">{series.releaseYear}</p>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Actor card */}
            {actorName && (
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">Portrayed By</p>
                <div className="inline-flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <Clapperboard className="size-4 text-zinc-500" />
                  </div>
                  <p className="font-semibold text-zinc-200">{actorName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
