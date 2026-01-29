import { ArrowRight, LucideIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardTitle } from "../ui/card";
import Link from "next/link";
import { useGetTop10Series } from "@/hooks/use-rankings";
import { cn } from "@/lib/utils";

export type RankingType = "series" | "characters" | "seasons" | "episodes";

type SectionHeaderProps = {
  title: string
  icon: LucideIcon
  slug: string
  rankingType: RankingType
}

const TYPE_LABELS: Record<RankingType, string> = {
  series: "series",
  characters: "characters",
  seasons: "seasons",
  episodes: "episodes",
};

export default function RankingSection({ title, icon: Icon, slug, rankingType }: SectionHeaderProps) {
  // Only fetch series data when the section is for series
  const {
    data: series = [],
    isLoading: seriesLoading,
    isError: seriesError,
  } = useGetTop10Series();

  const isSeriesType = rankingType === "series";

  return (
    <Card className="bg-background border-none w-full mb-5">
      <div className="inline-flex items-center justify-between bg-linear-to-br from-primary/7 via-primary/4
      to-background rounded-4xl border border-primary/10 w-fit p-3">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <Icon />
          {title}
        </CardTitle>
        <div className="pl-10 items-end">
          <Link href={`/rankings/${slug}`} className="inline-flex gap-2">
            View All
            <ArrowRight />
          </Link>
        </div>
      </div>
      <CardContent>
        {/* Series type — uses existing fetch hook */}
        {isSeriesType && seriesLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {isSeriesType && seriesError && (
          <p className="text-destructive py-8 text-center">Failed to load series.</p>
        )}
        {isSeriesType && !seriesLoading && !seriesError && series.length === 0 && (
          <p className="text-muted-foreground py-8 text-center">No {TYPE_LABELS[rankingType]} added yet</p>
        )}
        {isSeriesType && series.length > 0 && (
          <div className="flex space-x-4">
            {series.slice(0, 6).map((s, index) => (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                className="group relative w-36 sm:w-40 shrink-0 cursor-pointer flex flex-col gap-3"
              >
                {/* Image container */}
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-250 group-hover:shadow-lg group-hover:-translate-y-0.4">
                  <img
                    src={s.imageUrl ?? undefined}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                  {/* Ranking bookmark */}
                  <div className="absolute top-0 left-3">
                    <div className="relative flex h-8 w-6 items-center justify-center bg-primary shadow-md rounded-b-sm">
                      <span className="text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="absolute bottom-2 right-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:bg-black/90 dark:ring-white/10">
                      <span className={cn(
                        "text-xs font-bold transition-colors",
                        s.score > 9.7 && "text-sky-500 dark:text-sky-400 font-black",
                        s.score >= 9.0 && s.score <= 9.7 && "text-emerald-700 dark:text-emerald-500",
                        s.score < 9.0 && "text-ring"
                      )}>
                        {s.score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & genres */}
                <div className="space-y-1 px-1">
                  <h3 className="text-me font-semibold leading-tight text-foreground line-clamp-2 group-hover:underline decoration-2 underline-offset-4 decoration-primary/50">
                    {s.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {s.genre?.slice(0, 2).map((genre, i) => (
                      <span
                        key={i}
                        className="
                          inline-flex items-center
                          px-1.5 py-0.5
                          rounded-md
                          text-[10px] font-semibold tracking-tight
                          bg-muted/80 text-muted-foreground
                          dark:bg-secondary/40 dark:text-secondary-foreground
                          border border-border/40
                          backdrop-blur-[2px]
                          transition-all group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20
                        "
                      >
                        {genre}
                      </span>
                    ))}
                    {s.genre?.length > 2 && (
                      <span className="text-[10px] text-muted-foreground/60 self-center ml-0.5">
                        +{s.genre.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* View All arrow card */}
            <Link
              href={`/rankings/${slug}`}
              className="flex flex-col items-center justify-center shrink-0 w-36 sm:w-40 rounded-xl border border-border/60 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group/viewall"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover/viewall:bg-primary/20 transition-colors">
                <ArrowRight className="size-7 text-primary transition-transform group-hover/viewall:translate-x-1" />
              </div>
              <span className="mt-3 text-sm font-semibold text-muted-foreground group-hover/viewall:text-primary transition-colors">
                View All
              </span>
            </Link>
          </div>
        )}

        {/* Non-series types — placeholder until fetch hooks are implemented */}
        {!isSeriesType && (
          <p className="text-muted-foreground py-8 text-center">No {TYPE_LABELS[rankingType]} added yet</p>
        )}
      </CardContent>
    </Card>
  );
}
