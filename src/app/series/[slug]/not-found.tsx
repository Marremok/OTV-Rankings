import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function SeriesNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold tracking-tight mb-3">Series Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The series you're looking for doesn't exist or may have been removed.
        </p>

        {/* Action */}
        <Link
          href="/rankings/tv-series"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Browse All Series
        </Link>
      </div>
    </div>
  );
}
