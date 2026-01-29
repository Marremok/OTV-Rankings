import { Loader2 } from "lucide-react";

export default function SeriesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="relative h-[70vh] min-h-125 max-h-200 w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

        {/* Loading Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading series...</span>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="max-w-5xl mx-auto">
            <div className="h-8 w-24 bg-white/10 rounded-full mb-4" />
            <div className="h-16 w-96 bg-white/10 rounded-lg mb-4" />
            <div className="flex gap-4 mb-6">
              <div className="h-6 w-20 bg-white/10 rounded" />
              <div className="h-6 w-24 bg-white/10 rounded" />
              <div className="h-6 w-16 bg-white/10 rounded" />
            </div>
            <div className="h-16 w-40 bg-white/10 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-12">
          <div className="h-6 w-20 bg-muted rounded mb-4" />
          <div className="h-4 w-full max-w-2xl bg-muted rounded mb-2" />
          <div className="h-4 w-3/4 max-w-xl bg-muted rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}
